import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useSnackbarStore } from '@/stores'
import { cn } from '@/utils/cn'
import type { SnackbarMessage } from '@/types'

const icons: Record<SnackbarMessage['type'], typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationCircleIcon,
}

const iconColors: Record<SnackbarMessage['type'], string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
}

export function SnackbarContainer() {
  const messages = useSnackbarStore((state) => state.messages)
  const removeMessage = useSnackbarStore((state) => state.removeMessage)

  if (messages.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {messages.map((message) => {
        const Icon = icons[message.type]
        return (
          <div
            key={message.id}
            className="shadow-pop animate-rise-in flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', iconColors[message.type])} />
            <p className="flex-1 text-sm font-medium text-gray-800">
              {message.message}
            </p>
            <button
              onClick={() => removeMessage(message.id)}
              className="-mr-1 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
