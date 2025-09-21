'use client'
import dynamic from 'next/dynamic'
import React from 'react'

// Lazy load so initial bundle for existing /game or home unaffected when flag off
const PixelApp = dynamic(() => import('../../pixel/PixelWrapper').then(m => m.PixelWrapper), { ssr: false })

export default function PixelPage() {
  if (process.env.NEXT_PUBLIC_PIXEL_UI !== '1') {
    return <div className='p-8 text-sm text-slate-400'>Pixel UI disabled. Set NEXT_PUBLIC_PIXEL_UI=1 to enable.</div>
  }
  return <PixelApp />
}
