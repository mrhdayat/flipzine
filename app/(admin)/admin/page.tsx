'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMagazines: 0,
    publishedMagazines: 0,
    totalPages: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { count: totalMagazines } = await supabase
      .from('magazines')
      .select('*', { count: 'exact', head: true })

    const { count: publishedMagazines } = await supabase
      .from('magazines')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    const { count: totalPages } = await supabase
      .from('pages')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalMagazines: totalMagazines || 0,
      publishedMagazines: publishedMagazines || 0,
      totalPages: totalPages || 0,
    })
  }

  return (
    <div className="space-y-12">
      {/* Welcome */}
      <div>
        <h2 className="text-[28px] font-medium mb-2">Dashboard</h2>
        <p className="text-[14px] text-secondary">
          Manage your digital magazines
        </p>
      </div>

      {/* Stats - Minimal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-2">
          <p className="text-[13px] text-secondary">Total magazines</p>
          <p className="text-[32px] font-normal">{stats.totalMagazines}</p>
        </div>
        <div className="space-y-2">
          <p className="text-[13px] text-secondary">Published</p>
          <p className="text-[32px] font-normal">{stats.publishedMagazines}</p>
        </div>
        <div className="space-y-2">
          <p className="text-[13px] text-secondary">Total pages</p>
          <p className="text-[32px] font-normal">{stats.totalPages}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-8 space-y-4">
        <p className="text-[13px] text-secondary">Quick actions</p>
        <div className="space-y-3">
          <Link
            href="/admin/magazines/new"
            className="text-[16px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all block"
          >
            → Create new magazine
          </Link>
          <Link
            href="/admin/magazines"
            className="text-[16px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all block"
          >
            → View all magazines
          </Link>
        </div>
      </div>
    </div>
  )
}
