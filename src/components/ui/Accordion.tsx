import { useState, type ReactNode } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-gray-900 hover:text-brand-600"
      >
        {title}
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        {children}
      </div>
    </div>
  )
}
