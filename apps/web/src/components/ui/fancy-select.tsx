"use client";

import React, { useEffect, useRef, useState } from 'react'

type Option = { label: string; value: string }

interface FancySelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function FancySelect({ value, onChange, options, placeholder = 'Select…', className = '' }: FancySelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 px-3 py-2 rounded-md bg-card text-foreground border border-border flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className="truncate text-sm">{selected ? selected.label : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="opacity-70">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-card shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted ${opt.value === value ? 'bg-muted' : ''}`}
            >
              {opt.label}
            </li>
          ))}
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">No options</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default FancySelect
