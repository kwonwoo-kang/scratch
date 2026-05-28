import { withSavedState, drawRadialBlob } from '../utils'

export function drawDawn(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base: vertical 6-stop pre-dawn to golden hour
  const base = ctx.createLinearGradient(0, 0, 0, h)
  base.addColorStop(0, '#1a1f3a')
  base.addColorStop(0.18, '#264653')
  base.addColorStop(0.42, '#90e0ef')
  base.addColorStop(0.65, '#ffba9e')
  base.addColorStop(0.82, '#ffd166')
  base.addColorStop(1, '#fff3b0')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // Horizon glow — rising sun core
  drawRadialBlob(ctx, w * 0.5, h * 0.72, w * 0.35, '#ffd166', 0.4, w, h)

  // Right vignette — deep side
  withSavedState(ctx, () => {
    const vign = ctx.createRadialGradient(w, h * 0.3, 0, w, h * 0.3, w * 0.7)
    vign.addColorStop(0, '#264653')
    vign.addColorStop(1, 'transparent')
    ctx.globalAlpha = 0.3
    ctx.fillStyle = vign
    ctx.fillRect(0, 0, w, h)
  })

  // Mist layers
  withSavedState(ctx, () => {
    const mist1 = ctx.createLinearGradient(0, h * 0.55, w, h * 0.55)
    mist1.addColorStop(0, 'transparent')
    mist1.addColorStop(0.4, '#ffffff')
    mist1.addColorStop(0.6, '#ffffff')
    mist1.addColorStop(1, 'transparent')
    ctx.globalAlpha = 0.12
    ctx.fillStyle = mist1
    ctx.fillRect(0, h * 0.48, w, h * 0.12)
  })
  withSavedState(ctx, () => {
    const mist2 = ctx.createLinearGradient(0, h * 0.68, w, h * 0.68)
    mist2.addColorStop(0, '#ffffff')
    mist2.addColorStop(0.5, 'transparent')
    mist2.addColorStop(1, '#ffffff')
    ctx.globalAlpha = 0.1
    ctx.fillStyle = mist2
    ctx.fillRect(0, h * 0.62, w, h * 0.1)
  })
}
