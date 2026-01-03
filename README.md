# FLIPZINE - 3D Digital Magazine Platform

A production-ready 3D digital magazine flipbook platform built with Next.js, React Three Fiber, and Supabase. Create stunning interactive magazines with **Flipsnack-style** page-turning animations and realistic 3D effects.

![FLIPZINE](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-3D-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎨 Visual & Interaction
- **Flipsnack-Style Viewer** - Top-down bird's eye view with smooth page curl effect
- **Dual Rendering Modes**:
  - **Flat Mode**: Clean digital magazine with orthographic camera
  - **3D Physical Mode**: Realistic book with perspective and depth
- **Page Curl Shader** - Custom GLSL shaders for realistic corner peel animation
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Touch Support** - Drag, swipe, and pinch gestures
- **Keyboard Navigation** - Arrow keys, Page Up/Down, Home/End

### 📤 Content Management
- **PDF Upload** - Auto-split PDF pages into optimized images
- **Image Upload** - Support for JPG, PNG, WebP with automatic compression
- **Drag & Drop Reordering** - Intuitive page management
- **Bulk Operations** - Upload multiple files at once
- **Image Optimization** - Automatic resizing and compression
- **Preview Mode** - Real-time 3D preview while editing

### 🔐 Authentication & Security
- **Supabase Auth** - Secure email/password authentication
- **Row Level Security (RLS)** - Database-level access control
- **Protected Routes** - Middleware-based route protection
- **Admin Roles** - Role-based access control
- **Session Management** - Secure token handling

### ⚡ Performance
- **Lazy Loading** - Load textures on demand
- **Texture Optimization** - Anisotropic filtering and mipmapping
- **Efficient Rendering** - Only render visible pages
- **WebGL Acceleration** - Hardware-accelerated 3D graphics
- **Code Splitting** - Optimized bundle sizes

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0
- **UI Library**: React 18
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion

### 3D Graphics
- **Engine**: Three.js
- **React Integration**: React Three Fiber
- **Helpers**: @react-three/drei
- **Shaders**: Custom GLSL (vertex & fragment)

### Backend & Database
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

### Additional Libraries
- **PDF Processing**: PDF.js (Mozilla)
- **Drag & Drop**: @dnd-kit
- **File Upload**: react-dropzone
- **Image Processing**: Sharp (server-side)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account ([supabase.com](https://supabase.com))
- Modern browser with WebGL support

### 1. Clone and Install

```bash
git clone https://github.com/mrhdayat/flipzine.git
cd flipzine
npm install
```

### 2. Set Up Supabase

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create new project
2. Wait for database to initialize (~2 minutes)

#### Run Database Migration
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `supabase/COMPLETE_SETUP.sql`
3. Paste and run the SQL
4. Verify tables created: `profiles`, `magazines`, `pages`

#### Create Storage Buckets
1. Go to **Storage** in Supabase Dashboard
2. Create bucket: `magazine-pages` 
   - **Public**: Yes
   - **File size limit**: 10MB
3. Create bucket: `magazine-drafts`
   - **Public**: No
   - **File size limit**: 50MB

#### Get API Credentials
1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Admin Account

1. Navigate to `/register`
2. Create your admin account
3. Login at `/login`
4. Access admin panel at `/admin`

## 📁 Project Structure

```
flipzine/
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Registration page
│   ├── (admin)/                   # Admin CMS (protected)
│   │   └── admin/
│   │       ├── magazines/
│   │       │   ├── page.tsx       # Magazine list
│   │       │   ├── new/page.tsx   # Create magazine
│   │       │   └── [id]/edit/page.tsx  # Edit magazine
│   │       ├── layout.tsx         # Admin layout
│   │       └── page.tsx           # Dashboard
│   ├── magazine/[slug]/           # Public viewer
│   │   └── page.tsx               # Flipbook viewer page
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
├── components/
│   ├── flipbook/                  # 3D Viewer Components
│   │   ├── FlipbookViewer.tsx     # Main viewer wrapper
│   │   ├── FlipbookScene.tsx      # Three.js scene
│   │   ├── Book.tsx               # Book container
│   │   ├── FlatPage.tsx           # Flipsnack-style page
│   │   ├── PhysicalPage.tsx       # 3D physical page
│   │   ├── PageStack.tsx          # Page depth stacks
│   │   └── shaders/               # GLSL shaders
│   │       ├── pageCurl.vert.glsl # Page curl vertex shader
│   │       ├── pageCurl.frag.glsl # Page curl fragment shader
│   │       ├── paper.vert.glsl    # Physical paper vertex
│   │       └── paper.frag.glsl    # Physical paper fragment
│   ├── admin/                     # Admin Components
│   │   ├── PageManager.tsx        # Page drag & drop manager
│   │   └── MagazinePreview.tsx    # 3D preview in editor
│   └── ui/                        # Reusable UI
│       ├── Button.tsx             # Button component
│       ├── Input.tsx              # Input component
│       ├── Modal.tsx              # Modal component
│       └── LoadingSpinner.tsx     # Loading indicator
├── hooks/
│   ├── useFlipInteraction.ts      # Page flip logic
│   └── usePressureDrag.ts         # Drag interaction
├── lib/
│   ├── supabase/                  # Supabase clients
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Middleware client
│   └── utils/                     # Utilities
│       ├── pdf-processor.ts       # PDF to images
│       ├── cn.ts                  # Class name merger
│       └── paperSound.ts          # Page flip sound
├── supabase/
│   ├── COMPLETE_SETUP.sql         # Full database setup
│   └── migrations/
│       └── 001_initial_schema.sql # Initial migration
├── middleware.ts                  # Route protection
├── tailwind.config.js             # Tailwind config
├── next.config.ts                 # Next.js config
└── package.json                   # Dependencies
```

## 🎯 Usage Guide

### Creating a Magazine

#### Method 1: PDF Upload
1. Login to admin panel at `/admin`
2. Click **"New Magazine"**
3. Enter:
   - **Title**: Magazine name
   - **Slug**: URL-friendly identifier (e.g., `summer-2024`)
   - **Description**: Brief description
4. Upload PDF file (max 50MB)
5. Wait for processing (auto-splits pages)
6. Reorder pages if needed
7. Click **"Publish"**

#### Method 2: Image Upload
1. Follow steps 1-3 above
2. Upload individual images (JPG, PNG, WebP)
3. Drag & drop to reorder
4. Click **"Publish"**

### Editing a Magazine

1. Go to `/admin/magazines`
2. Click **"Edit"** on any magazine
3. Modify:
   - Title, slug, description
   - Add/remove pages
   - Reorder pages
   - Update cover image
4. Click **"Save Changes"**

### Deleting a Magazine

1. Go to `/admin/magazines`
2. Click **"Delete"** on magazine
3. Confirm deletion
4. All pages and images will be removed

### Viewing a Magazine

- **Public URL**: `/magazine/your-slug`
- **Navigation**:
  - Click arrows or drag to flip
  - Arrow keys: Previous/Next page
  - Page Up/Down: Jump pages
  - Home/End: First/Last page
- **Controls**:
  - Fullscreen: `F` key
  - Zoom: Mouse wheel (if enabled)

## 🎨 Customization

### Switching Viewer Modes

The app supports two rendering modes:

#### Flipsnack-Style (Default)
- Top-down orthographic camera
- Flat pages with page curl
- Clean white background
- Minimal shadows

To use: Already active in `FlipbookScene.tsx`

#### 3D Physical Book
- Perspective camera with angle
- Pages with spine-based pivot
- Realistic depth and shadows
- Physical paper feel

To switch: Change imports in `Book.tsx`:
```typescript
// Change from:
import { FlatPage } from './FlatPage'

// To:
import { PhysicalPage } from './PhysicalPage'
```

### Theme Colors

Edit `app/globals.css`:

```css
:root {
  --primary: #a855f7;      /* Purple */
  --secondary: #3b82f6;    /* Blue */
  --accent: #f59e0b;       /* Amber */
  --background: #0a0a0a;   /* Dark */
  --foreground: #fafafa;   /* Light text */
}
```

### Page Flip Animation Speed

Adjust in `hooks/useFlipInteraction.ts`:

```typescript
const FLIP_DURATION = 600 // milliseconds (default: 600)
```

### Page Curl Intensity

Modify shader uniforms in `FlatPage.tsx`:

```typescript
uniforms={{
  uCurlRadius: { value: 1.5 },  // Increase for wider curl
  uCurlAmount: { value: easedProgress }
}}
```

### Camera Position

Adjust in `FlipbookScene.tsx`:

```typescript
// Orthographic (Flipsnack-style)
<OrthographicCamera
  position={[0, 5, 0]}  // Height above book
  zoom={80}             // Zoom level
/>

// Perspective (3D Physical)
<PerspectiveCamera
  position={[0.3, 0.5, 2.0]}  // X, Y, Z
  fov={50}                     // Field of view
/>
```

## 📊 Database Schema

### Tables

#### `profiles`
User profiles with roles and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (references auth.users) |
| email | text | User email |
| full_name | text | User's full name |
| role | text | User role (admin/user) |
| created_at | timestamp | Account creation time |

#### `magazines`
Magazine metadata and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (references profiles) |
| title | text | Magazine title |
| slug | text | URL slug (unique) |
| description | text | Magazine description |
| cover_image_url | text | Cover image URL |
| is_published | boolean | Published status |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

#### `pages`
Individual page data for magazines.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| magazine_id | uuid | Parent magazine |
| page_number | integer | Page order |
| image_url | text | Page image URL |
| created_at | timestamp | Creation time |

### Storage Buckets

#### `magazine-pages` (Public)
- **Purpose**: Published page images
- **Access**: Public read
- **Max Size**: 10MB per file
- **Allowed Types**: image/jpeg, image/png, image/webp

#### `magazine-drafts` (Private)
- **Purpose**: Draft files and PDFs
- **Access**: Authenticated users only
- **Max Size**: 50MB per file
- **Allowed Types**: application/pdf, image/*

### Row Level Security (RLS)

All tables have RLS enabled:

- **Public read** for published magazines
- **Admin-only** write access
- **User-specific** draft access

See `supabase/COMPLETE_SETUP.sql` for full policies.

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mrhdayat/flipzine)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
4. Deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Import project in Netlify
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Add environment variables (same as Vercel)
5. Deploy!

### Self-Hosting

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env.local` to git
- Use different keys for dev/prod
- Rotate keys periodically

### Supabase Security
- Enable RLS on all tables
- Use service role key only on server
- Implement rate limiting
- Enable email verification

### Content Security
- Validate file uploads
- Sanitize user inputs
- Limit file sizes
- Check file types

## 🐛 Troubleshooting

### PDF Upload Not Working

**Problem**: PDF doesn't split into pages

**Solutions**:
1. Check PDF.js worker URL in `lib/utils/pdf-processor.ts`
2. Ensure PDF is not password-protected
3. Try smaller PDF (< 50MB)
4. Check browser console for errors

### 3D Scene Not Rendering

**Problem**: Black screen or no 3D content

**Solutions**:
1. Check WebGL support: Visit [webglreport.com](https://webglreport.com)
2. Update graphics drivers
3. Try different browser (Chrome recommended)
4. Disable hardware acceleration and re-enable
5. Check browser console for Three.js errors

### Images Not Loading

**Problem**: Broken image icons in viewer

**Solutions**:
1. Verify Supabase storage bucket is public
2. Check CORS settings in Supabase:
   - Go to Storage → Policies
   - Ensure public read access
3. Verify image URLs in database
4. Check network tab for 403/404 errors

### Slow Performance

**Problem**: Laggy page flips or low FPS

**Solutions**:
1. Reduce image sizes (< 2MB per page)
2. Lower texture quality in `FlatPage.tsx`:
   ```typescript
   loadedTexture.anisotropy = 4  // Lower from 16
   ```
3. Disable shadows:
   ```typescript
   <Canvas shadows={false}>
   ```
4. Use fewer pages per magazine (< 50)

### Authentication Issues

**Problem**: Can't login or register

**Solutions**:
1. Check Supabase project status
2. Verify environment variables
3. Check email confirmation settings
4. Clear browser cookies/cache
5. Check Supabase Auth logs

## 📚 API Reference

### Supabase Client Functions

#### Get Magazine by Slug
```typescript
const { data, error } = await supabase
  .from('magazines')
  .select('*, pages(*)')
  .eq('slug', slug)
  .eq('is_published', true)
  .single()
```

#### Create Magazine
```typescript
const { data, error } = await supabase
  .from('magazines')
  .insert({
    title,
    slug,
    description,
    user_id: user.id
  })
  .select()
  .single()
```

#### Upload Page Image
```typescript
const { data, error } = await supabase.storage
  .from('magazine-pages')
  .upload(`${magazineId}/${pageNumber}.jpg`, file)
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - Three.js React renderer
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [Flipsnack](https://www.flipsnack.com/) - Design inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mrhdayat/flipzine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mrhdayat/flipzine/discussions)
- **Email**: your-email@example.com

---

**Built with ❤️ by Muhammad Rahmat Hidayat**

⭐ Star this repo if you find it helpful!
