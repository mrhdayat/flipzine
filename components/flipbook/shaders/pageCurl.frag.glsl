// Page Curl Fragment Shader - Flipsnack Style
// Clean, flat look with subtle shadow under curl

varying vec2 vUv;
varying vec3 vNormal;
varying float vCurlIntensity;

uniform sampler2D uTexture;
uniform float uCurlAmount;

void main() {
  // Base texture color
  vec4 texColor = texture2D(uTexture, vUv);
  
  // Subtle shadow under curled area
  float shadow = 1.0 - (vCurlIntensity * 0.25);
  
  // Clean, flat lighting (no glossy highlights)
  vec3 finalColor = texColor.rgb * shadow;
  
  gl_FragColor = vec4(finalColor, texColor.a);
}
