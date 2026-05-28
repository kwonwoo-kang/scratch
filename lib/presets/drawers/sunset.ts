import { withSavedState, drawRadialBlob } from '../utils'

export function drawSunset(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base: sun radial
  const r = Math.max(w, h) * 0.65
  const base = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, r)
  base.addColorStop(0, '#ffe7a8')
  base.addColorStop(0.2, '#ffd166')
  base.addColorStop(0.45, '#f4a261')
  base.addColorStop(0.7, '#e63946')
  base.addColorStop(1, '#7b2d8b')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // Horizon warm band
  withSavedState(ctx, () => {
    const band = ctx.createLinearGradient(0, h * 0.5, 0, h)
    band.addColorStop(0, 'transparent')
    band.addColorStop(1, '#ff6b35')
    ctx.globalAlpha = 0.35
    ctx.fillStyle = band
    ctx.fillRect(0, 0, w, h)
  })

  // Sun ray from upper left
  withSavedState(ctx, () => {
    const ray = ctx.createLinearGradient(0, 0, w * 0.55, h * 0.55)
    ray.addColorStop(0, '#ffe7a8')
    ray.addColorStop(0.4, '#ffd166')
    ray.addColorStop(0.75, 'transparent')
    ray.addColorStop(1, 'transparent')
    ctx.globalAlpha = 0.2
    ctx.fillStyle = ray
    ctx.fillRect(0, 0, w, h)
  })

  // Warm bloom near center
  drawRadialBlob(ctx, w * 0.5, h * 0.5, w * 0.25, '#ffe7a8', 0.3, w, h)
}
