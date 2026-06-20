import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSnackbarStore } from './snackbar'

describe('snackbar store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useSnackbarStore.setState({ messages: [] })
  })

  it('adds a typed message', () => {
    useSnackbarStore.getState().success('Enregistré')
    const { messages } = useSnackbarStore.getState()
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ type: 'success', message: 'Enregistré' })
    expect(messages[0].id).toBeTruthy()
  })

  it('caps the queue at 4 messages (keeps the most recent)', () => {
    const { info } = useSnackbarStore.getState()
    for (let i = 1; i <= 6; i++) info(`msg ${i}`)
    const { messages } = useSnackbarStore.getState()
    expect(messages).toHaveLength(4)
    expect(messages.map((m) => m.message)).toEqual([
      'msg 3',
      'msg 4',
      'msg 5',
      'msg 6',
    ])
  })

  it('auto-dismisses after 5s', () => {
    useSnackbarStore.getState().error('Boom')
    expect(useSnackbarStore.getState().messages).toHaveLength(1)
    vi.advanceTimersByTime(5000)
    expect(useSnackbarStore.getState().messages).toHaveLength(0)
  })

  it('removes a message by id', () => {
    useSnackbarStore.getState().info('x')
    const id = useSnackbarStore.getState().messages[0].id
    useSnackbarStore.getState().removeMessage(id)
    expect(useSnackbarStore.getState().messages).toHaveLength(0)
  })
})
