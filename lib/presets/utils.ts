export function withSavedState(ctx: CanvasRenderingContext2D, fn: () => void): void {
  ctx.save()
  try {
    fn()
  } finally {
    ctx.restore()
  }
}

export function drawRadialBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  alpha: number,
  w: number,
  h: number
): void {
  withSavedState(ctx, () => {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'transparent')
    ctx.globalAlpha = alpha
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  })
}
