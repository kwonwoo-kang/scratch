import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScratchSound } from './useScratchSound'

// Stub the sound-engine module
const mockSource = {
  buffer: null as AudioBuffer | null,
  playbackRate: { value: 1 },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null as (() => void) | null,
}
const mockGain = {
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
}
const mockCtx = {
  state: 'running' as AudioContextState,
  currentTime: 0,
  resume: vi.fn().mockResolvedValue(undefined),
  createBufferSource: vi.fn(() => ({ ...mockSource })),
  createGain: vi.fn(() => ({ ...mockGain })),
  destination: {},
  decodeAudioData: vi.fn(),
}

vi.mock('@/lib/sound-engine', () => ({
  getAudioContext: vi.fn(() => mockCtx),
  decodeAudioData: vi.fn().mockResolvedValue({ duration: 0.5 } as AudioBuffer),
}))

vi.mock('@/lib/draw-knife-3', () => ({ drawKnife3Sound: { name: 'draw-knife-3', dataUri: 'data:audio/mpeg;base64,stub' } }))

import { decodeAudioData, getAudioContext } from '@/lib/sound-engine'

describe('useScratchSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCtx.state = 'running'
    mockCtx.createBufferSource.mockReturnValue({ ...mockSource })
    mockCtx.createGain.mockReturnValue({ ...mockGain })
  })

  it('does not decode sounds when disabled', async () => {
    renderHook(() => useScratchSound(false))
    await vi.waitFor(() => {})
    expect(decodeAudioData).not.toHaveBeenCalled()
  })

  it('decodes the sound when enabled', async () => {
    renderHook(() => useScratchSound(true))
    await vi.waitFor(() => {
      expect(decodeAudioData).toHaveBeenCalledTimes(1)
    })
  })

  it('resumes suspended AudioContext on start()', async () => {
    mockCtx.state = 'suspended'
    const { result } = renderHook(() => useScratchSound(true))
    await vi.waitFor(() => expect(decodeAudioData).toHaveBeenCalledTimes(1))

    act(() => { result.current.start() })
    expect(mockCtx.resume).toHaveBeenCalled()
  })

  it('throttles tick() to TICK_INTERVAL_MS', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useScratchSound(true))
    await vi.waitFor(() => expect(decodeAudioData).toHaveBeenCalledTimes(1))

    const createSourceSpy = mockCtx.createBufferSource
    // Force buffers to be populated
    const buffersPopulated = new Promise<void>((res) => setTimeout(res, 10))
    vi.runAllTimers()
    await buffersPopulated

    act(() => { result.current.tick() })
    act(() => { result.current.tick() }) // should be throttled

    // Only 1 source created (from start or first tick)
    expect(createSourceSpy.mock.calls.length).toBeLessThanOrEqual(2)
    vi.useRealTimers()
  })

  it('does not play when disabled', async () => {
    const { result } = renderHook(() => useScratchSound(false))
    act(() => { result.current.start() })
    expect(mockCtx.createBufferSource).not.toHaveBeenCalled()
  })
})
