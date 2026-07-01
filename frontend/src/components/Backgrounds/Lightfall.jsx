import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './Lightfall.css'

const MAX_COLORS = 8

const hexToRGB = (hex) => {
  const c = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ]
}

const prepColors = (input) => {
  const base = (input?.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS)
  const count = base.length
  const arr = []
  for (let i = 0; i < MAX_COLORS; i += 1) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]))

  const avg = [0, 0, 0]
  for (let i = 0; i < count; i += 1) {
    avg[0] += arr[i][0]
    avg[1] += arr[i][1]
    avg[2] += arr[i][2]
  }
  avg[0] /= count
  avg[1] /= count
  avg[2] /= count

  return { arr, count, avg }
}

const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;
uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader)
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
  if (!vertex || !fragment) return null

  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

function Lightfall({
  className,
  dpr,
  paused = false,
  colors = ['#A6C8FF', '#5227FF', '#FF9FFC'],
  backgroundColor = '#0A29FF',
  speed = 0.5,
  streakCount = 2,
  streakWidth = 1,
  streakLength = 1,
  glow = 1,
  density = 0.6,
  twinkle = 1,
  zoom = 3,
  backgroundGlow = 0.5,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
  mouseDampening = 0.15,
  mixBlendMode,
}) {
  const containerRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) return undefined

    const program = createProgram(gl)
    if (!program) return undefined

    container.appendChild(canvas)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const uniform = (name) => gl.getUniformLocation(program, name)
    const uniforms = {
      iResolution: uniform('iResolution'),
      iMouse: uniform('iMouse'),
      iTime: uniform('iTime'),
      uColor0: uniform('uColor0'),
      uColor1: uniform('uColor1'),
      uColor2: uniform('uColor2'),
      uColor3: uniform('uColor3'),
      uColor4: uniform('uColor4'),
      uColor5: uniform('uColor5'),
      uColor6: uniform('uColor6'),
      uColor7: uniform('uColor7'),
      uColorCount: uniform('uColorCount'),
      uBgColor: uniform('uBgColor'),
      uMouseColor: uniform('uMouseColor'),
      uSpeed: uniform('uSpeed'),
      uStreakCount: uniform('uStreakCount'),
      uStreakWidth: uniform('uStreakWidth'),
      uStreakLength: uniform('uStreakLength'),
      uGlow: uniform('uGlow'),
      uDensity: uniform('uDensity'),
      uTwinkle: uniform('uTwinkle'),
      uZoom: uniform('uZoom'),
      uBgGlow: uniform('uBgGlow'),
      uOpacity: uniform('uOpacity'),
      uMouseEnabled: uniform('uMouseEnabled'),
      uMouseStrength: uniform('uMouseStrength'),
      uMouseRadius: uniform('uMouseRadius'),
    }

    const { arr, count, avg } = prepColors(colors)
    arr.forEach((color, index) => {
      gl.uniform3f(uniforms[`uColor${index}`], color[0], color[1], color[2])
    })
    const bg = hexToRGB(backgroundColor)
    gl.uniform1i(uniforms.uColorCount, count)
    gl.uniform3f(uniforms.uBgColor, bg[0], bg[1], bg[2])
    gl.uniform3f(uniforms.uMouseColor, avg[0], avg[1], avg[2])
    gl.uniform1f(uniforms.uSpeed, speed)
    gl.uniform1i(uniforms.uStreakCount, Math.max(1, Math.min(16, Math.round(streakCount))))
    gl.uniform1f(uniforms.uStreakWidth, streakWidth)
    gl.uniform1f(uniforms.uStreakLength, streakLength)
    gl.uniform1f(uniforms.uGlow, glow)
    gl.uniform1f(uniforms.uDensity, density)
    gl.uniform1f(uniforms.uTwinkle, twinkle)
    gl.uniform1f(uniforms.uZoom, zoom)
    gl.uniform1f(uniforms.uBgGlow, backgroundGlow)
    gl.uniform1f(uniforms.uOpacity, opacity)
    gl.uniform1f(uniforms.uMouseEnabled, mouseInteraction ? 1 : 0)
    gl.uniform1f(uniforms.uMouseStrength, mouseStrength)
    gl.uniform1f(uniforms.uMouseRadius, mouseRadius)

    let animationFrameId
    let lastTime = 0
    let mouseTarget = [0, 0]
    const mouseCurrent = [0, 0]

    const resize = () => {
      const pixelRatio = dpr ?? window.devicePixelRatio ?? 1
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width * pixelRatio))
      const height = Math.max(1, Math.floor(rect.height * pixelRatio))
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.uniform3f(uniforms.iResolution, width, height, 1)
    }

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = dpr ?? window.devicePixelRatio ?? 1
      mouseTarget = [
        (event.clientX - rect.left) * pixelRatio,
        (rect.height - (event.clientY - rect.top)) * pixelRatio,
      ]
      if (mouseDampening <= 0) {
        mouseCurrent[0] = mouseTarget[0]
        mouseCurrent[1] = mouseTarget[1]
      }
    }

    const loop = (time) => {
      if (prefersReducedMotion) {
        gl.uniform1f(uniforms.iTime, 0)
        gl.uniform2f(uniforms.iMouse, mouseCurrent[0], mouseCurrent[1])
        if (!paused) gl.drawArrays(gl.TRIANGLES, 0, 3)
        return
      }
      
      animationFrameId = requestAnimationFrame(loop)
      gl.uniform1f(uniforms.iTime, time * 0.001)

      if (mouseDampening > 0) {
        if (!lastTime) lastTime = time
        const dt = (time - lastTime) / 1000
        lastTime = time
        const factor = Math.min(1, 1 - Math.exp(-dt / Math.max(0.0001, mouseDampening)))
        mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * factor
        mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * factor
      }

      gl.uniform2f(uniforms.iMouse, mouseCurrent[0], mouseCurrent[1])
      if (!paused) gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    if (mouseInteraction) canvas.addEventListener('pointermove', onPointerMove)
    animationFrameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [
    dpr,
    paused,
    colors,
    backgroundColor,
    speed,
    streakCount,
    streakWidth,
    streakLength,
    glow,
    density,
    twinkle,
    zoom,
    backgroundGlow,
    opacity,
    mouseInteraction,
    mouseStrength,
    mouseRadius,
    mouseDampening,
    prefersReducedMotion,
  ])

  return (
    <div
      ref={containerRef}
      className={`lightfall-container ${className ?? ''}`}
      style={mixBlendMode ? { mixBlendMode } : undefined}
    />
  )
}

export default Lightfall
