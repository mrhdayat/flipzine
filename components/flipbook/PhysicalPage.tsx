'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

interface PhysicalPageProps {
  index: number
  imageUrl: string
  isLeft: boolean
  flipProgress: number
  isFlipping: boolean
  pageWidth: number
  pageHeight: number
  pageThickness: number
}

// Import shaders
const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vBend;

uniform float uFlipProgress;
uniform float uBendStrength;
uniform float uCornerLift;

void main() {
  vUv = uv;
  
  vec3 transformed = position;
  
  // CRITICAL: Distance from spine (0.0 at spine, 1.0 at free edge)
  float distanceFromSpine = uv.x;
  
  // Create smooth arc using sine curve
  float bendCurve = sin(distanceFromSpine * 3.14159265 * 0.5);
  
  // Z displacement: page curves OUT of plane
  transformed.z += bendCurve * uBendStrength * 0.35;
  
  // Y displacement: gravity pulls free edge down
  transformed.y -= bendCurve * uBendStrength * 0.18;
  
  // Corner lift effect (first 20% of flip)
  if (uFlipProgress < 0.2) {
    float liftAmount = uCornerLift * uv.x * uv.y;
    transformed.z += liftAmount * 0.12;
    transformed.y += liftAmount * 0.05;
  }
  
  // Subtle wave effect during mid-flip
  if (uFlipProgress > 0.3 && uFlipProgress < 0.7) {
    float wave = sin(uv.y * 6.28318) * 0.015;
    transformed.x += wave * bendCurve * uBendStrength;
  }
  
  vBend = bendCurve;
  vNormal = normalize(normalMatrix * normal);
  
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vBend;

uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform float uFlipProgress;
uniform float uGlossiness;

// Procedural paper grain
float grain(vec2 uv) {
  return fract(sin(dot(uv * 1200.0, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fresnel for glossy highlights
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(0.0, dot(viewDir, normal)), power);
}

void main() {
  vec4 baseColor = texture2D(uTexture, vUv);
  
  // Add subtle paper grain
  float grainNoise = grain(vUv) * 0.025;
  vec3 paperColor = baseColor.rgb + vec3(grainNoise);
  
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightDirection);
  
  // Diffuse lighting
  float diffuse = max(0.0, dot(normal, lightDir));
  
  // Fresnel for glossy coated paper
  float fresnelTerm = fresnel(viewDir, normal, 3.0);
  float glossy = fresnelTerm * uGlossiness * (0.5 + uFlipProgress * 0.5);
  
  // Specular highlight
  vec3 halfVector = normalize(lightDir + viewDir);
  float specular = pow(max(0.0, dot(normal, halfVector)), 32.0) * 0.35;
  
  // Combine lighting
  vec3 lighting = vec3(0.45);
  lighting += diffuse * 0.65;
  lighting += glossy * 0.18;
  lighting += specular * uFlipProgress * 0.4;
  
  // Edge darkening for depth
  float edgeFade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
  edgeFade *= smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  
  vec3 finalColor = paperColor * lighting * (0.88 + edgeFade * 0.12);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`

export function PhysicalPage({
  index,
  imageUrl,
  isLeft,
  flipProgress,
  isFlipping,
  pageWidth,
  pageHeight,
  pageThickness
}: PhysicalPageProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  // CRITICAL: Create geometry with pivot at SPINE (left edge)
  // This is the key difference from card-like rotation
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      pageWidth,
      pageHeight,
      48, // High segment count for smooth bending
      8
    )

    // PIVOT CORRECTION: Move pivot from center to left edge (spine)
    // Without this, page rotates like a card, not like paper attached to spine
    geo.translate(pageWidth / 2, 0, 0)

    return geo
  }, [pageWidth, pageHeight])

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

  // Animate shader uniforms
  useFrame(() => {
    if (!materialRef.current) return

    const material = materialRef.current

    if (isFlipping) {
      // Micro-animation timeline
      const bendStrength = calculateBendStrength(flipProgress)
      const cornerLift = calculateCornerLift(flipProgress)

      material.uniforms.uFlipProgress.value = flipProgress
      material.uniforms.uBendStrength.value = bendStrength
      material.uniforms.uCornerLift.value = cornerLift
      material.uniforms.uGlossiness.value = 0.8 + flipProgress * 0.25
    } else {
      material.uniforms.uFlipProgress.value = 0
      material.uniforms.uBendStrength.value = 0
      material.uniforms.uCornerLift.value = 0
      material.uniforms.uGlossiness.value = 0.65
    }
  })

  if (!texture) return null

  // Position: left pages on left side, right pages at spine (x=0)
  // Because pivot is at left edge, right pages start at x=0 (spine)
  const xPosition = isLeft ? -pageWidth : 0
  const zPosition = index * pageThickness

  // Rotation happens around left edge (spine), not center
  // Only right pages flip (left pages are already flipped)
  const rotation = isFlipping && !isLeft
    ? [0, -flipProgress * Math.PI, 0] as [number, number, number]
    : [0, 0, 0] as [number, number, number]

  return (
    <mesh
      ref={meshRef}
      position={[xPosition, 0, zPosition]}
      rotation={rotation}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: texture },
          uFlipProgress: { value: 0 },
          uBendStrength: { value: 0 },
          uCornerLift: { value: 0 },
          uLightDirection: { value: new THREE.Vector3(0.5, 0.8, 0.6).normalize() },
          uGlossiness: { value: 0.65 },
        }}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Micro-animation timeline helpers

function calculateBendStrength(progress: number): number {
  // Bend increases from 0-40%, peaks at 50%, decreases to 90%
  if (progress < 0.4) {
    return progress / 0.4 // 0 to 1
  } else if (progress < 0.5) {
    return 1.0 // Peak
  } else if (progress < 0.9) {
    return 1.0 - ((progress - 0.5) / 0.4) // 1 to 0
  } else {
    return 0
  }
}

function calculateCornerLift(progress: number): number {
  // Corner lifts in first 20% of flip
  if (progress < 0.2) {
    return progress * 5 // 0 to 1
  }
  return 0
}
