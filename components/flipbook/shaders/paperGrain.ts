// Paper Grain Fragment Shader
export const paperGrainShader = `
uniform sampler2D map;
uniform vec3 lightDirection;
uniform float grainIntensity;

varying vec2 vUv;
varying vec3 vNormal;

// Grain noise function
float grain(vec2 uv) {
  return fract(sin(dot(uv * 1200.0, vec2(12.9898, 78.233))) * 43758.5453);
}

// Low frequency variation
float variation(vec2 uv) {
  return fract(sin(dot(uv * 80.0, vec2(15.234, 92.123))) * 23421.631);
}

void main() {
  // Base texture
  vec3 base = texture2D(map, vUv).rgb;
  
  // Light influence on grain visibility
  float lightInfluence = max(0.0, dot(vNormal, lightDirection));
  
  // Micro fiber noise
  float fiber = grain(vUv) * 0.03;
  
  // Paper thickness variation
  float thickness = variation(vUv) * 0.015;
  
  // Combine grain effects
  float totalGrain = (fiber + thickness) * lightInfluence * grainIntensity;
  
  // Apply to base color
  vec3 paper = base + vec3(totalGrain);
  
  gl_FragColor = vec4(paper, 1.0);
}
`

// Vertex Shader for paper grain
export const paperGrainVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
