import type { ReactNode } from 'react'

interface ToolbarProps {
  title: string
  children?: ReactNode
}

export function Toolbar({ title, children }: ToolbarProps) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  )
}
