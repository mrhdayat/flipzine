'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three'

interface Magazine {
  id: string
  title: string
}

interface Page {
  id: string
  page_number: number
  image_url: string
}

interface MagazinePreviewProps {
  magazine: Magazine
  pages: Page[]
}

export default function MagazinePreview({ magazine, pages }: MagazinePreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)

  // Auto-flip pages for preview
  useEffect(() => {
    if (pages.length === 0) return

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length)
    }, 3000) // Flip every 3 seconds

    return () => clearInterval(interval)
  }, [pages.length])

  return (
    <div className="w-full h-full relative bg-[#0A0A0A]">
      {/* Background Typography */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.04] z-0">
        <div className="absolute top-1/4 left-1/4 text-[120px] font-semibold text-white leading-none">
          PREVIEW
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <spotLight position={[0, 10, 0]} intensity={0.3} />

        {/* Magazine */}
        <Book pages={pages} currentPage={currentPage} />
      </Canvas>

      {/* Page Counter */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-[14px] text-white opacity-60">
          {String(currentPage + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
        </p>
      </div>
    </div>
  )
}

function Book({ pages, currentPage }: { pages: Page[], currentPage: number }) {
  return (
    <group>
      {pages.map((page, index) => (
        <Page3D
          key={page.id}
          page={page}
          index={index}
          currentPage={currentPage}
          totalPages={pages.length}
        />
      ))}
    </group>
  )
}

function Page3D({
  page,
  index,
  currentPage,
  totalPages
}: {
  page: Page
  index: number
  currentPage: number
  totalPages: number
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(page.image_url, (loadedTexture) => {
      setTexture(loadedTexture)
    })
  }, [page.image_url])

  // A4 ratio
  const width = 2.1
  const height = 2.97

  // Calculate position and rotation
  const isFlipped = index < currentPage
  const isCurrent = index === currentPage

  // Animated rotation
  const { rotation } = useSpring({
    rotation: isFlipped ? -Math.PI : 0,
    config: { tension: 120, friction: 14 }
  })

  // Position based on page number
  const baseX = (index - totalPages / 2) * 0.01
  const x = isFlipped ? -width / 2 : baseX

  return (
    <animated.mesh
      position={[x, 0, index * 0.001]}
      rotation-y={rotation}
      castShadow
      receiveShadow
    >
      <planeGeometry args={[width, height, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.1}
      />
    </animated.mesh>
  )
}
