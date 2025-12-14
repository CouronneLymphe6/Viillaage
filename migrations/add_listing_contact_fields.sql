-- Migration: Add contact fields to Listing table
-- This adds optional phone and email fields for direct buyer-seller communication

ALTER TABLE "Listing" 
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Listing"."contactPhone" IS 'Optional phone number for direct contact';
COMMENT ON COLUMN "Listing"."contactEmail" IS 'Optional email for direct contact';
