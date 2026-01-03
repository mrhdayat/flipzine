'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if this is the first user
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const role = count === 0 ? 'admin' : 'viewer'

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-12 opacity-0 fade-in">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="text-[14px] tracking-wide hover:no-underline">
            FLIPZINE
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-[24px] font-normal text-center">Create account</h1>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-8">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-[13px] text-secondary block">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-minimal"
              required
              autoFocus
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-[13px] text-secondary block">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-minimal"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-[13px] text-secondary block">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-minimal"
              required
              minLength={6}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[13px] text-secondary opacity-60">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="text-[16px] text-secondary hover:text-white hover:underline decoration-1 underline-offset-4 transition-all disabled:opacity-40"
          >
            {loading ? 'Creating account…' : '→ Continue'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-[13px] text-secondary hover:text-white transition-colors"
          >
            Already have an account?
          </Link>
        </div>

        {/* Back */}
        <div className="text-center pt-8">
          <Link
            href="/"
            className="text-[13px] text-tertiary hover:text-secondary transition-colors"
          >
            → Back to home
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center pt-12">
          <p className="text-[12px] opacity-30">© 2026</p>
        </div>
      </div>
    </div>
  )
}
