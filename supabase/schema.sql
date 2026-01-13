-- ExpoStand AI Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'accepted', 'rejected', 'archived')),

  -- Contact
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,

  -- Company
  company_name TEXT NOT NULL,
  products_services TEXT,

  -- Exhibition
  exhibition_name TEXT,
  exhibition_date DATE,

  -- Stand specs
  area_sqm INTEGER,
  stand_type TEXT CHECK (stand_type IN ('linear', 'corner', 'peninsula', 'island')),
  staff_count INTEGER,

  -- Design preferences
  main_goal TEXT CHECK (main_goal IN ('brand_awareness', 'sales_increase', 'trade', 'prestige')),
  style TEXT CHECK (style IN ('hi-tech', 'classic', 'eco', 'minimal')),
  height_meters DECIMAL,
  has_suspended BOOLEAN DEFAULT FALSE,
  zones TEXT[],
  elements TEXT[],
  brand_colors TEXT,

  -- Budget & notes
  budget_range TEXT CHECK (budget_range IN ('under_5000', '5000_10000', '10000_20000', '20000_50000', 'over_50000')),
  special_requests TEXT,
  exclusions TEXT,

  -- Generated content
  generated_images TEXT[],
  selected_image_index INTEGER,

  -- Conversation log (JSONB)
  conversation_log JSONB,

  -- Admin fields
  quoted_price DECIMAL,
  admin_notes TEXT
);

-- Uploaded files table
CREATE TABLE IF NOT EXISTS inquiry_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  file_type TEXT CHECK (file_type IN ('logo', 'reference', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (simple auth for MVP)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_company_name ON inquiries(company_name);
CREATE INDEX IF NOT EXISTS idx_inquiry_files_inquiry_id ON inquiry_files(inquiry_id);

-- Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Public can insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Service role can do everything on inquiries" ON inquiries;
DROP POLICY IF EXISTS "Service role can do everything on inquiry_files" ON inquiry_files;
DROP POLICY IF EXISTS "Service role can do everything on admin_users" ON admin_users;

-- Policies for inquiries
CREATE POLICY "Public can insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can do everything on inquiries" ON inquiries
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for inquiry_files
CREATE POLICY "Service role can do everything on inquiry_files" ON inquiry_files
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for admin_users
CREATE POLICY "Service role can do everything on admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON inquiries TO service_role;
GRANT ALL ON inquiry_files TO service_role;
GRANT ALL ON admin_users TO service_role;
GRANT INSERT ON inquiries TO anon;
