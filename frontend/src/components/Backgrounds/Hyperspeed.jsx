/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef } from 'react'
import './Hyperspeed.css'

const DEFAULT_EFFECT_OPTIONS = {
  length: 400,
  roadWidth: 10,
  lanesPerRoad: 4,
  speedUp: 2,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  colors: {
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
}

export const hyperspeedPresets = {
  one: DEFAULT_EFFECT_OPTIONS,
  two: {
    ...DEFAULT_EFFECT_OPTIONS,
    colors: {
      ...DEFAULT_EFFECT_OPTIONS.colors,
      leftCars: [0xff102a, 0xeb383e, 0xff102a],
      rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
      sticks: 0xdadafa,
    },
  },
}

const toHex = (value) => `#${value.toString(16).padStart(6, '0')}`

const pick = (items, index) => {
  if (!Array.isArray(items)) return items
  return items[index % items.length]
}

function Hyperspeed({ effectOptions = DEFAULT_EFFECT_OPTIONS }) {
  const canvasRef = useRef(null)
  const options = useMemo(
    () => ({
      ...DEFAULT_EFFECT_OPTIONS,
      ...effectOptions,
      colors: {
        ...DEFAULT_EFFECT_OPTIONS.colors,
        ...effectOptions.colors,
      },
    }),
    [effectOptions],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    let frameId = 0
    let time = 0
    let width = 1
    let height = 1

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width * pixelRatio))
      height = Math.max(1, Math.floor(rect.height * pixelRatio))
      canvas.width = width
      canvas.height = height
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const drawLightTrail = (x, y, length, color, alpha, lineWidth) => {
      const gradient = context.createLinearGradient(x, y + length, x, y)
      gradient.addColorStop(0, `${color}00`)
      gradient.addColorStop(0.35, `${color}${Math.round(alpha * 120).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(1, `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`)

      context.strokeStyle = gradient
      context.lineWidth = lineWidth
      context.lineCap = 'round'
      context.beginPath()
      context.moveTo(x, y + length)
      context.lineTo(x, y)
      context.stroke()
    }

    const render = () => {
      const cssWidth = canvas.clientWidth || 1
      const cssHeight = canvas.clientHeight || 1
      const centerX = cssWidth / 2
      const horizonY = cssHeight * 0.38
      const roadBottom = cssWidth * 0.72
      const roadTop = cssWidth * 0.08
      const speed = 1.4 + options.speedUp * 0.32

      context.clearRect(0, 0, cssWidth, cssHeight)
      context.fillStyle = toHex(options.colors.background)
      context.fillRect(0, 0, cssWidth, cssHeight)

      const skyGlow = context.createRadialGradient(centerX, horizonY, 0, centerX, horizonY, cssWidth * 0.72)
      skyGlow.addColorStop(0, 'rgba(3,179,195,0.18)')
      skyGlow.addColorStop(0.32, 'rgba(103,80,162,0.12)')
      skyGlow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = skyGlow
      context.fillRect(0, 0, cssWidth, cssHeight)

      context.fillStyle = 'rgba(8,8,8,0.92)'
      context.beginPath()
      context.moveTo(centerX - roadTop, horizonY)
      context.lineTo(centerX + roadTop, horizonY)
      context.lineTo(centerX + roadBottom, cssHeight)
      context.lineTo(centerX - roadBottom, cssHeight)
      context.closePath()
      context.fill()

      const lineColor = toHex(options.colors.brokenLines)
      const shoulderColor = toHex(options.colors.shoulderLines)
      const lanes = Math.max(2, options.lanesPerRoad)

      for (let lane = 1; lane < lanes; lane += 1) {
        const laneOffset = (lane / lanes - 0.5) * 2
        for (let i = 0; i < 28; i += 1) {
          const p = ((i * 0.075 + time * 0.012 * speed) % 1) ** 2.15
          const y = horizonY + p * (cssHeight - horizonY)
          const perspective = p
          const x = centerX + laneOffset * (roadTop + (roadBottom - roadTop) * perspective)
          const dash = 10 + perspective * 48

          context.strokeStyle = lineColor
          context.globalAlpha = 0.08 + perspective * 0.48
          context.lineWidth = 1 + perspective * 3
          context.beginPath()
          context.moveTo(x, y)
          context.lineTo(x, y + dash)
          context.stroke()
        }
      }

      context.globalAlpha = 0.52
      context.strokeStyle = shoulderColor
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(centerX - roadTop, horizonY)
      context.lineTo(centerX - roadBottom, cssHeight)
      context.moveTo(centerX + roadTop, horizonY)
      context.lineTo(centerX + roadBottom, cssHeight)
      context.stroke()
      context.globalAlpha = 1

      for (let i = 0; i < options.lightPairsPerRoadWay; i += 1) {
        const p = ((i / options.lightPairsPerRoadWay + time * 0.0045 * speed) % 1) ** 1.75
        const y = horizonY + p * (cssHeight - horizonY)
        const side = i % 2 === 0 ? -1 : 1
        const laneX = centerX + side * (roadTop * 0.3 + p * roadBottom * (0.18 + (i % lanes) * 0.06))
        const color = toHex(pick(side < 0 ? options.colors.leftCars : options.colors.rightCars, i))
        const alpha = 0.22 + p * 0.72
        const trailLength = 18 + p * 110

        drawLightTrail(laneX, y, trailLength, color, alpha, 1.5 + p * 5)
      }

      for (let i = 0; i < options.totalSideLightSticks; i += 1) {
        const p = ((i / options.totalSideLightSticks + time * 0.007 * speed) % 1) ** 1.45
        const y = horizonY + p * (cssHeight - horizonY)
        const side = i % 2 === 0 ? -1 : 1
        const x = centerX + side * (roadTop + p * roadBottom + 18)
        const stickHeight = 10 + p * 62
        const color = toHex(options.colors.sticks)

        context.strokeStyle = color
        context.globalAlpha = 0.16 + p * 0.7
        context.lineWidth = 1 + p * 2
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x, y - stickHeight)
        context.stroke()
      }

      context.globalAlpha = 1
      time += 1
      frameId = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [options])

  return (
    <div className="hyperspeed-container" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}

export default Hyperspeed
