'use client'

import React, { useId, useState } from 'react'
import { cn } from '@/lib/utils'

type Side = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: Side
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const base = 'pointer-events-none absolute z-50 px-2 py-1 rounded-md text-xs bg-gray-900 text-white shadow-lg whitespace-pre-line'
  const pos =
    side === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : side === 'bottom'
      ? 'top-full left-1/2 -translate-x-1/2 mt-2'
      : side === 'left'
      ? 'right-full top-1/2 -translate-y-1/2 mr-2'
      : 'left-full top-1/2 -translate-y-1/2 ml-2'

  return (
    <span className="relative inline-flex">
      <span
        aria-describedby={id}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex"
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(base, pos, open ? 'opacity-100' : 'opacity-0', 'transition-opacity duration-150', className)}
      >
        {content}
      </span>
    </span>
  )
}

export default Tooltip
