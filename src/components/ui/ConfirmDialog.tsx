import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false))

/** Promise-based confirmation. Wrap the app once, then `await confirm({...})`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions
    resolve: (ok: boolean) => void
  } | null>(null)

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => setState({ options, resolve })),
    []
  )

  const close = (ok: boolean) => {
    state?.resolve(ok)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        isOpen={!!state}
        onClose={() => close(false)}
        title={state?.options.title ?? 'Confirmer'}
        size="sm"
      >
        <p className="text-sm text-gray-600">{state?.options.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => close(false)}>
            {state?.options.cancelLabel ?? 'Annuler'}
          </Button>
          <Button
            variant={state?.options.danger ? 'danger' : 'primary'}
            onClick={() => close(true)}
          >
            {state?.options.confirmLabel ?? 'Confirmer'}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  return useContext(ConfirmContext)
}
