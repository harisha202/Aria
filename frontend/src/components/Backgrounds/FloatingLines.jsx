import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './FloatingLines.css'

const vertexShader = `
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform vec2 parallaxOffset;

uniform vec3 gradientStart;
uniform vec3 gradientMid;
uniform vec3 gradientEnd;

const int MAX_LINES = 32;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 getLineColor(float t) {
  float clampedT = clamp(t, 0.0, 1.0);
  if (clampedT < 0.5) {
    return mix(gradientStart, gradientMid, clampedT * 2.0) * 0.55;
  }
  return mix(gradientMid, gradientEnd, (clampedT - 0.5) * 2.0) * 0.55;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float xOffset = offset;
  float xMovement = time * 0.1;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + xOffset + xMovement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void main() {
  vec2 baseUv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);
  vec2 mouseUv = vec2(0.0);

  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < MAX_LINES; ++i) {
      if (i >= bottomLineCount) {
        break;
      }

      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);

      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < MAX_LINES; ++i) {
      if (i >= middleLineCount) {
        break;
      }

      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);

      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < MAX_LINES; ++i) {
      if (i >= topLineCount) {
        break;
      }

      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;

      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

  gl_FragColor = vec4(col, 1.0);
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

function hexToRgb(hex) {
  let value = hex.trim()

  if (value.startsWith('#')) {
    value = value.slice(1)
  }

  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('')
  }

  const fallback = [1, 1, 1]
  if (value.length !== 6) return fallback

  const numberValue = Number.parseInt(value, 16)
  if (Number.isNaN(numberValue)) return fallback

  return [
    ((numberValue >> 16) & 255) / 255,
    ((numberValue >> 8) & 255) / 255,
    (numberValue & 255) / 255,
  ]
}

function waveValue(value, waveType, enabledWaves, fallback) {
  if (typeof value === 'number') return value
  if (!Array.isArray(value)) return fallback

  const index = enabledWaves.indexOf(waveType)
  return index >= 0 ? value[index] ?? fallback : fallback
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = ['top', 'middle', 'bottom'],
  lineCount = 8,
  lineDistance = 39.5,
  topWavePosition = { x: 10.0, y: 0.5, rotate: -0.4 },
  middleWavePosition = { x: 5.0, y: 0.0, rotate: 0.2 },
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: 0.4 },
  animationSpeed = 2.3,
  interactive = true,
  bendRadius = 8,
  bendStrength = 1.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  gradientStart = '#06B6D4',
  gradientMid = '#06B6D4',
  gradientEnd = '#10B981',
  className = '',
  style,
}) {
  const containerRef = useRef(null)
  const mouseRef = useRef({
    currentX: -1000,
    currentY: -1000,
    targetX: -1000,
    targetY: -1000,
    currentInfluence: 0,
    targetInfluence: 0,
    currentParallaxX: 0,
    currentParallaxY: 0,
    targetParallaxX: 0,
    targetParallaxY: 0,
  })
  const prefersReducedMotion = useReducedMotion()

  const gradient = useMemo(() => {
    const stops = linesGradient?.length ? linesGradient : [gradientStart, gradientMid, gradientEnd]
    const start = stops[0] ?? gradientStart
    const mid = stops[Math.floor((stops.length - 1) / 2)] ?? gradientMid
    const end = stops[stops.length - 1] ?? gradientEnd

    return {
      start: hexToRgb(start),
      mid: hexToRgb(mid),
      end: hexToRgb(end),
    }
  }, [gradientEnd, gradientMid, gradientStart, linesGradient])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true })
    if (!gl) return undefined

    const program = createProgram(gl)
    if (!program) return undefined

    container.appendChild(canvas)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    gl.useProgram(program)
    gl.clearColor(0, 0, 0, 1)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {
      iTime: gl.getUniformLocation(program, 'iTime'),
      iResolution: gl.getUniformLocation(program, 'iResolution'),
      animationSpeed: gl.getUniformLocation(program, 'animationSpeed'),
      enableTop: gl.getUniformLocation(program, 'enableTop'),
      enableMiddle: gl.getUniformLocation(program, 'enableMiddle'),
      enableBottom: gl.getUniformLocation(program, 'enableBottom'),
      topLineCount: gl.getUniformLocation(program, 'topLineCount'),
      middleLineCount: gl.getUniformLocation(program, 'middleLineCount'),
      bottomLineCount: gl.getUniformLocation(program, 'bottomLineCount'),
      topLineDistance: gl.getUniformLocation(program, 'topLineDistance'),
      middleLineDistance: gl.getUniformLocation(program, 'middleLineDistance'),
      bottomLineDistance: gl.getUniformLocation(program, 'bottomLineDistance'),
      topWavePosition: gl.getUniformLocation(program, 'topWavePosition'),
      middleWavePosition: gl.getUniformLocation(program, 'middleWavePosition'),
      bottomWavePosition: gl.getUniformLocation(program, 'bottomWavePosition'),
      iMouse: gl.getUniformLocation(program, 'iMouse'),
      interactive: gl.getUniformLocation(program, 'interactive'),
      bendRadius: gl.getUniformLocation(program, 'bendRadius'),
      bendStrength: gl.getUniformLocation(program, 'bendStrength'),
      bendInfluence: gl.getUniformLocation(program, 'bendInfluence'),
      parallax: gl.getUniformLocation(program, 'parallax'),
      parallaxOffset: gl.getUniformLocation(program, 'parallaxOffset'),
      gradientStart: gl.getUniformLocation(program, 'gradientStart'),
      gradientMid: gl.getUniformLocation(program, 'gradientMid'),
      gradientEnd: gl.getUniformLocation(program, 'gradientEnd'),
    }

    const topCount = Math.min(32, Math.max(0, Math.floor(waveValue(lineCount, 'top', enabledWaves, 8))))
    const middleCount = Math.min(32, Math.max(0, Math.floor(waveValue(lineCount, 'middle', enabledWaves, 8))))
    const bottomCount = Math.min(32, Math.max(0, Math.floor(waveValue(lineCount, 'bottom', enabledWaves, 8))))

    gl.uniform1f(uniforms.animationSpeed, animationSpeed)
    gl.uniform1i(uniforms.enableTop, enabledWaves.includes('top') ? 1 : 0)
    gl.uniform1i(uniforms.enableMiddle, enabledWaves.includes('middle') ? 1 : 0)
    gl.uniform1i(uniforms.enableBottom, enabledWaves.includes('bottom') ? 1 : 0)
    gl.uniform1i(uniforms.topLineCount, topCount)
    gl.uniform1i(uniforms.middleLineCount, middleCount)
    gl.uniform1i(uniforms.bottomLineCount, bottomCount)
    gl.uniform1f(uniforms.topLineDistance, waveValue(lineDistance, 'top', enabledWaves, 39.5) * 0.01)
    gl.uniform1f(uniforms.middleLineDistance, waveValue(lineDistance, 'middle', enabledWaves, 39.5) * 0.01)
    gl.uniform1f(uniforms.bottomLineDistance, waveValue(lineDistance, 'bottom', enabledWaves, 39.5) * 0.01)
    gl.uniform3f(uniforms.topWavePosition, topWavePosition.x, topWavePosition.y, topWavePosition.rotate)
    gl.uniform3f(uniforms.middleWavePosition, middleWavePosition.x, middleWavePosition.y, middleWavePosition.rotate)
    gl.uniform3f(uniforms.bottomWavePosition, bottomWavePosition.x, bottomWavePosition.y, bottomWavePosition.rotate)
    gl.uniform1i(uniforms.interactive, interactive ? 1 : 0)
    gl.uniform1f(uniforms.bendRadius, bendRadius)
    gl.uniform1f(uniforms.bendStrength, bendStrength)
    gl.uniform1i(uniforms.parallax, parallax ? 1 : 0)
    gl.uniform3f(uniforms.gradientStart, gradient.start[0], gradient.start[1], gradient.start[2])
    gl.uniform3f(uniforms.gradientMid, gradient.mid[0], gradient.mid[1], gradient.mid[2])
    gl.uniform3f(uniforms.gradientEnd, gradient.end[0], gradient.end[1], gradient.end[2])

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 3)
      const width = Math.max(1, Math.floor(container.clientWidth * pixelRatio))
      const height = Math.max(1, Math.floor(container.clientHeight * pixelRatio))

      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.uniform3f(uniforms.iResolution, width, height, 1)
    }

    const updatePointer = (event) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const pixelRatio = canvas.width / rect.width

      mouseRef.current.targetX = x * pixelRatio
      mouseRef.current.targetY = (rect.height - y) * pixelRatio
      mouseRef.current.targetInfluence = 1

      if (parallax) {
        mouseRef.current.targetParallaxX = ((x - rect.width / 2) / rect.width) * parallaxStrength
        mouseRef.current.targetParallaxY = (-(y - rect.height / 2) / rect.height) * parallaxStrength
      }
    }

    const clearPointer = () => {
      mouseRef.current.targetInfluence = 0
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize()
          })
        : null

    resize()
    observer?.observe(container)
    window.addEventListener('resize', resize)

    if (interactive) {
      window.addEventListener('pointermove', updatePointer)
      window.addEventListener('pointerleave', clearPointer)
      window.addEventListener('blur', clearPointer)
    }

    let animationFrameId
    const startedAt = performance.now()

    const render = (time) => {
      const state = mouseRef.current

      state.currentX += (state.targetX - state.currentX) * mouseDamping
      state.currentY += (state.targetY - state.currentY) * mouseDamping
      state.currentInfluence += (state.targetInfluence - state.currentInfluence) * mouseDamping
      state.currentParallaxX += (state.targetParallaxX - state.currentParallaxX) * mouseDamping
      state.currentParallaxY += (state.targetParallaxY - state.currentParallaxY) * mouseDamping

      if (prefersReducedMotion) {
        gl.uniform1f(uniforms.iTime, 0)
        gl.uniform2f(uniforms.iMouse, state.currentX, state.currentY)
        gl.uniform1f(uniforms.bendInfluence, state.currentInfluence)
        gl.uniform2f(uniforms.parallaxOffset, state.currentParallaxX, state.currentParallaxY)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        return
      }

      gl.uniform1f(uniforms.iTime, (time - startedAt) * 0.001)
      gl.uniform2f(uniforms.iMouse, state.currentX, state.currentY)
      gl.uniform1f(uniforms.bendInfluence, state.currentInfluence)
      gl.uniform2f(uniforms.parallaxOffset, state.currentParallaxX, state.currentParallaxY)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('pointerleave', clearPointer)
      window.removeEventListener('blur', clearPointer)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [
    animationSpeed,
    bendRadius,
    bendStrength,
    bottomWavePosition,
    enabledWaves,
    gradient,
    interactive,
    lineCount,
    lineDistance,
    middleWavePosition,
    mouseDamping,
    parallax,
    parallaxStrength,
    topWavePosition,
    prefersReducedMotion,
  ])

  return <div ref={containerRef} className={`floating-lines-container ${className}`.trim()} style={style} />
}
