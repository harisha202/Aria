import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'

import './PixelSnow.css'

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uFlakeSize;
uniform float uMinFlakeSize;
uniform float uPixelResolution;
uniform float uSpeed;
uniform float uDepthFade;
uniform float uFarPlane;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;
uniform float uVariant;
uniform float uDirection;

#define PI 3.14159265
#define PI_OVER_6 0.5235988
#define PI_OVER_3 1.0471976

const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);
const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);
const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);
const vec2 b1d = vec2(0.574, 0.819);

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
  return vec3(
    hash13(p + 17.0),
    hash13(p + 43.0),
    hash13(p + 71.0)
  );
}

float snowflakeDist(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);
  vec2 q = r * vec2(cos(a), sin(a));
  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));
  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);
  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);
  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);
  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);
  return min(dMain, min(dB1, dB2)) * 10.0;
}

void main() {
  float pixelSize = max(1.0, floor(0.5 + uResolution.x / uPixelResolution));
  vec2 fragCoord = floor(gl_FragCoord.xy / pixelSize);
  vec2 res = uResolution / pixelSize;
  float invResX = 1.0 / res.x;

  vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));
  ray = ray.x * camI + ray.y * camJ + ray.z * camK;

  float timeSpeed = uTime * uSpeed;
  vec3 camPos = (cos(uDirection) * 0.4 * camI + sin(uDirection) * 0.4 * camJ + 0.1 * camK) * timeSpeed;
  vec3 pos = camPos;

  vec3 absRay = max(abs(ray), vec3(0.001));
  vec3 strides = 1.0 / absRay;
  vec3 raySign = step(ray, vec3(0.0));
  vec3 phase = fract(pos) * strides;
  phase = mix(strides - phase, phase, raySign);

  float invRayDotCamK = 1.0 / max(dot(ray, camK), 0.001);
  float halfInvResX = 0.5 * invResX;
  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);

  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    if (t >= uFarPlane) break;

    vec3 fpos = floor(pos);
    if (hash13(fpos) < uDensity) {
      vec3 h = hash33(fpos);
      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(fpos.yzx * 0.073) + 4.0 * sin(fpos.zxy * 0.27) + 2.0 * h + timeAnim);
      flakePos = flakePos * 0.8 + 0.1 + fpos;

      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;

      if (toIntersection > 0.0) {
        vec3 testPos = pos + ray * toIntersection - flakePos;
        float testX = dot(testPos, camI);
        float testY = dot(testPos, camJ);
        vec2 testUV = abs(vec2(testX, testY));

        float depth = dot(flakePos - camPos, camK);
        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);

        float dist;
        if (uVariant < 0.5) {
          dist = max(testUV.x, testUV.y);
        } else if (uVariant < 1.5) {
          dist = length(testUV);
        } else {
          dist = snowflakeDist(vec2(testX, testY) / flakeSize) * flakeSize;
        }

        if (dist < flakeSize) {
          float ratio = uFlakeSize / flakeSize;
          float intensity = exp2(-(t + toIntersection) / uDepthFade) * min(1.0, ratio * ratio) * uBrightness;
          gl_FragColor = vec4(uColor * pow(vec3(intensity), vec3(uGamma)), intensity);
          return;
        }
      }
    }

    float nextStep = min(min(phase.x, phase.y), phase.z);
    vec3 sel = step(phase, vec3(nextStep));
    phase = phase - nextStep + strides * sel;
    t += nextStep;
    pos = pos + ray * nextStep;
  }

  gl_FragColor = vec4(0.0);
}
`

function PixelSnow({
  color = '#ffffff',
  flakeSize = 0.01,
  minFlakeSize = 1.25,
  pixelResolution = 200,
  speed = 1.25,
  depthFade = 8,
  farPlane = 20,
  brightness = 1,
  gamma = 0.4545,
  density = 0.3,
  variant = 'square',
  direction = 125,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null)
  const animationRef = useRef(0)
  const isVisibleRef = useRef(true)
  const rendererRef = useRef(null)
  const materialRef = useRef(null)
  const resizeTimeoutRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const variantValue = useMemo(() => {
    if (variant === 'round') return 1
    if (variant === 'snowflake') return 2
    return 0
  }, [variant])

  const colorVector = useMemo(() => {
    const threeColor = new Color(color)
    return new Vector3(threeColor.r, threeColor.g, threeColor.b)
  }, [color])

  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)

    resizeTimeoutRef.current = window.setTimeout(() => {
      const container = containerRef.current
      const renderer = rendererRef.current
      const material = materialRef.current
      if (!container || !renderer || !material) return

      const width = container.offsetWidth
      const height = container.offsetHeight
      renderer.setSize(width, height)
      material.uniforms.uResolution.value.set(width, height)
    }, 100)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new WebGLRenderer({
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vector2(container.offsetWidth, container.offsetHeight) },
        uFlakeSize: { value: flakeSize },
        uMinFlakeSize: { value: minFlakeSize },
        uPixelResolution: { value: pixelResolution },
        uSpeed: { value: speed },
        uDepthFade: { value: depthFade },
        uFarPlane: { value: farPlane },
        uColor: { value: colorVector.clone() },
        uBrightness: { value: brightness },
        uGamma: { value: gamma },
        uDensity: { value: density },
        uVariant: { value: variantValue },
        uDirection: { value: (direction * Math.PI) / 180 },
      },
      transparent: true,
    })
    materialRef.current = material

    const geometry = new PlaneGeometry(2, 2)
    scene.add(new Mesh(geometry, material))

    window.addEventListener('resize', handleResize)

    const startTime = performance.now()
    const animate = () => {
      if (prefersReducedMotion) {
        if (isVisibleRef.current) {
          material.uniforms.uTime.value = 0
          renderer.render(scene, camera)
        }
        return
      }

      animationRef.current = requestAnimationFrame(animate)
      if (isVisibleRef.current) {
        material.uniforms.uTime.value = (performance.now() - startTime) * 0.001
        renderer.render(scene, camera)
      }
    }
    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      renderer.dispose()
      renderer.forceContextLoss()
      geometry.dispose()
      material.dispose()
      rendererRef.current = null
      materialRef.current = null
    }
  }, [colorVector, depthFade, density, direction, farPlane, flakeSize, gamma, handleResize, minFlakeSize, pixelResolution, speed, brightness, variantValue, prefersReducedMotion])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return

    material.uniforms.uFlakeSize.value = flakeSize
    material.uniforms.uMinFlakeSize.value = minFlakeSize
    material.uniforms.uPixelResolution.value = pixelResolution
    material.uniforms.uSpeed.value = speed
    material.uniforms.uDepthFade.value = depthFade
    material.uniforms.uFarPlane.value = farPlane
    material.uniforms.uBrightness.value = brightness
    material.uniforms.uGamma.value = gamma
    material.uniforms.uDensity.value = density
    material.uniforms.uVariant.value = variantValue
    material.uniforms.uDirection.value = (direction * Math.PI) / 180
    material.uniforms.uColor.value.copy(colorVector)
  }, [brightness, colorVector, density, depthFade, direction, farPlane, flakeSize, gamma, minFlakeSize, pixelResolution, speed, variantValue])

  return <div ref={containerRef} className={`pixel-snow-container ${className}`} style={style} aria-hidden="true" />
}

export default PixelSnow
