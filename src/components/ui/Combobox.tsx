import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

interface ComboboxProps {
  label?: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  allowCreate?: boolean
  multiple?: boolean
}

export function Combobox({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Sélectionner...',
  allowCreate = false,
  multiple = true,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      (multiple || !selected.includes(opt))
  )

  const handleSelect = (option: string) => {
    if (multiple) {
      if (selected.includes(option)) {
        onChange(selected.filter((s) => s !== option))
      } else {
        onChange([...selected, option])
      }
    } else {
      onChange([option])
      setIsOpen(false)
    }
    setSearch('')
  }

  const handleCreate = () => {
    if (search && !options.includes(search) && !selected.includes(search)) {
      onChange([...selected, search])
      setSearch('')
    }
  }

  const handleRemove = (option: string) => {
    onChange(selected.filter((s) => s !== option))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={cn(
            'flex min-h-[38px] w-full cursor-text flex-wrap items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 shadow-sm transition-colors',
            'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30'
          )}
          onClick={() => setIsOpen(true)}
        >
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(item)
                }}
                className="hover:text-brand-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ''}
            className="min-w-[100px] flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          <ChevronDownIcon
            className={cn(
              'h-4 w-4 flex-shrink-0 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>

        {isOpen && (
          <div className="shadow-pop animate-fade-in absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-100 bg-white p-1">
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50',
                  selected.includes(option) && 'bg-brand-50 font-medium text-brand-700'
                )}
              >
                {option}
              </button>
            ))}
            {allowCreate && search && !options.includes(search) && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Créer «&nbsp;{search}&nbsp;»
              </button>
            )}
            {filteredOptions.length === 0 && !allowCreate && (
              <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
