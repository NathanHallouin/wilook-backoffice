import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectionBar } from './SelectionBar'

const baseProps = {
  total: 10,
  allSelected: false,
  onSelectAll: () => {},
  onClear: () => {},
  onDelete: () => {},
  noun: 'produit',
}

describe('SelectionBar', () => {
  it('renders nothing when nothing is selected', () => {
    const { container } = render(<SelectionBar {...baseProps} count={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('appears and triggers delete when items are selected', () => {
    const onDelete = vi.fn()
    render(<SelectionBar {...baseProps} count={3} onDelete={onDelete} />)
    expect(screen.getByText(/sélectionné/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Supprimer/ }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('offers "select all" only when not everything is selected', () => {
    const onSelectAll = vi.fn()
    const { rerender } = render(
      <SelectionBar {...baseProps} count={3} onSelectAll={onSelectAll} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Tout sélectionner/ }))
    expect(onSelectAll).toHaveBeenCalledOnce()

    rerender(<SelectionBar {...baseProps} count={10} allSelected onSelectAll={onSelectAll} />)
    expect(screen.queryByRole('button', { name: /Tout sélectionner/ })).toBeNull()
  })

  it('clears the selection via the close button', () => {
    const onClear = vi.fn()
    render(<SelectionBar {...baseProps} count={2} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: /Annuler la sélection/ }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
