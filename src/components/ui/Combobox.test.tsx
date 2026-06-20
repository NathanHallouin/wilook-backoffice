import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Combobox } from './Combobox'

const OPTIONS = ['Coton', 'Laine', 'Lin']

describe('Combobox — keyboard navigation', () => {
  it('opens on focus and shows a listbox', () => {
    render(<Combobox options={OPTIONS} selected={[]} onChange={() => {}} />)
    fireEvent.focus(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('selects the first option with Enter', () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} selected={[]} onChange={onChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['Coton'])
  })

  it('moves the highlight with ArrowDown before selecting', () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} selected={[]} onChange={onChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['Laine'])
  })

  it('closes the listbox on Escape', () => {
    render(<Combobox options={OPTIONS} selected={[]} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    expect(screen.queryByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('removes the last chip with Backspace on an empty query', () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} selected={['Coton', 'Laine']} onChange={onChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledWith(['Coton'])
  })

  it('creates a new value via Enter when allowCreate is set', () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} selected={[]} onChange={onChange} allowCreate />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Soie' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['Soie'])
  })
})
