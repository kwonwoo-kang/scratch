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

export { drawPreset } from './presets/drawers'
