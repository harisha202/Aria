import { useEffect, useRef } from 'react'
import './Iridescence.css'

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

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
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

export default function Iridescence({
  color = [1, 1, 1],
  speed = 1.0,
  amplitude = 0.1,
  mouseReact = true,
  ...rest
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) return undefined

    const program = createProgram(gl)
    if (!program) return undefined

    container.appendChild(canvas)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    gl.useProgram(program)
    gl.clearColor(1, 1, 1, 1)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {
      uTime: gl.getUniformLocation(program, 'uTime'),
      uColor: gl.getUniformLocation(program, 'uColor'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uMouse: gl.getUniformLocation(program, 'uMouse'),
      uAmplitude: gl.getUniformLocation(program, 'uAmplitude'),
      uSpeed: gl.getUniformLocation(program, 'uSpeed'),
    }

    let animationFrameId
    const mousePos = { x: 0.5, y: 0.5 }

    const resize = () => {
      const width = Math.max(1, container.offsetWidth)
      const height = Math.max(1, container.offsetHeight)
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.uniform3f(uniforms.uResolution, width, height, width / height)
    }

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect()
      mousePos.x = (event.clientX - rect.left) / rect.width
      mousePos.y = 1 - (event.clientY - rect.top) / rect.height
      gl.uniform2f(uniforms.uMouse, mousePos.x, mousePos.y)
    }

    resize()
    gl.uniform3f(uniforms.uColor, color[0], color[1], color[2])
    gl.uniform2f(uniforms.uMouse, mousePos.x, mousePos.y)
    gl.uniform1f(uniforms.uAmplitude, amplitude)
    gl.uniform1f(uniforms.uSpeed, speed)

    window.addEventListener('resize', resize)
    if (mouseReact) container.addEventListener('mousemove', handleMouseMove)

    const update = (time) => {
      animationFrameId = requestAnimationFrame(update)
      gl.uniform1f(uniforms.uTime, time * 0.001)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', handleMouseMove)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [color, speed, amplitude, mouseReact])

  return <div ref={containerRef} className="iridescence-container" {...rest} />
}
