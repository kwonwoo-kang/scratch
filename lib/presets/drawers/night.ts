import { withSavedState, drawRadialBlob } from '../utils'

export function drawNight(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base: deep night sky gradient
  const base = ctx.createLinearGradient(0, 0, w, 0)
  base.addColorStop(0, '#0b1d2e')
  base.addColorStop(0.2, '#264653')
  base.addColorStop(0.45, '#7b2d8b')
  base.addColorStop(0.65, '#e63946')
  base.addColorStop(0.82, '#f4a261')
  base.addColorStop(1, '#ffd166')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // Moon glow — upper center
  drawRadialBlob(ctx, w * 0.25, h * 0.2, w * 0.28, '#fff8d6', 0.45, w, h)

  // Horizon warm band
  withSavedState(ctx, () => {
    const band = ctx.createLinearGradient(0, h * 0.65, 0, h)
    band.addColorStop(0, 'transparent')
    band.addColorStop(1, '#f4a261')
    ctx.globalAlpha = 0.35
    ctx.fillStyle = band
    ctx.fillRect(0, 0, w, h)
  })

  // Stars: small white dots
  const stars = [
    [0.08, 0.1], [0.22, 0.05], [0.35, 0.18], [0.48, 0.08],
    [0.6, 0.14], [0.73, 0.06], [0.85, 0.12], [0.15, 0.3],
  ]
  withSavedState(ctx, () => {
    ctx.globalAlpha = 0.7
    ctx.fillStyle = '#ffffff'
    for (const [sx, sy] of stars) {
      ctx.beginPath()
      ctx.arc(sx * w, sy * h, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}
