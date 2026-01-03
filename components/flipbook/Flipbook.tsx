'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Page } from './Page'
import { PageStack } from './PageStack'

interface FlipbookProps {
  pages: Array<{
    id: string
    page_number: number
    image_url: string
  }>
  currentPage: number
  flipProgress: number
  isFlipping: boolean
}

// Balanced scale - 5x for immersive but not clipped
const PAGE_WIDTH = 0.21 * 5
const PAGE_HEIGHT = 0.297 * 5
const PAGE_THICKNESS = 0.002
const SPINE_WIDTH = 0.05

export function Flipbook({ pages, currentPage, flipProgress, isFlipping }: FlipbookProps) {
  const groupRef = useRef<THREE.Group>(null)

  const isCoverPage = currentPage === 0

  const leftPageIndex = isCoverPage ? -1 : currentPage
  const rightPageIndex = isCoverPage ? 0 : currentPage + 1

  const leftStackCount = leftPageIndex >= 0 ? leftPageIndex : 0
  const rightStackCount = pages.length - (rightPageIndex + 1)

  const leftStackThickness = leftStackCount * PAGE_THICKNESS
  const rightStackThickness = rightStackCount * PAGE_THICKNESS
  const totalThickness = pages.length * PAGE_THICKNESS

  useFrame(({ camera }) => {
    if (!groupRef.current) return

    const targetZ = 2.0 - flipProgress * 0.08
    camera.position.z += (targetZ - camera.position.z) * 0.1

    if (!isFlipping && groupRef.current) {
      groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.05
    }
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[0.04, 0, -0.01]} // Subtle tilt, not extreme
    >
      {/* Central Spine */}
      {!isCoverPage && (
        <mesh
          position={[0, 0, totalThickness / 2]}
          castShadow
        >
          <boxGeometry args={[SPINE_WIDTH, PAGE_HEIGHT, totalThickness]} />
          <meshStandardMaterial
            color="#0a0a0a"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      )}

      {/* Left Page Stack */}
      {leftStackCount > 0 && (
        <PageStack
          count={leftStackCount}
          position={[-PAGE_WIDTH / 2 - 0.025, 0, 0]}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          pageThickness={PAGE_THICKNESS}
          isLeft={true}
        />
      )}

      {/* Right Page Stack */}
      {rightStackCount > 0 && (
        <PageStack
          count={rightStackCount}
          position={[PAGE_WIDTH / 2 + 0.025, 0, 0]}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          pageThickness={PAGE_THICKNESS}
          isLeft={false}
        />
      )}

      {/* Left Page */}
      {leftPageIndex >= 0 && leftPageIndex < pages.length && (
        <Page
          key={`left-${pages[leftPageIndex].id}`}
          index={leftPageIndex}
          imageUrl={pages[leftPageIndex].image_url}
          isLeftPage={true}
          flipProgress={0}
          isFlipping={false}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          zPosition={leftStackThickness}
        />
      )}

      {/* Right Page */}
      {rightPageIndex >= 0 && rightPageIndex < pages.length && (
        <Page
          key={`right-${pages[rightPageIndex].id}`}
          index={rightPageIndex}
          imageUrl={pages[rightPageIndex].image_url}
          isLeftPage={false}
          flipProgress={isFlipping ? flipProgress : 0}
          isFlipping={isFlipping}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          zPosition={rightStackThickness}
        />
      )}

      {/* Shadow plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -PAGE_HEIGHT / 2 - 0.06, totalThickness / 2]}
        receiveShadow
      >
        <planeGeometry args={[PAGE_WIDTH * 3, PAGE_HEIGHT * 2]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
    </group>
  )
}
