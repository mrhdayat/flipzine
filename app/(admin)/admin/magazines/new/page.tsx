'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import PageManager from '@/components/admin/PageManager'

export default function NewMagazinePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [magazineId, setMagazineId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !magazineId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(generatedSlug)
    }
  }, [title, magazineId])

  const handleCreateMagazine = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('magazines')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        throw new Error('A magazine with this slug already exists')
      }

      // Create magazine
      const { data, error } = await supabase
        .from('magazines')
        .insert({
          title,
          slug,
          description,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setMagazineId(data.id)
    } catch (err: any) {
      setError(err.message || 'Failed to create magazine')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    router.push('/admin/magazines')
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/magazines"
            className="text-[13px] text-secondary hover:text-white transition-colors"
          >
            ← Back
          </Link>
        </div>
        <h1 className="text-[28px] font-medium">Create Magazine</h1>
        <p className="text-[14px] text-secondary">Add a new digital magazine</p>
      </div>

      {/* Magazine Info Form */}
      {!magazineId ? (
        <div className="max-w-xl space-y-8">
          <h2 className="text-[20px] font-medium">Magazine Information</h2>

          <form onSubmit={handleCreateMagazine} className="space-y-8">
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
                placeholder="My Amazing Magazine"
                required
                autoFocus
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
                placeholder="my-amazing-magazine"
                pattern="[a-z0-9-]+"
                required
              />
              <p className="text-[12px] text-tertiary">
                URL: {process.env.NEXT_PUBLIC_APP_URL}/magazine/{slug || 'your-slug'}
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
                placeholder="A brief description of your magazine..."
                rows={4}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-[13px] text-secondary opacity-60">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="text-[16px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all disabled:opacity-40"
            >
              {isLoading ? 'Creating…' : '→ Continue to upload pages'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Magazine Created - Now Upload Pages */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-medium">{title}</h2>
                <p className="text-[13px] text-secondary">/{slug}</p>
              </div>
              <button
                onClick={handleFinish}
                className="text-[14px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all"
              >
                → Finish & view magazines
              </button>
            </div>

            <PageManager magazineId={magazineId} />
          </div>
        </>
      )}
    </div>
  )
}
