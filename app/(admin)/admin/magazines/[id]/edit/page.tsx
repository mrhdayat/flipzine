'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import PageManager from '@/components/admin/PageManager'
import dynamic from 'next/dynamic'

// Dynamically import 3D preview
const MagazinePreview = dynamic(() => import('@/components/admin/MagazinePreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
      <p className="text-[13px] text-secondary">Loading preview...</p>
    </div>
  ),
})

interface Magazine {
  id: string
  title: string
  slug: string
  description: string | null
  published: boolean
}

interface Page {
  id: string
  page_number: number
  image_url: string
}

export default function EditMagazinePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadMagazine()
    loadPages()
  }, [params.id])

  async function loadMagazine() {
    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      setError('Magazine not found')
      setIsLoading(false)
      return
    }

    setMagazine(data)
    setTitle(data.title)
    setSlug(data.slug)
    setDescription(data.description || '')
    setIsLoading(false)
  }

  async function loadPages() {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('magazine_id', params.id)
      .order('page_number', { ascending: true })

    if (data) setPages(data)
  }

  async function handleSave() {
    setIsSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('magazines')
        .update({
          title,
          slug,
          description,
        })
        .eq('id', params.id)

      if (error) throw error

      // Reload to update
      await loadMagazine()
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  async function togglePublish() {
    if (!magazine) return

    const { error } = await supabase
      .from('magazines')
      .update({ published: !magazine.published })
      .eq('id', params.id)

    if (!error) {
      await loadMagazine()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-[14px] text-secondary">Loading...</p>
      </div>
    )
  }

  if (error && !magazine) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-[14px] text-secondary">{error}</p>
          <Link
            href="/admin/magazines"
            className="text-[14px] text-secondary hover:text-white hover:underline"
          >
            → Back to magazines
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/magazines"
              className="text-[13px] text-secondary hover:text-white transition-colors"
            >
              ← Back
            </Link>
          </div>
          <h1 className="text-[28px] font-medium">Edit Magazine</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-[14px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all"
          >
            {showPreview ? 'Hide preview' : '→ Show 3D preview'}
          </button>
          <button
            onClick={togglePublish}
            className="text-[14px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all"
          >
            {magazine?.published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left - Metadata */}
        <div className="space-y-8">
          <h2 className="text-[20px] font-medium">Magazine Information</h2>

          <div className="space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-[13px] text-secondary block">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-minimal"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label htmlFor="slug" className="text-[13px] text-secondary block">
                Slug (URL)
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input-minimal"
                pattern="[a-z0-9-]+"
              />
              <p className="text-[12px] text-tertiary">
                URL: {process.env.NEXT_PUBLIC_APP_URL}/magazine/{slug}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-[13px] text-secondary block">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-minimal resize-none"
                rows={4}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-[13px] text-secondary opacity-60">{error}</p>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-[16px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all disabled:opacity-40"
            >
              {isSaving ? 'Saving…' : '→ Save changes'}
            </button>
          </div>

          {/* Pages */}
          <div className="pt-8 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <h2 className="text-[20px] font-medium mb-6">Pages</h2>
            <PageManager magazineId={params.id} onPagesChange={loadPages} />
          </div>
        </div>

        {/* Right - 3D Preview */}
        {showPreview && pages.length > 0 && (
          <div className="lg:sticky lg:top-8 h-[600px] bg-[#0A0A0A] rounded-lg overflow-hidden">
            <MagazinePreview
              magazine={magazine!}
              pages={pages}
            />
          </div>
        )}
      </div>
    </div>
  )
}
