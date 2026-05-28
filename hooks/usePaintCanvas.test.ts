import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { usePaintCanvas } from './usePaintCanvas'

describe('usePaintCanvas', () => {
  it('initializes with default color #E63946', () => {
    const { result } = renderHook(() => usePaintCanvas())
    expect(result.current.selectedColor).toBe('#E63946')
  })

  it('initializes with default brush size 10', () => {
    const { result } = renderHook(() => usePaintCanvas())
    expect(result.current.brushSize).toBe(10)
  })

  it('updates selectedColor', () => {
    const { result } = renderHook(() => usePaintCanvas())
    act(() => result.current.setSelectedColor('#3A86FF'))
    expect(result.current.selectedColor).toBe('#3A86FF')
  })

  it('updates brushSize', () => {
    const { result } = renderHook(() => usePaintCanvas())
    act(() => result.current.setBrushSize(20))
    expect(result.current.brushSize).toBe(20)
  })

  it('exposes canvasRef', () => {
    const { result } = renderHook(() => usePaintCanvas())
    expect(result.current.canvasRef).toBeDefined()
  })
})
