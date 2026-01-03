// Physical Paper Vertex Shader
// Simulates realistic page bending during flip
// Key principle: Page bends PERPENDICULAR to spine, strongest at free edge

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
  // This creates bending perpendicular to spine, like real paper
  float distanceFromSpine = uv.x;
  
  // Create smooth arc using sine curve
  // sin(x * π/2) gives natural 0° to 90° bend
  float bendCurve = sin(distanceFromSpine * 3.14159265 * 0.5);
  
  // Z displacement: page curves OUT of plane (3D depth)
  // Strongest at free edge, zero at spine
  transformed.z += bendCurve * uBendStrength * 0.35;
  
  // Y displacement: gravity pulls free edge down
  // Simulates weight of paper
  transformed.y -= bendCurve * uBendStrength * 0.18;
  
  // Corner lift effect (first 20% of flip)
  // Top-right corner lifts first, like real page turn
  if (uFlipProgress < 0.2) {
    float liftAmount = uCornerLift * uv.x * uv.y;
    transformed.z += liftAmount * 0.12;
    transformed.y += liftAmount * 0.05;
  }
  
  // Subtle wave effect during mid-flip (adds realism)
  if (uFlipProgress > 0.3 && uFlipProgress < 0.7) {
    float wave = sin(uv.y * 6.28318) * 0.015;
    transformed.x += wave * bendCurve * uBendStrength;
  }
  
  // Store bend amount for fragment shader
  vBend = bendCurve;
  
  // Calculate normal for lighting
  vNormal = normalize(normalMatrix * normal);
  
  // View position for Fresnel and specular
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
