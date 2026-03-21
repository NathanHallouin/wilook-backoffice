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
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm',
          'focus:border-indigo-500 focus:ring-indigo-500',
          'text-sm px-3 py-2 border bg-white',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
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
