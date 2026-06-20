import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal — accessibility', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="T">
        <p>x</p>
      </Modal>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('exposes dialog semantics labelled by its title', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Confirmer">
        <p>Body</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Confirmer')
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="T">
        <p>x</p>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has a labelled close button', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="T">
        <p>x</p>
      </Modal>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('traps focus: Tab from the last focusable wraps back to the first', () => {
    render(
      <Modal isOpen onClose={() => {}} title="T">
        <button>First</button>
        <button>Last</button>
      </Modal>
    )
    const closeBtn = screen.getByRole('button', { name: 'Fermer' })
    const last = screen.getByRole('button', { name: 'Last' })
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(closeBtn)
  })
})
