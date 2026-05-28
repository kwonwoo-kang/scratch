import type { PresetId } from '@/types/scratch-canvas'

export interface PresetDef {
  id: PresetId
  label: string
}

export const PRESETS: PresetDef[] = [
  { id: 'rainbow', label: '무지개' },
  { id: 'night', label: '야경' },
  { id: 'sunset', label: '황금빛 낙조' },
  { id: 'dawn', label: '새벽' },
  { id: 'forest', label: '숲' },
  { id: 'pastel', label: '파스텔' },
]

export function drawPreset(
  ctx: CanvasRenderingContext2D,
  presetId: PresetId,
  width: number,
  height: number
): void {
  switch (presetId) {
    case 'rainbow': {
      const grad = ctx.createLinearGradient(0, 0, width, 0)
      grad.addColorStop(0, '#e63946')
      grad.addColorStop(0.17, '#f4a261')
      grad.addColorStop(0.33, '#ffd166')
      grad.addColorStop(0.5, '#a8d5ba')
      grad.addColorStop(0.67, '#3a86ff')
      grad.addColorStop(0.83, '#7b2d8b')
      grad.addColorStop(1, '#e63946')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      break
    }
    case 'night': {
      const grad = ctx.createLinearGradient(0, 0, width, 0)
      grad.addColorStop(0, '#264653')
      grad.addColorStop(0.5, '#7b2d8b')
      grad.addColorStop(1, '#f4a261')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      break
    }
    case 'sunset': {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2)
      grad.addColorStop(0, '#ffd166')
      grad.addColorStop(0.5, '#f4a261')
      grad.addColorStop(1, '#e63946')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      break
    }
    case 'dawn': {
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, '#264653')
      grad.addColorStop(0.5, '#90e0ef')
      grad.addColorStop(1, '#ffba9e')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      break
    }
    case 'forest': {
      // Base deep green
      ctx.fillStyle = '#2d9e5f'
      ctx.fillRect(0, 0, width, height)
      // Irregular patches with lighter/darker greens
      const patches = [
        { x: 0.1, y: 0.1, r: 0.25, color: '#a8d5ba' },
        { x: 0.6, y: 0.2, r: 0.2, color: '#06a77d' },
        { x: 0.3, y: 0.6, r: 0.3, color: '#264653' },
        { x: 0.8, y: 0.7, r: 0.22, color: '#a8d5ba' },
        { x: 0.5, y: 0.9, r: 0.15, color: '#06a77d' },
      ]
      for (const p of patches) {
        const grad = ctx.createRadialGradient(
          p.x * width, p.y * height, 0,
          p.x * width, p.y * height, p.r * Math.max(width, height)
        )
        grad.addColorStop(0, p.color + 'cc')
        grad.addColorStop(1, p.color + '00')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      }
      break
    }
    case 'pastel': {
      // Pastel patchwork: pink, mint, light yellow blocks
      const patches = [
        { color: '#f72585', x: 0, y: 0, w: 0.5, h: 0.5 },
        { color: '#a8d5ba', x: 0.5, y: 0, w: 0.5, h: 0.5 },
        { color: '#ffd166', x: 0, y: 0.5, w: 0.5, h: 0.5 },
        { color: '#90e0ef', x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
      ]
      for (const p of patches) {
        ctx.fillStyle = p.color + 'bb'
        ctx.fillRect(p.x * width, p.y * height, p.w * width, p.h * height)
      }
      break
    }
  }
}
