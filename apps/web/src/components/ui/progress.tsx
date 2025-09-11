'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-green-600 transition-all duration-300 ease-in-out"
        style={{
          transform: `translateX(-${100 - (value / max) * 100}%)`
        }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }