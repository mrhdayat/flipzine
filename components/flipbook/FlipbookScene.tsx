'use client'

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Book } from './Book'
import { useFlipInteraction } from '@/hooks/useFlipInteraction'

interface Page {
  id: string
  page_number: number
  image_url: string
}

interface FlipbookSceneProps {
  pages: Page[]
}

export default function FlipbookScene({ pages }: FlipbookSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    currentPage,
    flipProgress,
    isFlipping,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useFlipInteraction(pages.length)

  const onPointerDown = (e: React.PointerEvent) => {
    handleDragStart(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (containerRef.current) {
      handleDragMove(e.clientX, containerRef.current.clientWidth)
    }
  }

  const onPointerUp = () => {
    handleDragEnd()
  }

  if (pages.length === 0) return null

  const isCoverPage = currentPage === 0

  return (
    <div
      ref={containerRef}
      className="w-full h-screen touch-none select-none relative overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Clean white background - Flipsnack style */}
      <div className="absolute inset-0 bg-white" />

      <Canvas
        shadows
        className="relative z-10"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        {/* Top-down orthographic camera - Flipsnack style */}
        <OrthographicCamera
          makeDefault
          position={[0, 5, 0]}  // Looking straight down
          rotation={[-Math.PI / 2, 0, 0]}  // 90° down
          zoom={80}
          near={0.1}
          far={100}
        />

        {/* Flat ambient lighting - no dramatic 3D lights */}
        <FlatLighting />



        {/* The Physical Book */}
        <Book
          pages={pages}
          currentPage={currentPage}
          flipProgress={flipProgress}
          isFlipping={isFlipping}
        />
      </Canvas>

      {/* Page indicator - positioned safely */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-20">
        <div className="inline-block px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">
          <div className="text-[12px] opacity-40 tracking-wider font-medium">
            {isCoverPage ? (
              <>Page {currentPage + 1} / {pages.length}</>
            ) : (
              <>Pages {currentPage + 1}-{Math.min(currentPage + 2, pages.length)} / {pages.length}</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FlatLighting() {
  return (
    <>
      {/* Bright ambient light for flat, clean look */}
      <ambientLight intensity={1.2} />

      {/* Soft top light for subtle shadow */}
      <directionalLight
        position={[0, 5, 0]}
        intensity={0.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0001}
      />
    </>
  )
}
