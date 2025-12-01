-- ADD_LABEL_ARCHIVE_FUNCTIONALITY.sql
-- Migration to add archive functionality to user_label_mappings table
-- This allows labels to be archived (soft delete) instead of hard deleted
-- Archived labels are blocked from upload processing

-- =============================================
-- STEP 1: Add is_active column to user_label_mappings
-- =============================================
ALTER TABLE user_label_mappings
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Set all existing labels to active (default true already handles this, but being explicit)
UPDATE user_label_mappings
SET is_active = true
WHERE is_active IS NULL;

-- Add index for performance on is_active queries
CREATE INDEX IF NOT EXISTS idx_user_label_mappings_is_active
ON user_label_mappings(user_id, is_active);

-- =============================================
-- STEP 2: Update update_leads_from_labels RPC function
-- =============================================
-- This function now ONLY processes ACTIVE labels (is_active = true)
-- Archived labels are completely skipped during label upload processing

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS update_leads_from_labels(jsonb);

-- Create the updated function
CREATE FUNCTION update_leads_from_labels(label_data jsonb)
RETURNS TABLE(
  processed_count integer,
  skipped_count integer,
  error_count integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  processed integer := 0;
  skipped integer := 0;
  errors integer := 0;
  phone_number text;
  label_name text;
  mapping record;
BEGIN
  -- Loop through each phone number in the uploaded label data
  FOR phone_number, label_name IN
    SELECT key, value::text
    FROM jsonb_each_text(label_data)
  LOOP
    BEGIN
      -- Look up the label mapping (ONLY active labels)
      SELECT
        whatsapp_label_name,
        crm_segment,
        crm_status,
        engagement_level,
        is_active
      INTO mapping
      FROM user_label_mappings
      WHERE user_id::text = '00000000-0000-0000-0000-000000000001'
        AND whatsapp_label_name = label_name
        AND is_active = true;  -- CRITICAL: Only process active labels

      -- If label is not found OR is archived, skip this contact
      IF NOT FOUND THEN
        skipped := skipped + 1;
        CONTINUE;
      END IF;

      -- Update the lead with the mapped values from the active label
      UPDATE leads
      SET
        segment = mapping.crm_segment,
        status = mapping.crm_status,
        engagement_level = mapping.engagement_level,
        updated_at = NOW()
      WHERE phone = phone_number
        AND user_id::text = '00000000-0000-0000-0000-000000000001';

      -- If lead was updated, increment processed count
      IF FOUND THEN
        processed := processed + 1;
      ELSE
        -- Lead doesn't exist in database
        skipped := skipped + 1;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      -- Log errors but continue processing
      errors := errors + 1;
      RAISE WARNING 'Error processing phone % with label %: %', phone_number, label_name, SQLERRM;
    END;
  END LOOP;

  -- Return summary counts
  RETURN QUERY SELECT processed, skipped, errors;
END;
$$;

-- =============================================
-- STEP 3: Add helpful comments
-- =============================================
COMMENT ON COLUMN user_label_mappings.is_active IS
  'Whether this label mapping is active. Archived (is_active = false) labels are excluded from upload processing.';

COMMENT ON FUNCTION update_leads_from_labels IS
  'Processes uploaded WhatsApp label data and updates lead records. Only processes ACTIVE labels (is_active = true). Archived labels are skipped.';

-- =============================================
-- VERIFICATION QUERY (Run after migration)
-- =============================================
-- SELECT
--   whatsapp_label_name,
--   crm_segment,
--   crm_status,
--   engagement_level,
--   is_active,
--   created_at
-- FROM user_label_mappings
-- WHERE user_id::text = '00000000-0000-0000-0000-000000000001'
-- ORDER BY created_at DESC;
