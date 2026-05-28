import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PRESETS, drawPreset } from './presets'
import type { PresetId } from '@/types/scratch-canvas'

const PRESET_IDS: PresetId[] = ['rainbow', 'night', 'sunset', 'dawn', 'forest', 'pastel']

function makeCtx() {
  const fillRect = vi.fn()
  const arc = vi.fn()
  const fill = vi.fn()
  const beginPath = vi.fn()
  const createLinearGradient = vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  })
  const createRadialGradient = vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  })
  return {
    fillRect,
    arc,
    fill,
    beginPath,
    createLinearGradient,
    createRadialGradient,
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D
}

describe('PRESETS', () => {
  it('defines all 6 preset IDs', () => {
    const ids = PRESETS.map((p) => p.id)
    for (const id of PRESET_IDS) {
      expect(ids).toContain(id)
    }
  })
})

describe('drawPreset', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = makeCtx()
  })

  for (const id of PRESET_IDS) {
    it(`runs without error for preset "${id}"`, () => {
      expect(() => drawPreset(ctx, id, 800, 800)).not.toThrow()
    })
  }

  it('calls fillRect at least once for each preset', () => {
    for (const id of PRESET_IDS) {
      const c = makeCtx()
      drawPreset(c, id, 800, 800)
      expect((c.fillRect as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0)
    }
  })
})
