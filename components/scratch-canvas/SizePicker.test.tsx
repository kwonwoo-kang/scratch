import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SizePicker from './SizePicker'

const SIZES = [
  { label: '소형 정사각', width: 600, height: 600 },
  { label: '중형 정사각', width: 800, height: 800 },
  { label: '대형 정사각', width: 1200, height: 1200 },
  { label: '가로형', width: 1200, height: 800 },
  { label: '세로형', width: 800, height: 1200 },
  { label: '와이드', width: 1600, height: 900 },
]

describe('SizePicker', () => {
  it('renders all 6 size options', () => {
    render(<SizePicker onSelect={vi.fn()} />)
    for (const s of SIZES) {
      expect(screen.getByText(s.label)).toBeInTheDocument()
    }
  })

  it('calls onSelect with the chosen size when a card is clicked', () => {
    const onSelect = vi.fn()
    render(<SizePicker onSelect={onSelect} />)
    fireEvent.click(screen.getByText('중형 정사각').closest('[data-size-card]')!)
    expect(onSelect).toHaveBeenCalledWith({ label: '중형 정사각', width: 800, height: 800 })
  })

  it('highlights the clicked card', () => {
    render(<SizePicker onSelect={vi.fn()} />)
    const card = screen.getByText('가로형').closest('[data-size-card]')!
    fireEvent.click(card)
    expect(card).toHaveAttribute('data-selected', 'true')
  })
})
