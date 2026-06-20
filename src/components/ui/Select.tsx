import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import type { SelectOption } from '@/types'

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  options: SelectOption[]
  error?: string
  onChange: (value: string) => void
}

export function Select({
  label,
  options,
  error,
  className,
  id,
  value,
  onChange,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'block w-full cursor-pointer rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
