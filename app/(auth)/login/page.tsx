'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// Motion Variants - Login Timeline
const loginContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: 0.15
    }
  }
}

const loginForm = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] // easeOut
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile && ['admin', 'editor'].includes(profile.role)) {
        router.push('/admin/magazines')
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 relative">
      {/* Film Grain */}
      <div className="film-grain" />

      {/* Form - Group fade-in with timeline */}
      <motion.div
        className="w-full max-w-sm space-y-12"
        variants={loginContainer}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="text-[14px] tracking-wide hover:no-underline">
            FLIPZINE
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-[24px] font-normal text-center">Sign in</h1>

        {/* Form */}
        <motion.form
          onSubmit={handleLogin}
          className="space-y-8"
          variants={loginForm}
        >
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
              autoFocus
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
            />
          </div>

          {/* Error - Fade in */}
          {error && (
            <motion.p
              className="text-[13px] text-secondary opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="text-[16px] text-secondary hover:text-white transition-all hover-underline disabled:opacity-40"
            whileHover={{ opacity: 0.8 }}
            transition={{ duration: 0.12 }}
          >
            {loading ? 'Signing in…' : '→ Continue'}
          </motion.button>
        </motion.form>

        {/* Register Link */}
        <div className="text-center">
          <Link
            href="/register"
            className="text-[13px] text-secondary hover:text-white transition-colors"
          >
            Need an account?
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
      </motion.div>
    </div>
  )
}
