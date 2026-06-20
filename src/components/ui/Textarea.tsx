import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, rows = 4, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          'block w-full resize-y rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors',
          'placeholder:text-gray-500',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
