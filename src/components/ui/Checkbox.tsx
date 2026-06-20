import { cn } from '@/utils/cn'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={cn(
          'h-4 w-4 cursor-pointer rounded border-gray-300 text-brand-600',
          'focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-0',
          'disabled:cursor-not-allowed'
        )}
      />
      {label && <span className="ml-2 select-none text-sm text-gray-700">{label}</span>}
    </label>
  )
}
