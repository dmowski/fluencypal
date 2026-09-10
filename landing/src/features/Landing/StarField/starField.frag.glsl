varying vec3 vColor;
varying float vBrightness;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p) * 2.0;

  float core = pow(max(0.0, 1.0 - d), 7.5);
  float halo = pow(max(0.0, 1.0 - d), 2.2) * 0.22;

  float spike = 0.0;
  float spikeMix = smoothstep(0.7, 1.35, vBrightness);
  if (spikeMix > 0.0) {
    float sx = 1.0 - smoothstep(0.0, 0.018, abs(p.x));
    float sy = 1.0 - smoothstep(0.0, 0.42, abs(p.y));
    float sy2 = 1.0 - smoothstep(0.0, 0.018, abs(p.y));
    float sx2 = 1.0 - smoothstep(0.0, 0.42, abs(p.x));
    spike = (sx * sy + sy2 * sx2) * 0.38 * spikeMix;
  }

  float strength = core + halo + spike;
  if (strength < 0.012) {
    discard;
  }

  gl_FragColor = vec4(vColor * strength, 1.0);
  #include <colorspace_fragment>
}
