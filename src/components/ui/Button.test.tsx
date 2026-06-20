import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Enregistrer</Button>)
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument()
  })

  it('applies the variant classes', () => {
    render(<Button variant="danger">Supprimer</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })

  it('is disabled and non-clickable while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Charger
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('fires onClick when enabled', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Ok</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
