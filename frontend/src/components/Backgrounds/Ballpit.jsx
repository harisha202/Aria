import { useEffect, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  InstancedMesh,
  MathUtils,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import './Ballpit.css'

const tempObject = new Object3D()
const tempColor = new Color()

const palette = ['#ff007a', '#4d3dff', '#06b6d4', '#ffffff']

function randomBetween(min, max) {
  return MathUtils.randFloat(min, max)
}

function createBall(index, bounds, minSize, maxSize) {
  const radius = index === 0 ? maxSize * 1.15 : randomBetween(minSize, maxSize)

  return {
    position: new Vector3(
      randomBetween(-bounds.x, bounds.x),
      randomBetween(-bounds.y, bounds.y),
      randomBetween(-bounds.z, bounds.z),
    ),
    velocity: new Vector3(
      randomBetween(-0.035, 0.035),
      randomBetween(-0.015, 0.035),
      randomBetween(-0.025, 0.025),
    ),
    radius,
  }
}

function Ballpit({
  className = '',
  count = 150,
  gravity = 0.01,
  friction = 0.9975,
  wallBounce = 1,
  followCursor = false,
  minSize = 0.24,
  maxSize = 0.58,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return undefined

    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3))

    const scene = new Scene()
    const camera = new PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 18)
    camera.lookAt(0, 0, 0)

    const bounds = new Vector3(8, 4.5, 2.2)
    const geometry = new SphereGeometry(1, 32, 24)
    const material = new MeshPhysicalMaterial({
      metalness: 0.25,
      roughness: 0.38,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transmission: 0.05,
    })
    const mesh = new InstancedMesh(geometry, material, count)
    mesh.instanceMatrix.setUsage(35048)
    scene.add(mesh)

    const ambient = new AmbientLight(0xffffff, 1.4)
    scene.add(ambient)

    const cyanLight = new PointLight(0x06b6d4, 2.5, 40)
    cyanLight.position.set(-4, 3, 8)
    scene.add(cyanLight)

    const pinkLight = new PointLight(0xff007a, 2.0, 35)
    pinkLight.position.set(5, -2, 6)
    scene.add(pinkLight)

    const balls = Array.from({ length: count }, (_, index) => createBall(index, bounds, minSize, maxSize))
    balls.forEach((_, index) => {
      tempColor.set(palette[index % palette.length])
      mesh.setColorAt(index, tempColor)
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    const resize = () => {
      const width = parent.clientWidth || 1
      const height = parent.clientHeight || 1
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3))
      renderer.setSize(width, height, true)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      bounds.x = Math.max(4, (width / height) * 4.8)
      bounds.y = 4.8
    }

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null
    resizeObserver?.observe(parent)
    if (!resizeObserver) window.addEventListener('resize', resize)
    resize()

    const pointer = new Vector3()
    const handlePointerMove = (event) => {
      if (!followCursor) return

      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1
      const y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1)
      pointer.set(x * bounds.x, y * bounds.y, 0)
      balls[0].position.lerp(pointer, 0.25)
    }
    canvas.addEventListener('pointermove', handlePointerMove, { passive: true })

    let frameId = 0
    let lastTime = performance.now()

    const update = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 2)
      lastTime = now

      for (let i = followCursor ? 1 : 0; i < balls.length; i += 1) {
        const ball = balls[i]
        ball.velocity.y -= gravity * dt
        ball.velocity.multiplyScalar(friction)
        ball.position.addScaledVector(ball.velocity, dt)

        if (Math.abs(ball.position.x) + ball.radius > bounds.x) {
          ball.position.x = Math.sign(ball.position.x) * (bounds.x - ball.radius)
          ball.velocity.x *= -wallBounce
        }

        if (ball.position.y - ball.radius < -bounds.y) {
          ball.position.y = -bounds.y + ball.radius
          ball.velocity.y *= -wallBounce
        } else if (ball.position.y + ball.radius > bounds.y) {
          ball.position.y = bounds.y - ball.radius
          ball.velocity.y *= -wallBounce
        }

        if (Math.abs(ball.position.z) + ball.radius > bounds.z) {
          ball.position.z = Math.sign(ball.position.z) * (bounds.z - ball.radius)
          ball.velocity.z *= -wallBounce
        }
      }

      for (let i = 0; i < balls.length; i += 1) {
        const a = balls[i]
        for (let j = i + 1; j < balls.length; j += 1) {
          const b = balls[j]
          const delta = b.position.clone().sub(a.position)
          const distance = Math.max(delta.length(), 0.001)
          const minDistance = a.radius + b.radius

          if (distance < minDistance) {
            const normal = delta.divideScalar(distance)
            const overlap = (minDistance - distance) * 0.5
            a.position.addScaledVector(normal, -overlap)
            b.position.addScaledVector(normal, overlap)
            a.velocity.addScaledVector(normal, -0.012)
            b.velocity.addScaledVector(normal, 0.012)
          }
        }
      }

      balls.forEach((ball, index) => {
        tempObject.position.copy(ball.position)
        tempObject.scale.setScalar(ball.radius)
        tempObject.updateMatrix()
        mesh.setMatrixAt(index, tempObject.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true

      mesh.rotation.y += 0.0009 * dt
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(update)
    }

    frameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frameId)
      canvas.removeEventListener('pointermove', handlePointerMove)
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener('resize', resize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [count, followCursor, friction, gravity, maxSize, minSize, wallBounce])

  return <canvas className={`ballpit-canvas ${className}`.trim()} ref={canvasRef} />
}

export default Ballpit
