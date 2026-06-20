import { useEffect, useRef } from 'react'
import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  WebGLRenderer,
} from 'three'
import './PrismaticBurst.css'

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;
precision highp int;

varying vec2 vUv;

uniform vec2  uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;

float hash21(vec2 p){
  p = floor(p);
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx){
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
  float focal = res.y * max(dist, 1e-3);
  return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y));
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
  t = clamp(t, 0.0, 1.0);
  return texture2D(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t){
  float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
          + 0.7 * sin(q.y * 0.50 - t * 0.5)
          + 0.6 * sin(q.z * 0.60 + t * 0.7);
  return a;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  float t = uTime * uSpeed;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
  mat2 M2 = mat2(c.x, c.y, c.z, c.w);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

  mat3 rot3dMat = mat3(1.0);
  if(uAnimType == 1){
    vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
    rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
  }
  mat3 hoverMat = mat3(1.0);
  if(uAnimType == 2){
    vec2 m = uMouse * 2.0 - 1.0;
    vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
    hoverMat = rotY(ang.y) * rotX(ang.x);
  }

  for (int i = 0; i < 44; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));

    if(uAnimType == 0){
      Pl.xz *= M2;
    } else if(uAnimType == 1){
      Pl = rot3dMat * Pl;
    } else {
      Pl = hoverMat * Pl;
    }

    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

    float grow = smoothstep(0.35, 3.0, marchT);
    float a1 = amp * grow * bendAngle(Pl * 0.6, t);
    float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
    vec3 Pb = Pl;
    Pb.xz = rot2(Pb.xz, a1);
    Pb.xy = rot2(Pb.xy, a2);

    float rayPattern = smoothstep(
      0.5, 0.7,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
      sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    vec3 spectralDefault = 1.0 + vec3(
      cos(marchT * 3.0 + 0.0),
      cos(marchT * 3.0 + 1.0),
      cos(marchT * 3.0 + 2.0)
    );

    float saw = fract(marchT * 0.25);
    float tRay = saw * saw * (3.0 - 2.0 * saw);
    vec3 userGradient = 2.0 * sampleGradient(tRay);
    vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
    vec3 base = (0.05 / (0.4 + stepLen))
              * smoothstep(5.0, 0.0, rad)
              * spectral;

    col += base * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

const hexToRgb01 = (hex) => {
  let h = String(hex || '').trim()
  if (h.startsWith('#')) h = h.slice(1)
  if (h.length === 3) h = h.split('').map((char) => char + char).join('')

  const intVal = Number.parseInt(h, 16)
  if (Number.isNaN(intVal) || (h.length !== 6 && h.length !== 8)) return [1, 1, 1]

  return [((intVal >> 16) & 255) / 255, ((intVal >> 8) & 255) / 255, (intVal & 255) / 255]
}

const toPx = (value) => {
  if (value == null) return 0
  if (typeof value === 'number') return value

  const num = Number.parseFloat(String(value).trim().replace('px', ''))
  return Number.isNaN(num) ? 0 : num
}

const createGradientTexture = (colors = ['#ffffff']) => {
  const capped = colors.slice(0, 64)
  const data = new Uint8Array(capped.length * 4)

  capped.forEach((color, index) => {
    const [r, g, b] = hexToRgb01(color)
    data[index * 4] = Math.round(r * 255)
    data[index * 4 + 1] = Math.round(g * 255)
    data[index * 4 + 2] = Math.round(b * 255)
    data[index * 4 + 3] = 255
  })

  const texture = new DataTexture(data, Math.max(capped.length, 1), 1, RGBAFormat, UnsignedByteType)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.needsUpdate = true

  return texture
}

function PrismaticBurst({
  intensity = 2,
  speed = 0.5,
  animationType = 'rotate3d',
  colors = ['#ffffff'],
  distort = 0,
  paused = false,
  offset = { x: 0, y: 0 },
  hoverDampness = 0,
  rayCount = 0,
  mixBlendMode = 'lighten',
}) {
  const containerRef = useRef(null)
  const materialRef = useRef(null)
  const rendererRef = useRef(null)
  const gradientTextureRef = useRef(null)
  const mouseTargetRef = useRef([0.5, 0.5])
  const mouseSmoothRef = useRef([0.5, 0.5])
  const propsRef = useRef({ paused, hoverDampness })
  const visibleRef = useRef(true)

  useEffect(() => {
    propsRef.current.paused = paused
    propsRef.current.hoverDampness = hoverDampness
  }, [paused, hoverDampness])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return

    const nextColors = Array.isArray(colors) && colors.length > 0 ? colors : ['#ffffff']
    gradientTextureRef.current?.dispose()
    gradientTextureRef.current = createGradientTexture(nextColors)

    const animTypeMap = {
      rotate: 0,
      rotate3d: 1,
      hover: 2,
    }

    material.uniforms.uIntensity.value = intensity ?? 1
    material.uniforms.uSpeed.value = speed ?? 1
    material.uniforms.uAnimType.value = animTypeMap[animationType ?? 'rotate'] ?? 1
    material.uniforms.uColorCount.value = nextColors.length
    material.uniforms.uDistort.value = typeof distort === 'number' ? distort : 0
    material.uniforms.uOffset.value.set(toPx(offset?.x), toPx(offset?.y))
    material.uniforms.uGradient.value = gradientTextureRef.current
    material.uniforms.uRayCount.value = Math.max(0, Math.floor(rayCount ?? 0))
  }, [animationType, colors, distort, intensity, offset, rayCount, speed])

  useEffect(() => {
    const canvas = rendererRef.current?.domElement
    if (canvas) canvas.style.mixBlendMode = mixBlendMode && mixBlendMode !== 'none' ? mixBlendMode : ''
  }, [mixBlendMode])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderer = new WebGLRenderer({ alpha: false, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.domElement.style.mixBlendMode = mixBlendMode && mixBlendMode !== 'none' ? mixBlendMode : ''
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    gradientTextureRef.current = createGradientTexture(Array.isArray(colors) && colors.length > 0 ? colors : ['#ffffff'])

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uResolution: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
        uAnimType: { value: animationType === 'rotate' ? 0 : animationType === 'hover' ? 2 : 1 },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uColorCount: { value: Array.isArray(colors) ? colors.length : 0 },
        uDistort: { value: typeof distort === 'number' ? distort : 0 },
        uOffset: { value: new Vector2(toPx(offset?.x), toPx(offset?.y)) },
        uGradient: { value: gradientTextureRef.current },
        uNoiseAmount: { value: 0.8 },
        uRayCount: { value: Math.max(0, Math.floor(rayCount ?? 0)) },
      },
    })
    materialRef.current = material

    const geometry = new PlaneGeometry(2, 2)
    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    const resize = () => {
      const width = container.clientWidth || 1
      const height = container.clientHeight || 1
      renderer.setSize(width, height, false)
      material.uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height)
    }

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null
    resizeObserver?.observe(container)
    if (!resizeObserver) window.addEventListener('resize', resize)
    resize()

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect()
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1)
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1)
      mouseTargetRef.current = [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)]
    }
    container.addEventListener('pointermove', handlePointerMove, { passive: true })

    const intersectionObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          visibleRef.current = entry?.isIntersecting ?? true
        }, { threshold: 0.01 })
      : null
    intersectionObserver?.observe(container)

    let frameId = 0
    let last = performance.now()
    let accumTime = 0

    const update = (now) => {
      const dt = Math.max(0, now - last) * 0.001
      last = now

      if (!propsRef.current.paused) accumTime += dt

      if (visibleRef.current && !document.hidden) {
        const tau = 0.02 + Math.max(0, Math.min(1, propsRef.current.hoverDampness)) * 0.5
        const alpha = 1 - Math.exp(-dt / tau)
        const target = mouseTargetRef.current
        const smooth = mouseSmoothRef.current
        smooth[0] += (target[0] - smooth[0]) * alpha
        smooth[1] += (target[1] - smooth[1]) * alpha

        material.uniforms.uMouse.value.set(smooth[0], smooth[1])
        material.uniforms.uTime.value = accumTime
        renderer.render(scene, camera)
      }

      frameId = requestAnimationFrame(update)
    }

    frameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frameId)
      container.removeEventListener('pointermove', handlePointerMove)
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener('resize', resize)
      intersectionObserver?.disconnect()
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
      gradientTextureRef.current?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      materialRef.current = null
      rendererRef.current = null
      gradientTextureRef.current = null
    }
  }, [])

  return <div className="prismatic-burst-container" ref={containerRef} />
}

export default PrismaticBurst
