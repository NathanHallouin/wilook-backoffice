import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="Aucun produit" description="Ajoutez-en un" />)
    expect(screen.getByText('Aucun produit')).toBeInTheDocument()
    expect(screen.getByText('Ajoutez-en un')).toBeInTheDocument()
  })

  it('renders the action slot', () => {
    render(
      <EmptyState
        title="Vide"
        action={<button type="button">Ajouter</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument()
  })
})
