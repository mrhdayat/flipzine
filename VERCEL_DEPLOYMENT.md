# Deploy FLIPZINE ke Vercel - Panduan Lengkap

Panduan step-by-step untuk deploy aplikasi FLIPZINE ke Vercel.

## 📋 Prerequisites

Sebelum deploy, pastikan Anda sudah punya:

- ✅ Akun GitHub (untuk push code)
- ✅ Akun Vercel ([vercel.com](https://vercel.com))
- ✅ Supabase project yang sudah setup
- ✅ Code sudah di-push ke GitHub repository

## 🚀 Langkah 1: Persiapan Code

### 1.1 Pastikan Code Sudah di GitHub

```bash
# Cek remote repository
git remote -v

# Jika belum ada, tambahkan
git remote add origin https://github.com/mrhdayat/flipzine.git

# Push code
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 Verifikasi File Penting

Pastikan file-file ini ada di repository:

- ✅ `package.json` - Dependencies
- ✅ `next.config.ts` - Next.js configuration
- ✅ `.env.example` - Template environment variables
- ✅ `.gitignore` - Ignore `.env.local`

## 🌐 Langkah 2: Deploy ke Vercel

### 2.1 Login ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Click **"Sign Up"** atau **"Login"**
3. Login dengan GitHub account

### 2.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Pilih **"Import Git Repository"**
3. Cari repository `flipzine`
4. Click **"Import"**

### 2.3 Configure Project

#### Framework Preset
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `.next` (auto)

#### Environment Variables

Click **"Environment Variables"** dan tambahkan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Cara mendapatkan nilai:**

1. **NEXT_PUBLIC_SUPABASE_URL**:
   - Buka Supabase Dashboard
   - Go to **Project Settings** → **API**
   - Copy **Project URL**

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Di halaman yang sama
   - Copy **anon/public key**

3. **NEXT_PUBLIC_APP_URL**:
   - Untuk sementara isi: `https://your-app.vercel.app`
   - Nanti akan diupdate setelah deploy

### 2.4 Deploy

1. Click **"Deploy"**
2. Tunggu proses build (~2-3 menit)
3. Jika berhasil, akan muncul confetti 🎉

## 🔧 Langkah 3: Post-Deployment Configuration

### 3.1 Update Environment Variable

Setelah deploy, Vercel akan memberikan URL (e.g., `flipzine-xxx.vercel.app`):

1. Go to **Project Settings** → **Environment Variables**
2. Edit `NEXT_PUBLIC_APP_URL`
3. Ganti dengan URL Vercel Anda
4. Click **"Save"**
5. **Redeploy** (Settings → Deployments → ... → Redeploy)

### 3.2 Setup Custom Domain (Opsional)

Jika punya domain sendiri:

1. Go to **Project Settings** → **Domains**
2. Click **"Add"**
3. Masukkan domain (e.g., `flipzine.com`)
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_APP_URL` dengan domain baru

### 3.3 Update Supabase Redirect URLs

Untuk authentication bekerja:

1. Buka Supabase Dashboard
2. Go to **Authentication** → **URL Configuration**
3. Tambahkan di **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/*
   ```
4. Tambahkan di **Site URL**:
   ```
   https://your-app.vercel.app
   ```

## ✅ Langkah 4: Verifikasi Deployment

### 4.1 Test Homepage

1. Buka `https://your-app.vercel.app`
2. Pastikan homepage load dengan benar
3. Check console untuk errors

### 4.2 Test Authentication

1. Go to `/register`
2. Buat test account
3. Login di `/login`
4. Pastikan redirect ke `/admin` berhasil

### 4.3 Test Magazine Viewer

1. Buat magazine di admin panel
2. Upload beberapa pages
3. Publish magazine
4. Buka `/magazine/your-slug`
5. Test page flip interaction

### 4.4 Test Image Upload

1. Upload PDF atau images
2. Pastikan images muncul di Supabase Storage
3. Verify images load di viewer

## 🐛 Troubleshooting

### Error: "Module not found"

**Problem**: Dependencies tidak terinstall

**Solution**:
```bash
# Pastikan package.json lengkap
npm install

# Push ulang
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

### Error: "Environment variable not found"

**Problem**: Environment variables tidak di-set

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Pastikan semua variables ada
3. Redeploy

### Error: "Build failed"

**Problem**: TypeScript errors atau build issues

**Solution**:
```bash
# Test build locally
npm run build

# Fix errors yang muncul
# Push fix
git push origin main
```

### Error: "Images not loading"

**Problem**: CORS atau Supabase storage issues

**Solution**:
1. Pastikan Supabase storage bucket `magazine-pages` **Public**
2. Check CORS settings di Supabase
3. Verify environment variables benar

### Error: "Authentication not working"

**Problem**: Redirect URLs tidak di-set

**Solution**:
1. Update Supabase redirect URLs (lihat step 3.3)
2. Pastikan `NEXT_PUBLIC_APP_URL` benar
3. Clear browser cookies dan coba lagi

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Go to **Analytics** tab
2. Monitor:
   - Page views
   - Load times
   - Error rates

### Vercel Logs

1. Go to **Deployments** → Click deployment
2. View **Build Logs** untuk build issues
3. View **Function Logs** untuk runtime errors

## 🔄 Update Deployment

### Auto-Deploy (Recommended)

Setiap kali push ke GitHub, Vercel akan auto-deploy:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel akan auto-deploy
```

### Manual Deploy

1. Go to Vercel Dashboard
2. Click **"Deployments"**
3. Click **"..."** → **"Redeploy"**

## 🎯 Production Checklist

Sebelum production, pastikan:

- [ ] Environment variables sudah benar
- [ ] Supabase redirect URLs sudah di-set
- [ ] Custom domain sudah dikonfigurasi (jika ada)
- [ ] Test authentication flow
- [ ] Test magazine creation & viewing
- [ ] Test PDF upload
- [ ] Check performance (Lighthouse score)
- [ ] Enable Vercel Analytics
- [ ] Setup error monitoring

## 💡 Tips & Best Practices

### 1. Use Preview Deployments

Setiap branch akan dapat preview URL:
- `main` → Production
- `dev` → Preview URL

### 2. Environment Variables per Environment

Gunakan different values untuk:
- **Production**: Real Supabase project
- **Preview**: Test Supabase project

### 3. Enable Automatic HTTPS

Vercel automatically provides SSL certificate.

### 4. Monitor Performance

Use Vercel Analytics untuk track:
- Core Web Vitals
- Page load times
- Error rates

### 5. Setup Notifications

Enable deployment notifications:
- Email
- Slack
- Discord

## 📞 Support

Jika ada masalah:

1. **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **GitHub Issues**: [github.com/mrhdayat/flipzine/issues](https://github.com/mrhdayat/flipzine/issues)

---

## 🎉 Selamat!

Aplikasi FLIPZINE Anda sekarang sudah live di Vercel! 🚀

**Next Steps**:
- Share URL dengan users
- Monitor analytics
- Collect feedback
- Iterate and improve

**Production URL**: `https://your-app.vercel.app`
