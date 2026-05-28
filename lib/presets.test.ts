import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PRESETS, drawPreset } from './presets'
import { DRAWERS } from './presets/drawers'
import type { PresetId } from '@/types/scratch-canvas'

const PRESET_IDS: PresetId[] = ['rainbow', 'night', 'sunset', 'dawn', 'forest', 'pastel']

function makeCtx() {
  const fillRect = vi.fn()
  const arc = vi.fn()
  const fill = vi.fn()
  const beginPath = vi.fn()
  const save = vi.fn()
  const restore = vi.fn()
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
    save,
    restore,
    createLinearGradient,
    createRadialGradient,
    fillStyle: '',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
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

describe('DRAWERS', () => {
  it('has a drawer for every preset ID and no extras', () => {
    const drawerIds = Object.keys(DRAWERS).sort()
    const presetIds = PRESETS.map((p) => p.id).sort()
    expect(drawerIds).toEqual(presetIds)
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

  it('resets globalCompositeOperation to source-over before drawing', () => {
    const c = makeCtx()
    ;(c as unknown as { globalCompositeOperation: string }).globalCompositeOperation = 'destination-out'
    drawPreset(c, 'rainbow', 800, 800)
    // drawPreset must reset composite at entry — drawers don't modify it
    expect((c as unknown as { globalCompositeOperation: string }).globalCompositeOperation).toBe('source-over')
  })
})
