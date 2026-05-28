import { withSavedState, drawRadialBlob } from '../utils'

export function drawPastel(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base: soft white
  ctx.fillStyle = '#fff9f7'
  ctx.fillRect(0, 0, w, h)

  // 4 large radial blobs at quadrant centers — blended pastel wash
  drawRadialBlob(ctx, w * 0.28, h * 0.28, w * 0.45, '#f9c8d4', 0.75, w, h)
  drawRadialBlob(ctx, w * 0.72, h * 0.28, w * 0.45, '#b5ead7', 0.75, w, h)
  drawRadialBlob(ctx, w * 0.28, h * 0.72, w * 0.45, '#fff3b0', 0.75, w, h)
  drawRadialBlob(ctx, w * 0.72, h * 0.72, w * 0.45, '#c7e9f0', 0.75, w, h)

  // Center white highlight — softens the blend
  drawRadialBlob(ctx, w * 0.5, h * 0.5, w * 0.3, '#ffffff', 0.35, w, h)

  // Confetti dots — small accent circles
  const dots = [
    { x: 0.1, y: 0.15, r: 3, color: '#f4a261' },
    { x: 0.85, y: 0.12, r: 2.5, color: '#7b2d8b' },
    { x: 0.6, y: 0.08, r: 3, color: '#3a86ff' },
    { x: 0.22, y: 0.88, r: 2, color: '#e63946' },
    { x: 0.78, y: 0.82, r: 3.5, color: '#06a77d' },
    { x: 0.45, y: 0.92, r: 2.5, color: '#ffd166' },
    { x: 0.9, y: 0.55, r: 2, color: '#f9c8d4' },
    { x: 0.05, y: 0.5, r: 3, color: '#90e0ef' },
  ]
  withSavedState(ctx, () => {
    for (const d of dots) {
      ctx.globalAlpha = 0.7
      ctx.fillStyle = d.color
      ctx.beginPath()
      ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}
