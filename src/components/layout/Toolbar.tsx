import type { ReactNode } from 'react'

interface ToolbarProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export function Toolbar({ title, subtitle, children }: ToolbarProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex flex-shrink-0 items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  )
}
