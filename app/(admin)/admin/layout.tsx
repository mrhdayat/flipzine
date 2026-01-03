'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      router.push('/')
      return
    }

    setUser(profile)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-secondary text-[14px]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header - Centered, Responsive */}
      <header className="px-6 md:px-8 py-6 border-b divider">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/admin" className="text-[14px] sm:text-[16px] font-medium hover:no-underline">
            FLIPZINE
          </Link>
          <div className="text-[12px] sm:text-[13px] text-secondary truncate max-w-[150px] sm:max-w-none">
            {user?.full_name || user?.email}
          </div>
        </div>
      </header>

      {/* Navigation - Centered, Mobile-friendly */}
      <nav className="px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-6 md:gap-8 text-[14px] sm:text-[16px]">
            <Link
              href="/admin/magazines"
              className="text-secondary hover:text-white transition-colors"
            >
              Magazines
            </Link>
            <button
              onClick={handleLogout}
              className="text-secondary hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <main className="px-6 md:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
