'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

interface Magazine {
  id: string
  title: string
  slug: string
  description: string | null
}

interface Page {
  id: string
  page_number: number
  image_url: string
}

interface FlipbookViewerProps {
  magazine: Magazine
  pages: Page[]
}

const FlipbookScene = dynamic<{
  pages: Page[]
  currentPage: number
  onPageChange: (page: number) => void
  dragProgress: number
}>(() => import('./FlipbookScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-[#0A0A0A]">
      <p className="text-[13px] opacity-30">Loading...</p>
    </div>
  ),
})

export default function FlipbookViewer({ magazine, pages }: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [mouseTimeout, setMouseTimeout] = useState<NodeJS.Timeout | null>(null)

  // Drag state for realistic flip
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const dragStartX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (mouseTimeout) clearTimeout(mouseTimeout)
      const timeout = setTimeout(() => setShowControls(false), 3000)
      setMouseTimeout(timeout)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (mouseTimeout) clearTimeout(mouseTimeout)
    }
  }, [mouseTimeout])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage()
      else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextPage()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage])

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }, [currentPage, pages.length])

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }, [currentPage])

  // Drag to flip (CORRECT FLIPBOOK INTERACTION)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    dragStartX.current = e.clientX
    setDragProgress(0)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const dragX = e.clientX - dragStartX.current

    // Map drag to progress (0 to 1)
    // Negative drag = flip forward (right to left)
    const progress = Math.max(0, Math.min(1, -dragX / (containerWidth * 0.3)))
    setDragProgress(progress)
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return

    // Snap behavior (like real book)
    if (dragProgress > 0.5) {
      // Complete the flip
      nextPage()
    }

    // Reset
    setIsDragging(false)
    setDragProgress(0)
  }, [isDragging, dragProgress, nextPage])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background Typography */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.03]">
        <motion.div
          className="absolute top-[15%] left-[10%] text-[180px] font-semibold text-white leading-none"
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 20,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        >
          FLIPZINE
        </motion.div>
      </div>

      {/* 3D Magazine Scene */}
      <FlipbookScene
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        dragProgress={dragProgress}
      />

      {/* Click Zones (when not dragging) */}
      {!isDragging && (
        <div className="absolute inset-0 flex pointer-events-auto">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex-1 cursor-w-resize disabled:cursor-not-allowed opacity-0 hover:opacity-5 transition-opacity"
            aria-label="Previous page"
          >
            <div className="w-full h-full bg-gradient-to-r from-white/10 to-transparent" />
          </button>

          <button
            onClick={nextPage}
            disabled={currentPage >= pages.length - 1}
            className="flex-1 cursor-e-resize disabled:cursor-not-allowed opacity-0 hover:opacity-5 transition-opacity"
            aria-label="Next page"
          >
            <div className="w-full h-full bg-gradient-to-l from-white/10 to-transparent" />
          </button>
        </div>
      )}

      {/* Controls */}
      <AnimatePresence>
        {showControls && !isDragging && (
          <>
            <motion.div
              className="absolute top-8 left-0 right-0 text-center pointer-events-none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className="text-[14px] font-normal tracking-wide opacity-40">
                {magazine.title}
              </h1>
            </motion.div>

            <motion.div
              className="absolute bottom-8 left-0 right-0 text-center pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="text-[12px] font-normal opacity-30 tracking-wider">
                {String(currentPage + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-16 left-0 right-0 text-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <p className="text-[11px] opacity-20">Drag to flip • Arrow keys • Click left/right</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
