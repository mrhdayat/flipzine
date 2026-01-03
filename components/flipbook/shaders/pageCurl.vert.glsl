// Page Curl Vertex Shader - Flipsnack Style
// Creates smooth corner peel effect for digital magazine

varying vec2 vUv;
varying vec3 vNormal;
varying float vCurlIntensity;

uniform float uCurlAmount;     // 0 to 1 (flip progress)
uniform vec2 uCurlOrigin;      // Corner position (1, 1) for top-right
uniform float uCurlRadius;     // How far curl spreads

void main() {
  vUv = uv;
  vec3 transformed = position;
  
  // Distance from curl origin (top-right corner by default)
  vec2 diff = uv - uCurlOrigin;
  float dist = length(diff);
  
  // Only curl within radius
  float curlStrength = 0.0;
  
  if (dist < uCurlRadius * uCurlAmount) {
    // Smooth falloff from origin
    curlStrength = smoothstep(
      uCurlRadius * uCurlAmount,
      0.0,
      dist
    );
    
    // Lift Z (page rises from surface)
    float lift = curlStrength * uCurlAmount * 0.3;
    transformed.z += lift;
    
    // Curl back (page bends toward back)
    float curlBack = curlStrength * uCurlAmount;
    transformed.x += diff.x * curlBack * 0.4;
    transformed.y += diff.y * curlBack * 0.4;
    
    // Store intensity for fragment shader (shadow under curl)
    vCurlIntensity = curlStrength;
  } else {
    vCurlIntensity = 0.0;
  }
  
  // Calculate normal for lighting
  vNormal = normalize(normalMatrix * normal);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
