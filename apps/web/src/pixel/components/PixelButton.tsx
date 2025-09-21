import { motion } from 'framer-motion'
import { ReactNode, forwardRef } from 'react'
import { pixelTransitions } from '../lib/motionVariants'

export interface PixelButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'destructive' | 'wealth'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(function PixelButton(
  { children, onClick, variant = 'primary', size = 'md', disabled, className }: PixelButtonProps,
  ref
) {
  const base = 'font-mono font-bold border-2 transition-all duration-150'
  const variantMap = {
    primary: 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-500 border-gray-800 text-white',
    destructive: 'bg-red-600 hover:bg-red-500 border-red-800 text-white',
    wealth: 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700 text-black'
  }
  const sizeMap = { sm: 'px-2 py-1 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const disabledCls = disabled ? 'opacity-50 cursor-not-allowed hover:bg-current' : ''
  return (
    <motion.button
      className={[base, variantMap[variant], sizeMap[size], disabledCls, className].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={pixelTransitions.quick}
    >{children}</motion.button>
  )
})
