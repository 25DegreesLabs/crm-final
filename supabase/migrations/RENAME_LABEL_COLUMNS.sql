-- =============================================
-- RENAME LABEL MAPPING COLUMNS
-- =============================================
-- Purpose: Rename columns to be more descriptive
-- Old names: label_name, target_segment, target_status
-- New names: whatsapp_label_name, crm_segment, crm_status
-- =============================================

-- STEP 1: Rename columns
ALTER TABLE user_label_mappings
  RENAME COLUMN label_name TO whatsapp_label_name;

ALTER TABLE user_label_mappings
  RENAME COLUMN target_segment TO crm_segment;

ALTER TABLE user_label_mappings
  RENAME COLUMN target_status TO crm_status;

-- =============================================
-- STEP 2: Update RPC function to use new column names
-- =============================================

-- Drop existing function
DROP FUNCTION IF EXISTS update_leads_from_labels(jsonb);

-- Recreate with new column names
CREATE FUNCTION update_leads_from_labels(labels_data JSONB)
RETURNS TABLE(leads_updated INT) AS $$
DECLARE
  label_record RECORD;
  mapping RECORD;
  updated_count INT := 0;
  default_user_uuid CONSTANT uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  FOR label_record IN SELECT * FROM jsonb_to_recordset(labels_data) AS (
    phone TEXT,
    label TEXT
  ) LOOP
    -- Look up label mapping (ONLY active labels, use NEW column names)
    SELECT crm_segment, crm_status, COALESCE(engagement_level, 'NONE') as engagement_level
    INTO mapping
    FROM user_label_mappings
    WHERE LOWER(whatsapp_label_name) = LOWER(label_record.label)
    AND user_id::text = default_user_uuid::text
    AND is_active = true  -- CRITICAL: Only process active labels
    LIMIT 1;

    IF mapping IS NOT NULL THEN
      -- Update lead with segment, status, and engagement
      UPDATE leads
      SET
        segment = mapping.crm_segment,
        status = mapping.crm_status,
        engagement_level = mapping.engagement_level,
        reply_received = (mapping.engagement_level = 'ENGAGED'),
        updated_at = NOW()
      WHERE phone = label_record.phone
      AND user_id = default_user_uuid;

      IF FOUND THEN
        updated_count := updated_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT updated_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check columns were renamed
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_label_mappings'
AND column_name IN ('whatsapp_label_name', 'crm_segment', 'crm_status', 'is_active', 'engagement_level')
ORDER BY column_name;

-- Expected result: Should show all 5 columns

-- Check all labels with new column names
SELECT
  whatsapp_label_name,
  crm_segment,
  crm_status,
  engagement_level,
  is_active
FROM user_label_mappings
WHERE user_id::text = '00000000-0000-0000-0000-000000000001'
ORDER BY whatsapp_label_name;

-- Expected result:
-- | whatsapp_label_name | crm_segment | crm_status      | engagement_level | is_active |
-- |---------------------|-------------|-----------------|------------------|-----------|
-- | leads               | COLD        | NEW             | NONE             | true      |
-- | No follow up        | null        | NOT_INTERESTED  | DISENGAGED       | true      |
-- | on going            | HOT         | ACTIVE          | ENGAGED          | true      |
-- | Past Clients        | WARM        | INACTIVE        | ENGAGED          | true      |
