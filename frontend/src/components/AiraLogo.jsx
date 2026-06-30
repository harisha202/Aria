import { useEffect, useRef } from 'react'

function AiraLogo({ className = '', width = 400, height = 380, style = {} }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    let frameId
    let t = 0

    const roundRect = (x, y, rectWidth, rectHeight, radius) => {
      if (typeof context.roundRect === 'function') {
        context.roundRect(x, y, rectWidth, rectHeight, radius)
        return
      }

      const r = Math.min(radius, rectWidth / 2, rectHeight / 2)
      context.moveTo(x + r, y)
      context.arcTo(x + rectWidth, y, x + rectWidth, y + rectHeight, r)
      context.arcTo(x + rectWidth, y + rectHeight, x, y + rectHeight, r)
      context.arcTo(x, y + rectHeight, x, y, r)
      context.arcTo(x, y, x + rectWidth, y, r)
    }

    const draw = () => {
      context.clearRect(0, 0, W, H)
      context.fillStyle = '#030d1a'
      context.fillRect(0, 0, W, H)

      const CX = 200
      const CY = 175

      context.save()
      context.translate(CX, CY)
      context.rotate(t * 0.004)
      for (let d = 0; d < 40; d += 1) {
        const angle = d * ((Math.PI * 2) / 40)
        const isDot = d % 4 === 0
        context.beginPath()
        context.arc(Math.cos(angle) * 105, Math.sin(angle) * 105, isDot ? 2 : 1, 0, Math.PI * 2)
        context.fillStyle = `rgba(33,150,243,${isDot ? 0.22 : 0.07})`
        context.fill()
      }
      context.restore()

      const silenceArcAlpha = 0.15 + 0.12 * Math.sin(t * 0.02)
      context.beginPath()
      context.arc(CX, CY, 88, Math.PI * 0.5, Math.PI * 1.5)
      context.strokeStyle = `rgba(10,60,120,${silenceArcAlpha})`
      context.lineWidth = 3
      context.stroke()

      const voiceArcAlpha = 0.4 + 0.3 * Math.sin(t * 0.05)
      context.beginPath()
      context.arc(CX, CY, 88, Math.PI * 1.5, Math.PI * 0.5)
      context.strokeStyle = `rgba(56,182,255,${voiceArcAlpha})`
      context.lineWidth = 3
      context.stroke()

      for (let p = 0; p < 8; p += 1) {
        const progress = (t * 0.008 + p / 8) % 1
        const particleAngle = Math.PI + progress * Math.PI
        const particleRadius = 96
        const particleX = CX + Math.cos(particleAngle) * particleRadius
        const particleY = CY + Math.sin(particleAngle) * particleRadius
        const particleAlpha = Math.sin(progress * Math.PI) * 0.9
        context.beginPath()
        context.arc(particleX, particleY, 1.8 + 2 * particleAlpha, 0, Math.PI * 2)
        context.fillStyle = `rgba(56,182,255,${particleAlpha})`
        context.fill()
      }

      const innerGradient = context.createRadialGradient(CX, CY - 10, 4, CX, CY, 58)
      innerGradient.addColorStop(0, '#0a2540')
      innerGradient.addColorStop(1, '#030d1a')
      context.beginPath()
      context.arc(CX, CY, 58, 0, Math.PI * 2)
      context.fillStyle = innerGradient
      context.fill()
      context.strokeStyle = 'rgba(33,150,243,0.4)'
      context.lineWidth = 1.5
      context.stroke()

      context.save()
      context.translate(CX, CY)
      for (let i = 0; i < 7; i += 1) {
        const phase = t * 0.025 + i * 0.7
        const barHeight = 4 + 5 * Math.abs(Math.sin(phase))
        const barX = -46 + i * 12
        const barAlpha = 0.15 + 0.12 * Math.abs(Math.sin(phase))
        context.beginPath()
        roundRect(barX, -barHeight / 2, 7, barHeight, 3)
        context.fillStyle = `rgba(20,80,160,${barAlpha})`
        context.fill()
      }
      context.restore()

      context.save()
      context.translate(CX, CY)
      for (let i = 0; i < 7; i += 1) {
        const phase = t * 0.08 + i * 0.6
        const barHeight = 10 + 26 * Math.abs(Math.sin(phase))
        const barX = 4 + i * 12
        const barAlpha = 0.4 + 0.55 * (barHeight / 36)
        context.beginPath()
        roundRect(barX, -barHeight / 2, 7, barHeight, 3)
        context.fillStyle = `rgba(56,182,255,${barAlpha})`
        context.fill()
      }
      context.restore()

      const dividerAlpha = 0.4 + 0.4 * Math.sin(t * 0.07)
      context.beginPath()
      context.moveTo(CX, CY - 18)
      context.lineTo(CX, CY + 18)
      context.strokeStyle = `rgba(56,182,255,${dividerAlpha})`
      context.lineWidth = 1.5
      context.stroke()

      const micX = CX
      const micY = CY
      context.beginPath()
      roundRect(micX - 8, micY - 19, 16, 26, 8)
      const micGradient = context.createLinearGradient(micX - 8, micY - 19, micX + 8, micY + 7)
      micGradient.addColorStop(0, '#1e88e5')
      micGradient.addColorStop(1, '#0d47a1')
      context.fillStyle = micGradient
      context.fill()
      context.beginPath()
      roundRect(micX - 5, micY - 17, 5, 13, 3)
      context.fillStyle = 'rgba(255,255,255,0.13)'
      context.fill()
      context.beginPath()
      context.arc(micX, micY + 5, 14, Math.PI * 1.12, Math.PI * 1.88)
      context.strokeStyle = '#38b6ff'
      context.lineWidth = 1.8
      context.stroke()
      context.beginPath()
      context.moveTo(micX, micY + 19)
      context.lineTo(micX, micY + 25)
      context.strokeStyle = '#38b6ff'
      context.lineWidth = 1.8
      context.lineCap = 'round'
      context.stroke()
      context.beginPath()
      context.moveTo(micX - 9, micY + 25)
      context.lineTo(micX + 9, micY + 25)
      context.strokeStyle = '#38b6ff'
      context.lineWidth = 1.8
      context.lineCap = 'round'
      context.stroke()

      for (let c = 0; c < 14; c += 1) {
        const constellationAngle = c * ((Math.PI * 2) / 14) + t * 0.003
        const constellationRadius = 148 + 18 * Math.sin(c * 1.7)
        const dotX = CX + Math.cos(constellationAngle) * constellationRadius
        const dotY = CY + Math.sin(constellationAngle) * constellationRadius
        const isRightSide = Math.cos(constellationAngle) > 0
        const dotAlpha = isRightSide
          ? 0.07 + 0.1 * Math.sin(t * 0.04 + c)
          : 0.03 + 0.03 * Math.sin(t * 0.018 + c)
        context.beginPath()
        context.arc(dotX, dotY, 1.4, 0, Math.PI * 2)
        context.fillStyle = `rgba(56,182,255,${dotAlpha})`
        context.fill()
      }

      t += 1
      frameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={width}
      height={height}
      style={style}
      aria-label="AIRA icon, silence on the left and voice on the right"
      role="img"
    />
  )
}

export default AiraLogo
