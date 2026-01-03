# FLIPZINE - 3D Digital Magazine Platform

A production-ready 3D digital magazine flipbook platform built with Next.js, React Three Fiber, and Supabase. Create stunning interactive magazines with realistic page-flip animations.

![FLIPZINE](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-3D-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge)

## ✨ Features

- 🎨 **Dark Cinematic UI** - Premium glassmorphism design with smooth animations
- 📖 **3D Page Flip** - Realistic page-turning animations with physics
- 📤 **PDF Upload** - Auto-split PDF pages into images
- 🖼️ **Image Upload** - Support for JPG, PNG with compression
- 🔄 **Drag & Drop** - Reorder pages easily
- 🔐 **Authentication** - Secure admin access with Supabase Auth
- 📱 **Responsive** - Works on desktop and mobile
- ⚡ **Performance** - Optimized texture loading and lazy rendering
- 🔒 **RLS Security** - Row-level security policies
- 🚀 **Vercel Ready** - Deploy with one click

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **3D Graphics**: React Three Fiber, Three.js, @react-three/drei
- **Animations**: Framer Motion, @react-spring/three
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Storage)
- **PDF Processing**: PDF.js
- **Drag & Drop**: dnd-kit
- **File Upload**: react-dropzone

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd flipzine
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

3. Run the database migration:
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL

4. Create Storage Buckets:
   - Go to **Storage** in Supabase Dashboard
   - Create bucket: `magazine-pages` (Public)
   - Create bucket: `magazine-drafts` (Private)

5. Apply Storage Policies (see SQL comments in migration file)

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update `.env.local` with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Admin Account

1. Go to `/register`
2. Create your admin account
3. Login at `/login`
4. Access admin panel at `/admin`

## 📁 Project Structure

\`\`\`
flipzine/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (admin)/             # Admin CMS
│   │   └── admin/
│   │       ├── magazines/   # Magazine management
│   │       └── page.tsx     # Dashboard
│   ├── magazine/[slug]/     # Public flipbook viewer
│   ├── layout.tsx
│   ├── page.tsx             # Landing page
│   └── globals.css          # Dark theme styles
├── components/
│   ├── flipbook/            # 3D viewer components
│   │   ├── FlipbookViewer.tsx
│   │   └── FlipbookScene.tsx
│   ├── admin/               # Admin components
│   │   └── PageManager.tsx
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── supabase/            # Supabase clients
│   └── utils/               # Utilities (PDF processor, etc.)
├── supabase/
│   └── migrations/          # Database schema
└── public/
\`\`\`

## 🎯 Usage

### Creating a Magazine

1. Login to admin panel
2. Click **"New Magazine"**
3. Enter title, slug, and description
4. Upload PDF or images
5. Reorder pages with drag & drop
6. Click **"Publish"** to make it live

### Viewing a Magazine

- Public URL: `/magazine/your-slug`
- Use arrow keys or buttons to navigate
- Press `F` for fullscreen
- Zoom in/out with controls

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
4. Deploy!

### Environment Variables for Production

Update `NEXT_PUBLIC_APP_URL` to your production domain:

\`\`\`env
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Admin-only** access to CMS
- **Public read** for published magazines only
- **Signed URLs** for storage access
- **Middleware** protection for admin routes

## 🎨 Customization

### Theme Colors

Edit `app/globals.css` to customize colors:

\`\`\`css
:root {
  --primary: #a855f7;      /* Purple */
  --secondary: #3b82f6;    /* Blue */
  --accent: #f59e0b;       /* Amber */
  /* ... */
}
\`\`\`

### Page Flip Animation

Adjust animation in `components/flipbook/FlipbookScene.tsx`:

\`\`\`typescript
const { rotationY } = useSpring({
  rotationY: isPastPage ? -Math.PI : 0,
  config: { tension: 120, friction: 30 }, // Adjust these
})
\`\`\`

## 📝 Database Schema

### Tables

- **profiles** - User profiles with roles
- **magazines** - Magazine metadata
- **pages** - Individual page data

### Storage Buckets

- **magazine-pages** - Public page images
- **magazine-drafts** - Private draft files

See `supabase/migrations/001_initial_schema.sql` for full schema.

## 🐛 Troubleshooting

### PDF Upload Not Working

- Check PDF.js worker URL in `lib/utils/pdf-processor.ts`
- Ensure browser supports Canvas API

### 3D Scene Not Rendering

- Check browser WebGL support
- Disable ad blockers
- Try different browser

### Images Not Loading

- Verify Supabase storage bucket is public
- Check CORS settings in Supabase
- Verify image URLs in database

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PDF.js](https://mozilla.github.io/pdf.js/)

---

Built with ❤️ by [Your Name]
