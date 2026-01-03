'use client'

import { useRef } from 'react'
import * as THREE from 'three'

interface PageStackProps {
  count: number
  position: [number, number, number]
  pageWidth: number
  pageHeight: number
  pageThickness: number
  isLeft: boolean
}

/**
 * PageStack Component - Visible Stack of Pages
 * 
 * Creates the visual representation of stacked pages
 * on the left (read pages) or right (unread pages)
 * 
 * This adds the 3D depth that Heyzine lacks!
 */
export function PageStack({
  count,
  position,
  pageWidth,
  pageHeight,
  pageThickness,
  isLeft
}: PageStackProps) {
  if (count === 0) return null

  // Limit visual stack to avoid performance issues
  const visiblePages = Math.min(count, 30)
  const totalThickness = count * pageThickness

  return (
    <group position={position}>
      {/* Main stack block - represents all pages */}
      <mesh
        position={[0, 0, totalThickness / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[pageWidth, pageHeight, totalThickness]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Individual page edges for realism */}
      {Array.from({ length: Math.min(visiblePages, 10) }).map((_, i) => {
        const offset = (i / 10) * totalThickness
        return (
          <mesh
            key={i}
            position={[0, 0, offset]}
            receiveShadow
          >
            <planeGeometry args={[pageWidth, pageHeight]} />
            <meshStandardMaterial
              color="#fafafa"
              roughness={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}

      {/* Page edge coloring (cream/yellow tint) */}
      <mesh
        position={[
          isLeft ? pageWidth / 2 : -pageWidth / 2,
          0,
          totalThickness / 2
        ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[totalThickness, pageHeight]} />
        <meshStandardMaterial
          color="#f9f7f0"
          roughness={0.9}
        />
      </mesh>
    </group>
  )
}
