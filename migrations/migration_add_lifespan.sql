-- Migration: Add QR Lifespan Fields
-- Run this in your Supabase SQL Editor
-- Date: 2026-01-08

-- Add max_scans column (nullable - existing QRs won't have a limit)
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS max_scans INTEGER;

-- Add expires_at column (nullable - existing QRs won't have expiry)
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add fallback_url column (nullable - optional fallback after expiry)
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS fallback_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN qr_codes.max_scans IS 'Maximum number of scans before QR expires. NULL means unlimited.';
COMMENT ON COLUMN qr_codes.expires_at IS 'Timestamp when QR expires. NULL means no time limit.';
COMMENT ON COLUMN qr_codes.fallback_url IS 'URL to redirect to after QR expires. NULL means show expired page.';
