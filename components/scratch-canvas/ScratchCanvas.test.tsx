import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ScratchCanvas from './ScratchCanvas'

const defaultProps = {
  width: 800,
  height: 800,
  colorDataURL: '',
  onReset: vi.fn(),
}

describe('ScratchCanvas', () => {
  it('renders 4 brush size buttons (2, 4, 6, 8)', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.getByRole('button', { name: /2px/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /4px/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /6px/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /8px/i })).toBeInTheDocument()
  })

  it('renders Save and Reset buttons', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /새로 시작/i })).toBeInTheDocument()
  })

  it('has no Undo button (invariant rule)', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /되돌리기|undo/i })).not.toBeInTheDocument()
  })

  it('has no back-to-coloring button (one-way flow invariant)', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /색칠|프리셋|직접 칠하기/i })).not.toBeInTheDocument()
  })

  it('shows dialog when 새로 시작 is clicked', () => {
    render(<ScratchCanvas {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /새로 시작/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes dialog on 취소 click', () => {
    render(<ScratchCanvas {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /새로 시작/i }))
    fireEvent.click(screen.getByRole('button', { name: /취소/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onReset when dialog 확인 is clicked', () => {
    const onReset = vi.fn()
    render(<ScratchCanvas {...defaultProps} onReset={onReset} />)
    fireEvent.click(screen.getByRole('button', { name: /새로 시작/i }))
    fireEvent.click(screen.getByRole('button', { name: /^확인$/i }))
    expect(onReset).toHaveBeenCalled()
  })
})
