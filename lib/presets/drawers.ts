import type { PresetId } from '@/types/scratch-canvas'
import { drawRainbow } from './drawers/rainbow'
import { drawNight } from './drawers/night'
import { drawSunset } from './drawers/sunset'
import { drawDawn } from './drawers/dawn'
import { drawForest } from './drawers/forest'
import { drawPastel } from './drawers/pastel'

type Drawer = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

export const DRAWERS: Record<PresetId, Drawer> = {
  rainbow: drawRainbow,
  night: drawNight,
  sunset: drawSunset,
  dawn: drawDawn,
  forest: drawForest,
  pastel: drawPastel,
}

export function drawPreset(
  ctx: CanvasRenderingContext2D,
  presetId: PresetId,
  width: number,
  height: number
): void {
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  DRAWERS[presetId](ctx, width, height)
}
