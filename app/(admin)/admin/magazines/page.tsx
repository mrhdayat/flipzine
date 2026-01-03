'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Magazine {
  id: string
  title: string
  slug: string
  published: boolean
  created_at: string
}

export default function MagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMagazines()
  }, [])

  async function loadMagazines() {
    const { data } = await supabase
      .from('magazines')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setMagazines(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this magazine?')) return

    await supabase.from('magazines').delete().eq('id', id)
    loadMagazines()
  }

  async function togglePublish(magazine: Magazine) {
    await supabase
      .from('magazines')
      .update({ published: !magazine.published })
      .eq('id', magazine.id)

    loadMagazines()
  }

  if (loading) {
    return <p className="text-secondary text-[14px]">Loading...</p>
  }

  return (
    <div className="space-y-8 md:space-y-12 dashboard-enter">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-[24px] sm:text-[28px] font-medium">MAGAZINES</h2>
        <Link
          href="/admin/magazines/new"
          className="text-[14px] sm:text-[16px] text-secondary hover:text-white hover-underline"
        >
          → Create new
        </Link>
      </div>

      {/* Magazine List - Mobile-friendly */}
      {magazines.length === 0 ? (
        <div className="py-16 md:py-24 text-center space-y-4">
          <p className="text-secondary text-[14px] sm:text-[16px]">No magazines yet.</p>
          <Link
            href="/admin/magazines/new"
            className="text-[14px] sm:text-[16px] text-secondary hover:text-white inline-block"
          >
            → Create your first one
          </Link>
        </div>
      ) : (
        <div className="space-y-0">
          {magazines.map((magazine) => (
            <div
              key={magazine.id}
              className="py-4 md:py-6 border-b divider group hover:border-white/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-8">
                {/* Magazine Info */}
                <div className="flex-1 space-y-2">
                  <Link
                    href={`/admin/magazines/${magazine.id}/edit`}
                    className="text-[14px] sm:text-[16px] font-medium hover-underline block"
                  >
                    {magazine.title}
                  </Link>
                  <div className="flex items-center gap-3 sm:gap-4 text-[12px] sm:text-[13px] text-secondary">
                    <span>{magazine.published ? 'Published' : 'Draft'}</span>
                    <span>·</span>
                    <span>{new Date(magazine.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions - Mobile: Always visible, Desktop: Hover */}
                <div className="flex items-center gap-4 sm:gap-6 text-[12px] sm:text-[13px] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePublish(magazine)}
                    className="text-secondary hover:text-white transition-colors"
                  >
                    {magazine.published ? 'Unpublish' : 'Publish'}
                  </button>
                  {magazine.published && (
                    <Link
                      href={`/magazine/${magazine.slug}`}
                      target="_blank"
                      className="text-secondary hover:text-white transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(magazine.id)}
                    className="text-secondary hover:text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

