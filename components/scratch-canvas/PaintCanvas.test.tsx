import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import PaintCanvas from './PaintCanvas'

beforeAll(() => {
  const fakeCtx = {
    fillRect: vi.fn(),
    fillStyle: '',
    arc: vi.fn(),
    beginPath: vi.fn(),
    fill: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  }
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(fakeCtx)
  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,stub')
})

const defaultProps = {
  selectedSize: { label: '중형 정사각', width: 800, height: 800 },
  onScratchStart: vi.fn(),
  onSwitchMode: vi.fn(),
}

describe('PaintCanvas', () => {
  it('renders two tabs: 프리셋 선택 and 직접 칠하기', () => {
    render(<PaintCanvas {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /프리셋 선택/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /직접 칠하기/i })).toBeInTheDocument()
  })

  it('renders 16 color swatches', () => {
    render(<PaintCanvas {...defaultProps} />)
    const swatches = screen.getAllByRole('button', { name: /색상/i })
    expect(swatches.length).toBe(16)
  })

  it('renders brush size slider with min=30 max=60', () => {
    render(<PaintCanvas {...defaultProps} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '30')
    expect(slider).toHaveAttribute('max', '60')
  })

  it('renders 스크래치 시작 button (always enabled)', () => {
    render(<PaintCanvas {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /스크래치 시작/i })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toBeDisabled()
  })

  it('has no Undo button (invariant rule)', () => {
    render(<PaintCanvas {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /되돌리기|undo/i })).not.toBeInTheDocument()
  })

  it('calls onSwitchMode("preset") when 프리셋 선택 tab is clicked', () => {
    const onSwitchMode = vi.fn()
    render(<PaintCanvas {...defaultProps} onSwitchMode={onSwitchMode} />)
    fireEvent.click(screen.getByRole('tab', { name: /프리셋 선택/i }))
    expect(onSwitchMode).toHaveBeenCalledWith('preset')
  })

  it('calls onScratchStart when 스크래치 시작 is clicked', () => {
    const onScratchStart = vi.fn()
    render(<PaintCanvas {...defaultProps} onScratchStart={onScratchStart} />)
    fireEvent.click(screen.getByRole('button', { name: /스크래치 시작/i }))
    expect(onScratchStart).toHaveBeenCalledWith(expect.any(String))
  })
})
