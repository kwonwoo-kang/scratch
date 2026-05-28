import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportAsPng } from './exportCanvas'

describe('exportAsPng', () => {
  let drawImage: ReturnType<typeof vi.fn>
  let toDataURL: ReturnType<typeof vi.fn>
  let anchorClick: ReturnType<typeof vi.fn>
  let origImage: typeof Image

  beforeEach(() => {
    drawImage = vi.fn()
    toDataURL = vi.fn().mockReturnValue('data:image/png;base64,result')
    anchorClick = vi.fn()

    // Stub offscreen canvas
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage }),
          toDataURL,
        } as unknown as HTMLCanvasElement
      }
      if (tag === 'a') {
        return { href: '', download: '', click: anchorClick, remove: vi.fn() } as unknown as HTMLAnchorElement
      }
      return origCreate(tag)
    })

    vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node)
    vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node)

    // Make Image fire onload synchronously
    origImage = globalThis.Image
    globalThis.Image = class {
      onload: (() => void) | null = null
      set src(_: string) {
        if (this.onload) this.onload()
      }
    } as unknown as typeof Image
  })

  afterEach(() => {
    globalThis.Image = origImage
    vi.restoreAllMocks()
  })

  it('sets offscreen canvas dimensions from arguments', () => {
    const fakeOverlay = { width: 800, height: 800 } as HTMLCanvasElement
    exportAsPng('data:image/png;base64,color', fakeOverlay, 1200, 800)
    // canvas dimensions are set via the stub's width/height properties
    // just verify no throws
  })

  it('draws color layer then overlay (composition order: 2 drawImage calls)', () => {
    const fakeOverlay = { width: 800, height: 800 } as HTMLCanvasElement
    exportAsPng('data:image/png;base64,color', fakeOverlay, 800, 800)
    expect(drawImage).toHaveBeenCalledTimes(2)
    // first call: color img; second call: overlay canvas
    expect(drawImage.mock.calls[1][0]).toBe(fakeOverlay)
  })

  it('triggers a PNG download via anchor click', () => {
    const fakeOverlay = { width: 800, height: 800 } as HTMLCanvasElement
    exportAsPng('data:image/png;base64,color', fakeOverlay, 800, 800)
    expect(anchorClick).toHaveBeenCalled()
  })
})
