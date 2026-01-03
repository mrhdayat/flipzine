'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PageProps {
  index: number
  imageUrl: string
  isLeftPage: boolean
  flipProgress: number
  isFlipping: boolean
  pageWidth: number
  pageHeight: number
  zPosition?: number // Z-position for stacking on top of page stack
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float uFlipProgress;
uniform float uBendStrength;
uniform float uIsLeftPage;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec3 transformed = position;
  
  float distanceFromSpine = uIsLeftPage > 0.5 ? (1.0 - uv.x) : uv.x;
  float bendCurve = sin(distanceFromSpine * 3.14159) * uBendStrength;
  
  transformed.z += bendCurve * uFlipProgress;
  transformed.y -= bendCurve * 0.3 * uFlipProgress;
  
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform float uFlipProgress;
uniform float uGlossiness;

float grain(vec2 uv) {
  return fract(sin(dot(uv * 1200.0, vec2(12.9898, 78.233))) * 43758.5453);
}

float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(0.0, dot(viewDir, normal)), power);
}

void main() {
  vec4 baseColor = texture2D(uTexture, vUv);
  
  float grainNoise = grain(vUv) * 0.02;
  vec3 paperColor = baseColor.rgb + vec3(grainNoise);
  
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightDirection);
  
  float diffuse = max(0.0, dot(normal, lightDir));
  float fresnelTerm = fresnel(viewDir, normal, 3.0);
  float glossy = fresnelTerm * uGlossiness * (0.5 + uFlipProgress * 0.5);
  
  vec3 halfVector = normalize(lightDir + viewDir);
  float specular = pow(max(0.0, dot(normal, halfVector)), 32.0) * 0.3;
  
  vec3 lighting = vec3(0.4);
  lighting += diffuse * 0.6;
  lighting += glossy * 0.15;
  lighting += specular * uFlipProgress;
  
  float edgeFade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
  edgeFade *= smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  
  vec3 finalColor = paperColor * lighting * (0.9 + edgeFade * 0.1);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`

export function Page({
  index,
  imageUrl,
  isLeftPage,
  flipProgress,
  isFlipping,
  pageWidth,
  pageHeight,
  zPosition = 0
}: PageProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.minFilter = THREE.LinearFilter
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.anisotropy = 16
      setTexture(loadedTexture)
    })
  }, [imageUrl])

  useFrame(() => {
    if (!materialRef.current) return

    const material = materialRef.current

    if (isFlipping) {
      material.uniforms.uFlipProgress.value = flipProgress
      material.uniforms.uBendStrength.value = Math.sin(flipProgress * Math.PI) * 0.4
      material.uniforms.uGlossiness.value = 0.8 + flipProgress * 0.2
    } else {
      material.uniforms.uFlipProgress.value = 0
      material.uniforms.uBendStrength.value = 0
      material.uniforms.uGlossiness.value = 0.6
    }
  })

  if (!texture) return null

  const xPosition = isLeftPage
    ? -pageWidth / 2 - 0.02
    : pageWidth / 2 + 0.02

  const currentRotation = (!isLeftPage && isFlipping)
    ? -flipProgress * Math.PI
    : 0

  return (
    <mesh
      ref={meshRef}
      position={[xPosition, 0, zPosition + 0.001]} // Slightly above stack
      rotation={[0, currentRotation, 0]}
      castShadow
      receiveShadow
    >
      <planeGeometry args={[pageWidth, pageHeight, 48, 8]} />

      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: texture },
          uFlipProgress: { value: 0 },
          uBendStrength: { value: 0 },
          uLightDirection: { value: new THREE.Vector3(0.5, 0.8, 0.6).normalize() },
          uGlossiness: { value: 0.6 },
          uIsLeftPage: { value: isLeftPage ? 1.0 : 0.0 },
        }}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
