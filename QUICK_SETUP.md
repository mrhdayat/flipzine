# 🚀 FLIPZINE - Quick Supabase Setup (Copy-Paste)

## ⚡ Super Cepat - 3 Langkah Saja!

### 1️⃣ Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → Sign in
2. Klik **"New Project"**
3. Isi form:
   - **Name**: `flipzine`
   - **Database Password**: Buat password kuat (SIMPAN!)
   - **Region**: `Southeast Asia (Singapore)`
4. Klik **"Create new project"**
5. Tunggu ~2 menit

---

### 2️⃣ Copy API Keys

1. Di dashboard, klik **Settings** (⚙️) → **API**
2. Copy 2 nilai ini:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Buka `.env.local` di project, update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3️⃣ Run SQL (COPY-PASTE)

1. Di dashboard Supabase, klik **SQL Editor**
2. Klik **"New query"**
3. **Copy SELURUH isi file** `supabase/COMPLETE_SETUP.sql`
4. **Paste** ke SQL Editor
5. Klik **"Run"** atau `Cmd/Ctrl + Enter`
6. Tunggu sampai **"Success"** ✅

---

## ✅ SELESAI!

Sekarang:

```bash
# Restart dev server
npm run dev
```

Lalu:
1. Buka `http://localhost:3000`
2. Klik **"Login"** → **"Register here"**
3. Buat akun admin pertama
4. Login → Masuk ke Admin Dashboard! 🎉

---

## 📁 File SQL

File lengkap ada di: **`supabase/COMPLETE_SETUP.sql`**

File ini sudah include SEMUA:
- ✅ Tables (profiles, magazines, pages)
- ✅ RLS Policies
- ✅ Storage Buckets (magazine-pages, magazine-drafts)
- ✅ Storage Policies
- ✅ Triggers & Functions
- ✅ Indexes

**Tinggal copy-paste 1x saja!** 🚀

---

## 🆘 Troubleshooting

**Error saat run SQL?**
- Pastikan project Supabase sudah selesai dibuat (tidak loading)
- Coba refresh page SQL Editor
- Pastikan copy SELURUH isi file (dari baris pertama sampai terakhir)

**Bucket tidak muncul?**
- Cek di **Storage** sidebar
- Jika tidak ada, SQL mungkin gagal di bagian storage
- Buat manual: Storage → New bucket → `magazine-pages` (public) & `magazine-drafts` (private)

**User pertama bukan admin?**
- Buka **Table Editor** → **profiles**
- Edit row user pertama
- Set `role` = `admin`
- Save

---

Selamat! FLIPZINE Anda siap digunakan! 🎨✨
