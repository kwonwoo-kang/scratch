export function drawPastel(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const patches = [
    { color: '#f72585', x: 0, y: 0, pw: 0.5, ph: 0.5 },
    { color: '#a8d5ba', x: 0.5, y: 0, pw: 0.5, ph: 0.5 },
    { color: '#ffd166', x: 0, y: 0.5, pw: 0.5, ph: 0.5 },
    { color: '#90e0ef', x: 0.5, y: 0.5, pw: 0.5, ph: 0.5 },
  ]
  for (const p of patches) {
    ctx.fillStyle = p.color + 'bb'
    ctx.fillRect(p.x * w, p.y * h, p.pw * w, p.ph * h)
  }
}
