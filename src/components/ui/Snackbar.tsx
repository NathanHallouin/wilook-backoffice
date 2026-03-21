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

const colors: Record<SnackbarMessage['type'], string> = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
}

const iconColors: Record<SnackbarMessage['type'], string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
}

export function SnackbarContainer() {
  const messages = useSnackbarStore((state) => state.messages)
  const removeMessage = useSnackbarStore((state) => state.removeMessage)

  if (messages.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((message) => {
        const Icon = icons[message.type]
        return (
          <div
            key={message.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-fade-in',
              colors[message.type]
            )}
          >
            <Icon className={cn('h-5 w-5', iconColors[message.type])} />
            <p className="text-sm font-medium">{message.message}</p>
            <button
              onClick={() => removeMessage(message.id)}
              className="ml-2 hover:opacity-70"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
