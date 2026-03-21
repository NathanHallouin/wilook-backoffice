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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={cn(
            'min-h-[38px] w-full rounded-md border border-gray-300 bg-white px-3 py-1.5',
            'flex flex-wrap gap-1 items-center cursor-pointer',
            'focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'
          )}
          onClick={() => setIsOpen(true)}
        >
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(item)
                }}
                className="hover:text-indigo-600"
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
            className="flex-1 min-w-[100px] outline-none text-sm"
          />
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-gray-100',
                  selected.includes(option) && 'bg-indigo-50 text-indigo-700'
                )}
              >
                {option}
              </button>
            ))}
            {allowCreate && search && !options.includes(search) && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50"
              >
                Créer "{search}"
              </button>
            )}
            {filteredOptions.length === 0 && !allowCreate && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Aucun résultat
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
