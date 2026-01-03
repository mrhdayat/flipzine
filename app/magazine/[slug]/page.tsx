import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FlipbookViewer from '@/components/flipbook/FlipbookViewer'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: magazine } = await supabase
    .from('magazines')
    .select('title, description, cover_image_url')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!magazine) {
    return {
      title: 'Magazine Not Found',
    }
  }

  return {
    title: `${magazine.title} | FLIPZINE`,
    description: magazine.description || `Read ${magazine.title} on FLIPZINE`,
    openGraph: {
      title: magazine.title,
      description: magazine.description || undefined,
      images: magazine.cover_image_url ? [magazine.cover_image_url] : [],
    },
  }
}

export default async function MagazinePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get magazine
  const { data: magazine, error: magazineError } = await supabase
    .from('magazines')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (magazineError || !magazine) {
    notFound()
  }

  // Get pages
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('magazine_id', magazine.id)
    .order('page_number')

  if (!pages || pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">{magazine.title}</h1>
          <p className="text-muted">This magazine has no pages yet.</p>
        </div>
      </div>
    )
  }

  return <FlipbookViewer magazine={magazine} pages={pages} />
}
