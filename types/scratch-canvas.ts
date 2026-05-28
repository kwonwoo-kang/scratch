export type CanvasSize = { width: number; height: number; label: string }

export type AppStep = 'start' | 'size-pick' | 'layer-pick' | 'scratch'

export type LayerMode = 'preset' | 'paint'

export type PresetId = 'rainbow' | 'night' | 'sunset' | 'dawn' | 'forest' | 'pastel'

export type ScratchBrushSize = 2 | 4 | 6 | 8

export type ColorLayerDataURL = string
