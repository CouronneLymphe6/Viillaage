-- Migration: Add Constitution Acceptance to User table
-- Date: 2025-12-15
-- Description: Adds acceptedConstitution and constitutionAcceptedAt fields to track Constitution acceptance

-- Add the new columns to the User table
ALTER TABLE "User" 
ADD COLUMN "acceptedConstitution" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "constitutionAcceptedAt" TIMESTAMP(3);

-- Optional: Add a comment to document the change
COMMENT ON COLUMN "User"."acceptedConstitution" IS 'Indicates if user has accepted the Constitution de Viillaage';
COMMENT ON COLUMN "User"."constitutionAcceptedAt" IS 'Timestamp when user accepted the Constitution de Viillaage';
