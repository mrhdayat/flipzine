// Paper Material GLSL Shaders
// Physical paper with grain, fresnel, and glossy coating

export const paperVertexShader = `
uniform float uFlipProgress;
uniform float uBendStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vBend;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec3 transformed = position;
  
  // Bend calculation - strongest near spine (left edge)
  // uv.x: 0 (spine) to 1 (outer edge)
  float distanceFromSpine = uv.x;
  
  // Sine curve for natural paper bend
  // Peak bend in middle, flat at edges
  float bendCurve = sin(distanceFromSpine * 3.14159) * uBendStrength;
  
  // Apply Z displacement for curvature
  // Pages bend UP during flip (positive Z)
  transformed.z += bendCurve * uFlipProgress;
  
  // Slight Y displacement for realistic droop
  transformed.y -= bendCurve * 0.3 * uFlipProgress;
  
  vBend = bendCurve;
  
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`

export const paperFragmentShader = `
uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform float uFlipProgress;
uniform float uGlossiness;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vBend;

// Procedural paper grain noise
float grain(vec2 uv) {
  return fract(sin(dot(uv * 1200.0, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fresnel effect for glossy coating
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(0.0, dot(viewDir, normal)), power);
}

void main() {
  // Base texture
  vec4 baseColor = texture2D(uTexture, vUv);
  
  // Paper grain (very subtle)
  float grainNoise = grain(vUv) * 0.02;
  vec3 paperColor = baseColor.rgb + vec3(grainNoise);
  
  // Lighting
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightDirection);
  
  // Diffuse lighting
  float diffuse = max(0.0, dot(normal, lightDir));
  
  // Fresnel highlight (glossy magazine coating)
  float fresnelTerm = fresnel(viewDir, normal, 3.0);
  
  // Glossy reflection (stronger during flip)
  float glossy = fresnelTerm * uGlossiness * (0.5 + uFlipProgress * 0.5);
  
  // Specular highlight
  vec3 halfVector = normalize(lightDir + viewDir);
  float specular = pow(max(0.0, dot(normal, halfVector)), 32.0) * 0.3;
  
  // Combine lighting
  vec3 lighting = vec3(0.4); // ambient
  lighting += diffuse * 0.6;
  lighting += glossy * 0.15;
  lighting += specular * uFlipProgress;
  
  // Edge vignette (subtle)
  float edgeFade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
  edgeFade *= smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  
  vec3 finalColor = paperColor * lighting * (0.9 + edgeFade * 0.1);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`
