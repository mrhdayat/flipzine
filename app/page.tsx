'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// Motion Variants - Following Master Timeline
const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], // easeOut
      staggerChildren: 0.3
    }
  }
}

const heroTitle = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] // easeOut
    }
  }
}

const heroSubtitle = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 0.45,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] // easeOut
    }
  }
}

const scrollIndicator = {
  hidden: { opacity: 0 },
  show: {
    opacity: 0.3,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] // easeOut
    }
  },
  animate: {
    y: [0, 4, 0],
    transition: {
      duration: 1.8,
      ease: [0.42, 0, 0.58, 1], // easeInOut
      repeat: Infinity
    }
  }
}

const ambientLight = {
  hidden: { opacity: 0 },
  show: {
    opacity: 0.7,
    transition: {
      duration: 1.2,
      ease: [0.4, 0, 0.2, 1], // easeOut
      delay: 0.4
    }
  },
  animate: {
    opacity: [0.7, 0.85, 0.7],
    transition: {
      duration: 8,
      ease: [0.42, 0, 0.58, 1], // easeInOut
      repeat: Infinity
    }
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Film Grain */}
      <div className="film-grain" />

      {/* Ambient Light - Breathing Effect */}
      <motion.div
        className="ambient-light"
        variants={ambientLight}
        initial="hidden"
        animate={["show", "animate"]}
      />

      {/* Section 1 - Hero (Full Viewport) - Centered */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-8 relative z-10">
        <motion.div
          className="text-center space-y-6 max-w-3xl"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          {/* Title - Fade in first */}
          <motion.h1
            className="text-[40px] sm:text-[48px] md:text-[64px] lg:text-[72px] font-semibold tracking-tight leading-none"
            variants={heroTitle}
          >
            FLIPZINE
          </motion.h1>

          {/* Subtitle - Fade in with delay */}
          <motion.p
            className="text-[14px] sm:text-[16px] md:text-[18px] font-normal text-secondary max-w-md mx-auto"
            variants={heroSubtitle}
          >
            Digital magazines,
            <br />
            experienced in motion.
          </motion.p>
        </motion.div>

        {/* Scroll indicator - Fade in last + micro loop */}
        <motion.div
          className="absolute bottom-12 md:bottom-16 text-center"
          variants={scrollIndicator}
          initial="hidden"
          animate={["show", "animate"]}
        >
          <p className="text-[13px] text-tertiary">Scroll ↓</p>
        </motion.div>
      </section>

      {/* Section 2 - Statement - Centered */}
      <section className="min-h-[50vh] flex items-center justify-center px-6 md:px-8">
        <p className="text-[14px] sm:text-[16px] font-normal text-center opacity-60 max-w-xl">
          We focus on reading, not interfaces.
        </p>
      </section>

      {/* Section 3 - Links - Centered */}
      <section className="min-h-[40vh] flex flex-col items-center justify-center gap-6 px-6 md:px-8">
        <Link
          href="/admin/magazines"
          className="text-[14px] sm:text-[16px] text-secondary hover:text-white transition-all hover-underline"
        >
          → View magazines
        </Link>
        <Link
          href="/login"
          className="text-[14px] sm:text-[16px] text-secondary hover:text-white transition-all hover-underline"
        >
          → Sign in
        </Link>
      </section>

      {/* Footer - Centered */}
      <footer className="py-8 md:py-12 text-center">
        <p className="text-[12px] sm:text-[13px] opacity-30">
          © 2026 Flipzine
        </p>
      </footer>
    </div>
  )
}
