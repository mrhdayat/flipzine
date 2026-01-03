// Fragment Shader - Glossy Magazine Paper Material
// Simulates coated magazine paper with grain, fresnel, and glossy finish

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vBend;

uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform float uFlipProgress;
uniform float uGlossiness;

// Procedural paper grain noise
// Creates subtle texture that makes it feel like real paper
float grain(vec2 uv) {
  return fract(sin(dot(uv * 1200.0, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fresnel effect for glossy coating
// Real magazine paper has a coating that reflects light at angles
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(0.0, dot(viewDir, normal)), power);
}

void main() {
  // Base texture from magazine page image
  vec4 baseColor = texture2D(uTexture, vUv);
  
  // Paper grain - very subtle, only 2% intensity
  // This is what makes it feel like paper, not a screen
  float grainNoise = grain(vUv) * 0.02;
  vec3 paperColor = baseColor.rgb + vec3(grainNoise);
  
  // Lighting calculations
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightDirection);
  
  // Diffuse lighting - basic light interaction
  float diffuse = max(0.0, dot(normal, lightDir));
  
  // Fresnel highlight - glossy magazine coating
  // This is what makes it look like a real glossy magazine
  float fresnelTerm = fresnel(viewDir, normal, 3.0);
  
  // Glossy reflection - stronger during flip
  // When page moves, the glossy coating catches more light
  float glossy = fresnelTerm * uGlossiness * (0.5 + uFlipProgress * 0.5);
  
  // Specular highlight - sharp light reflection
  // Creates that "expensive magazine" look
  vec3 halfVector = normalize(lightDir + viewDir);
  float specular = pow(max(0.0, dot(normal, halfVector)), 32.0) * 0.3;
  
  // Combine all lighting components
  vec3 lighting = vec3(0.4); // ambient base
  lighting += diffuse * 0.6;  // main light
  lighting += glossy * 0.15;  // glossy coating
  lighting += specular * uFlipProgress; // specular during flip
  
  // Edge vignette - subtle darkening at edges
  // Real paper has slightly darker edges
  float edgeFade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
  edgeFade *= smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  
  // Final color with all effects
  vec3 finalColor = paperColor * lighting * (0.9 + edgeFade * 0.1);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
