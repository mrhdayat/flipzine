# 🚀 FLIPZINE - Supabase Setup Guide

## 📋 Langkah Setup Supabase

### 1️⃣ Buat Project Supabase

1. Buka [supabase.com](https://supabase.com)
2. Sign in / Sign up
3. Klik **"New Project"**
4. Isi form:
   - **Name**: `flipzine` (atau nama lain)
   - **Database Password**: Buat password yang kuat (SIMPAN!)
   - **Region**: Pilih `Southeast Asia (Singapore)` atau terdekat
   - **Pricing Plan**: Free
5. Klik **"Create new project"**
6. Tunggu ~2 menit sampai project selesai dibuat

---

### 2️⃣ Dapatkan API Keys

1. Di dashboard project, klik **Settings** (⚙️) di sidebar kiri
2. Klik **API**
3. Copy 2 nilai ini:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (key panjang)

4. Buka file `.env.local` di project Anda
5. Update dengan nilai yang baru:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3️⃣ Run SQL Migration

1. Di dashboard Supabase, klik **SQL Editor** di sidebar kiri
2. Klik **"New query"**
3. Copy SELURUH isi file `supabase/migrations/001_initial_schema.sql`
4. Paste ke SQL Editor
5. Klik **"Run"** atau tekan `Cmd/Ctrl + Enter`
6. Tunggu sampai muncul **"Success. No rows returned"**

**✅ Ini akan membuat:**
- Table `profiles` (user profiles dengan role)
- Table `magazines` (data magazine)
- Table `pages` (halaman magazine)
- RLS policies (keamanan)
- Trigger untuk auto-create profile

---

### 4️⃣ Buat Storage Buckets

#### Bucket 1: magazine-pages (PUBLIC)

1. Di dashboard Supabase, klik **Storage** di sidebar kiri
2. Klik **"New bucket"**
3. Isi:
   - **Name**: `magazine-pages`
   - **Public bucket**: ✅ **CENTANG INI** (penting!)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: `image/*`
4. Klik **"Create bucket"**

#### Bucket 2: magazine-drafts (PRIVATE)

1. Klik **"New bucket"** lagi
2. Isi:
   - **Name**: `magazine-drafts`
   - **Public bucket**: ❌ **JANGAN CENTANG** (private)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: `image/*,application/pdf`
3. Klik **"Create bucket"**

---

### 5️⃣ Setup Storage Policies (PENTING!)

#### Untuk bucket `magazine-pages`:

1. Di Storage, klik bucket **magazine-pages**
2. Klik tab **"Policies"**
3. Klik **"New Policy"**
4. Pilih **"For full customization"**
5. Buat 2 policies:

**Policy 1: Public Read**
- **Policy name**: `Public read access`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**: `true`
- **WITH CHECK expression**: (kosongkan)

**Policy 2: Admin/Editor Write**
- **Policy name**: `Admin and editor write access`
- **Allowed operation**: `INSERT`, `UPDATE`, `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
(SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
```
- **WITH CHECK expression**: (sama seperti USING)

#### Untuk bucket `magazine-drafts`:

1. Klik bucket **magazine-drafts**
2. Klik tab **"Policies"**
3. Buat 1 policy:

**Policy: Admin/Editor Only**
- **Policy name**: `Admin and editor full access`
- **Allowed operation**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
(SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
```
- **WITH CHECK expression**: (sama seperti USING)

---

### 6️⃣ Restart Dev Server

```bash
# Stop dev server (Ctrl+C)
# Lalu jalankan lagi:
npm run dev
```

---

### 7️⃣ Test Setup

1. Buka `http://localhost:3000`
2. Klik **"Login"**
3. Klik **"Register here"**
4. Buat akun admin pertama:
   - **Full Name**: Nama Anda
   - **Email**: email@anda.com
   - **Password**: password123 (atau lebih kuat)
5. Klik **"Create Account"**
6. Login dengan akun yang baru dibuat
7. Anda akan masuk ke **Admin Dashboard**! 🎉

---

## ✅ Checklist Setup

- [ ] Project Supabase dibuat
- [ ] API keys di-copy ke `.env.local`
- [ ] SQL migration di-run (3 tables dibuat)
- [ ] Bucket `magazine-pages` dibuat (PUBLIC)
- [ ] Bucket `magazine-drafts` dibuat (PRIVATE)
- [ ] Storage policies di-setup
- [ ] Dev server di-restart
- [ ] Akun admin pertama dibuat
- [ ] Bisa akses admin dashboard

---

## 🆘 Troubleshooting

**Error: "Bucket not found"**
- Pastikan bucket `magazine-pages` dan `magazine-drafts` sudah dibuat
- Cek nama bucket harus PERSIS sama (lowercase, dengan dash)

**Error: "Row Level Security policy violation"**
- Pastikan storage policies sudah di-setup dengan benar
- Cek role user di table `profiles` harus `admin` atau `editor`

**Error: "Invalid API key"**
- Pastikan `.env.local` sudah di-update dengan key yang benar
- Restart dev server setelah update `.env.local`

**User pertama tidak jadi admin**
- Cek di Supabase Dashboard → **Table Editor** → **profiles**
- Edit row user pertama, set `role` = `admin`

---

## 📞 Need Help?

Jika ada error atau stuck di langkah manapun, screenshot error-nya dan saya akan bantu! 😊
