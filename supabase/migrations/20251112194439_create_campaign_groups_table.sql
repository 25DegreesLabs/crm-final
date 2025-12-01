/*
  # Create campaign_groups junction table

  ## Overview
  Creates a many-to-many relationship between campaigns and user WhatsApp groups.
  This allows campaigns to target specific WhatsApp groups for lead filtering.

  ## Tables Created
    - `campaign_groups`
      - `id` (uuid, primary key) - Unique identifier
      - `campaign_id` (uuid, foreign key) - References campaigns table
      - `group_id` (uuid, foreign key) - References user_whatsapp_groups table
      - `created_at` (timestamptz) - When the association was created

  ## Security
    - Enable RLS on campaign_groups table
    - Add policy for authenticated users to read their own campaign groups
    - Add policy for authenticated users to create campaign groups
    - Add policy for authenticated users to delete their own campaign groups

  ## Constraints
    - Foreign key constraint on campaign_id
    - Foreign key constraint on group_id
    - Unique constraint on (campaign_id, group_id) to prevent duplicates
    - Cascade delete when campaign or group is deleted
*/

-- Create campaign_groups junction table
CREATE TABLE IF NOT EXISTS campaign_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  group_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES user_whatsapp_groups(id) ON DELETE CASCADE,
  CONSTRAINT unique_campaign_group UNIQUE (campaign_id, group_id)
);

-- Enable Row Level Security
ALTER TABLE campaign_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_groups
CREATE POLICY "Users can view their own campaign groups"
  ON campaign_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_groups.campaign_id
      AND campaigns.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create campaign groups"
  ON campaign_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_groups.campaign_id
      AND campaigns.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own campaign groups"
  ON campaign_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_groups.campaign_id
      AND campaigns.user_id = auth.uid()::text
    )
  );

-- Allow public access for default_user (when auth is disabled)
CREATE POLICY "Allow public read for default_user"
  ON campaign_groups
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_groups.campaign_id
      AND campaigns.user_id = 'default_user'
    )
  );

CREATE POLICY "Allow public insert for default_user"
  ON campaign_groups
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_groups.campaign_id
      AND campaigns.user_id = 'default_user'
    )
  );

CREATE POLICY "Allow public delete for default_user"
  ON campaign_groups
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_groups.campaign_id
      AND campaigns.user_id = 'default_user'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_groups_campaign_id ON campaign_groups(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_group_id ON campaign_groups(group_id);
