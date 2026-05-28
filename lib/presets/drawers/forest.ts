import { withSavedState, drawRadialBlob } from '../utils'

export function drawForest(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base: deep forest green
  ctx.fillStyle = '#1a4d3a'
  ctx.fillRect(0, 0, w, h)

  // 8 canopy patches with varied tones
  const patches = [
    { x: 0.08, y: 0.12, r: 0.28, color: '#a8d5ba' },
    { x: 0.55, y: 0.18, r: 0.22, color: '#06a77d' },
    { x: 0.28, y: 0.55, r: 0.32, color: '#264653' },
    { x: 0.78, y: 0.65, r: 0.24, color: '#a8d5ba' },
    { x: 0.48, y: 0.88, r: 0.18, color: '#06a77d' },
    { x: 0.9,  y: 0.25, r: 0.2,  color: '#2d9e5f' },
    { x: 0.18, y: 0.78, r: 0.2,  color: '#7cb342' },
    { x: 0.65, y: 0.42, r: 0.26, color: '#264653' },
  ]
  for (const p of patches) {
    drawRadialBlob(ctx, p.x * w, p.y * h, p.r * Math.max(w, h), p.color, 0.65, w, h)
  }

  // Dappled light spots
  const lights = [
    [0.3, 0.25], [0.6, 0.55], [0.15, 0.6],
  ]
  for (const [lx, ly] of lights) {
    drawRadialBlob(ctx, lx * w, ly * h, w * 0.12, '#fff3b0', 0.18, w, h)
  }

  // Dark vignette edges — deep shade
  withSavedState(ctx, () => {
    const edge = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.25, w * 0.5, h * 0.5, Math.max(w, h) * 0.75)
    edge.addColorStop(0, 'transparent')
    edge.addColorStop(1, '#0b2618')
    ctx.globalAlpha = 0.45
    ctx.fillStyle = edge
    ctx.fillRect(0, 0, w, h)
  })
}
