-- =====================================================
-- FLIPZINE - COMPLETE SUPABASE SETUP (ALL-IN-ONE)
-- =====================================================
-- Copy dan paste SELURUH file ini ke Supabase SQL Editor
-- Lalu klik RUN atau tekan Cmd/Ctrl + Enter
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazines table
CREATE TABLE IF NOT EXISTS magazines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  magazine_id UUID REFERENCES magazines(id) ON DELETE CASCADE NOT NULL,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(magazine_id, page_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_magazines_slug ON magazines(slug);
CREATE INDEX IF NOT EXISTS idx_magazines_published ON magazines(published);
CREATE INDEX IF NOT EXISTS idx_pages_magazine_id ON pages(magazine_id);
CREATE INDEX IF NOT EXISTS idx_pages_page_number ON pages(magazine_id, page_number);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Magazines policies
CREATE POLICY "Published magazines are viewable by everyone"
  ON magazines FOR SELECT
  USING (published = true OR auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins and editors can insert magazines"
  ON magazines FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins and editors can update magazines"
  ON magazines FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins can delete magazines"
  ON magazines FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Pages policies
CREATE POLICY "Pages of published magazines are viewable by everyone"
  ON pages FOR SELECT
  USING (
    magazine_id IN (
      SELECT id FROM magazines WHERE published = true
    )
    OR auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins and editors can insert pages"
  ON pages FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins and editors can update pages"
  ON pages FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins and editors can delete pages"
  ON pages FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  ));

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_magazines_updated_at
  BEFORE UPDATE ON magazines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create magazine-pages bucket (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'magazine-pages',
  'magazine-pages',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create magazine-drafts bucket (PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'magazine-drafts',
  'magazine-drafts',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- magazine-pages bucket policies (PUBLIC READ)
CREATE POLICY "Public can view magazine pages"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'magazine-pages');

CREATE POLICY "Admins and editors can upload magazine pages"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'magazine-pages' AND
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins and editors can update magazine pages"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'magazine-pages' AND
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins and editors can delete magazine pages"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'magazine-pages' AND
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
  );

-- magazine-drafts bucket policies (PRIVATE)
CREATE POLICY "Admins and editors can manage drafts"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'magazine-drafts' AND
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
  );

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Sekarang Anda bisa:
-- 1. Update .env.local dengan Supabase URL & API key
-- 2. Restart dev server: npm run dev
-- 3. Register akun admin pertama di /register
-- 4. Mulai upload magazine!
-- =====================================================
