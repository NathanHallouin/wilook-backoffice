import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Questionnaire } from './Questionnaire'
import type { Customer } from '@/types'

const base: Customer = {
  email: 'c@example.com',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  first_name: 'A',
  last_name: 'B',
  budget: 500,
  style_preferences: null,
  sizes: null,
  questionnaire_data: null,
}

describe('Questionnaire', () => {
  it('renders array style preferences', () => {
    render(
      <Questionnaire
        customer={{ ...base, style_preferences: { styles: ['Casual'], colors: ['Bleu', 'Noir'] } }}
      />
    )
    expect(screen.getByText('Casual')).toBeInTheDocument()
    expect(screen.getByText('Bleu')).toBeInTheDocument()
  })

  it('does not crash when styles/colors are single strings (malformed data)', () => {
    // Regression: bulk-seeded profiles stored scalars instead of arrays.
    const bad = {
      ...base,
      style_preferences: { styles: 'Casual', colors: 'Bleu' } as unknown as Customer['style_preferences'],
    }
    expect(() => render(<Questionnaire customer={bad} />)).not.toThrow()
    expect(screen.getByText('Casual')).toBeInTheDocument()
    expect(screen.getByText('Bleu')).toBeInTheDocument()
  })

  it('shows "Non renseigné" when there are no preferences', () => {
    render(<Questionnaire customer={base} />)
    expect(screen.getAllByText('Non renseigné').length).toBeGreaterThan(0)
  })
})
