'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FlatPage } from './FlatPage'

interface BookProps {
  pages: Array<{
    id: string
    page_number: number
    image_url: string
  }>
  currentPage: number
  flipProgress: number
  isFlipping: boolean
}

// Flipsnack-style constants - larger, flatter
const PAGE_WIDTH = 0.21 * 6
const PAGE_HEIGHT = 0.297 * 6

export function Book({ pages, currentPage, flipProgress, isFlipping }: BookProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Minimal camera movement (Flipsnack is mostly static)
  useFrame(({ camera }) => {
    if (!groupRef.current) return

    // Very subtle zoom during flip
    const targetFov = isFlipping ? 49 : 50
    if ('fov' in camera) {
      const perspCamera = camera as THREE.PerspectiveCamera
      perspCamera.fov += (targetFov - perspCamera.fov) * 0.08
      perspCamera.updateProjectionMatrix()
    }
  })

  // Heyzine layout logic
  const isCoverPage = currentPage === 0
  const leftPageIndex = isCoverPage ? -1 : currentPage
  const rightPageIndex = isCoverPage ? 0 : currentPage + 1



  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}  // NO TILT - perfectly flat
    >


      {/* Left Page - only in spread view */}
      {leftPageIndex >= 0 && leftPageIndex < pages.length && (
        <FlatPage
          key={`left-${pages[leftPageIndex].id}`}
          imageUrl={pages[leftPageIndex].image_url}
          isLeft={true}
          flipProgress={0}
          isFlipping={false}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
        />
      )}

      {/* Right Page - with curl when flipping */}
      {rightPageIndex >= 0 && rightPageIndex < pages.length && (
        <FlatPage
          key={`right-${pages[rightPageIndex].id}`}
          imageUrl={pages[rightPageIndex].image_url}
          isLeft={false}
          flipProgress={isFlipping ? flipProgress : 0}
          isFlipping={isFlipping}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
        />
      )}

      {/* Subtle drop shadow (not dramatic 3D shadow) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[PAGE_WIDTH * 2.2, PAGE_HEIGHT * 1.1]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
    </group>
  )
}
