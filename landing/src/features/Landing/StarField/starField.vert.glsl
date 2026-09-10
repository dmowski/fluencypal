uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uSpin;

attribute float aScale;
attribute float aTwinkle;
attribute float aSeed;

varying vec3 vColor;
varying float vBrightness;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  if (uSpin > 0.0) {
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    angle += uSpin * uTime / (distanceToCenter + 0.4);
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;
  }

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  float twinkle = 0.88 + 0.12 * sin(uTime * aTwinkle + aSeed);
  gl_PointSize = uSize * aScale * twinkle * uPixelRatio;
  gl_PointSize *= (1.0 / max(0.35, -viewPosition.z));

  vColor = color;
  vBrightness = aScale * twinkle;
}
