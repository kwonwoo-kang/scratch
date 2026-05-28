export function exportAsPng(
  colorDataURL: string,
  overlayCanvas: HTMLCanvasElement,
  width: number,
  height: number,
  filename = 'scratch-art.png'
): void {
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')
  if (!ctx) return

  // Draw color layer first, then overlay — order is acceptance criterion
  const colorImg = new Image()
  colorImg.onload = () => {
    ctx.drawImage(colorImg, 0, 0, width, height)
    ctx.drawImage(overlayCanvas, 0, 0, width, height)

    const dataURL = offscreen.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataURL
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  colorImg.src = colorDataURL
}
