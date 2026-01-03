'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FlatPageProps {
  imageUrl: string
  isLeft: boolean
  flipProgress: number
  isFlipping: boolean
  pageWidth: number
  pageHeight: number
}

// Import curl shaders
const curlVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vCurlIntensity;

uniform float uCurlAmount;
uniform vec2 uCurlOrigin;
uniform float uCurlRadius;

void main() {
  vUv = uv;
  vec3 transformed = position;
  
  vec2 diff = uv - uCurlOrigin;
  float dist = length(diff);
  
  float curlStrength = 0.0;
  
  if (dist < uCurlRadius * uCurlAmount) {
    curlStrength = smoothstep(
      uCurlRadius * uCurlAmount,
      0.0,
      dist
    );
    
    float lift = curlStrength * uCurlAmount * 0.3;
    transformed.z += lift;
    
    float curlBack = curlStrength * uCurlAmount;
    transformed.x += diff.x * curlBack * 0.4;
    transformed.y += diff.y * curlBack * 0.4;
    
    vCurlIntensity = curlStrength;
  } else {
    vCurlIntensity = 0.0;
  }
  
  vNormal = normalize(normalMatrix * normal);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`

const curlFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vCurlIntensity;

uniform sampler2D uTexture;
uniform float uCurlAmount;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  
  float shadow = 1.0 - (vCurlIntensity * 0.25);
  
  vec3 finalColor = texColor.rgb * shadow;
  
  gl_FragColor = vec4(finalColor, texColor.a);
}
`

export function FlatPage({
  imageUrl,
  isLeft,
  flipProgress,
  isFlipping,
  pageWidth,
  pageHeight
}: FlatPageProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.minFilter = THREE.LinearFilter
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.anisotropy = 16
      setTexture(loadedTexture)
    })
  }, [imageUrl])

  // Animate curl
  useFrame(() => {
    if (!materialRef.current || !isFlipping) return

    const material = materialRef.current

    // Smooth ease-out-cubic for fast, smooth curl
    const easedProgress = 1 - Math.pow(1 - flipProgress, 3)

    material.uniforms.uCurlAmount.value = easedProgress
  })

  if (!texture) return null

  // Position: left or right side of spread
  const xPosition = isLeft ? -pageWidth / 2 : pageWidth / 2

  // Curl origin: top-right for right page, top-left for left page
  const curlOrigin = isLeft
    ? new THREE.Vector2(0, 1)  // Top-left
    : new THREE.Vector2(1, 1)  // Top-right

  return (
    <mesh
      ref={meshRef}
      position={[xPosition, 0, 0.001]}
      rotation={[0, 0, 0]}
    >
      {/* High segment count for smooth curl */}
      <planeGeometry args={[pageWidth, pageHeight, 32, 32]} />

      {isFlipping && !isLeft ? (
        // Right page with curl shader when flipping
        <shaderMaterial
          ref={materialRef}
          vertexShader={curlVertexShader}
          fragmentShader={curlFragmentShader}
          uniforms={{
            uTexture: { value: texture },
            uCurlAmount: { value: 0 },
            uCurlOrigin: { value: curlOrigin },
            uCurlRadius: { value: 1.5 }
          }}
          side={THREE.DoubleSide}
        />
      ) : (
        // Static flat page (no curl)
        <meshBasicMaterial
          map={texture}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  )
}
