import { withSavedState, drawRadialBlob } from '../utils'

export function drawRainbow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base: 12-stop rainbow
  const base = ctx.createLinearGradient(0, 0, w, 0)
  base.addColorStop(0, '#e63946')
  base.addColorStop(0.09, '#f4521e')
  base.addColorStop(0.17, '#f4a261')
  base.addColorStop(0.25, '#f9c74f')
  base.addColorStop(0.33, '#ffd166')
  base.addColorStop(0.42, '#c9f26a')
  base.addColorStop(0.5, '#a8d5ba')
  base.addColorStop(0.58, '#06d6a0')
  base.addColorStop(0.67, '#3a86ff')
  base.addColorStop(0.75, '#5e60ce')
  base.addColorStop(0.83, '#7b2d8b')
  base.addColorStop(1, '#e63946')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // Highlight: top-to-bottom white fade
  withSavedState(ctx, () => {
    const hl = ctx.createLinearGradient(0, 0, 0, h * 0.6)
    hl.addColorStop(0, '#ffffff')
    hl.addColorStop(1, 'transparent')
    ctx.globalAlpha = 0.25
    ctx.fillStyle = hl
    ctx.fillRect(0, 0, w, h)
  })

  // Accent blobs
  drawRadialBlob(ctx, w * 0.15, h * 0.4, w * 0.2, '#ffffff', 0.18, w, h)
  drawRadialBlob(ctx, w * 0.45, h * 0.7, w * 0.18, '#ffd166', 0.3, w, h)
  drawRadialBlob(ctx, w * 0.72, h * 0.3, w * 0.22, '#7b2d8b', 0.25, w, h)
  drawRadialBlob(ctx, w * 0.88, h * 0.65, w * 0.16, '#3a86ff', 0.3, w, h)
}
