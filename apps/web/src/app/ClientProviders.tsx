"use client"

import dynamic from "next/dynamic"
import { Toaster } from "react-hot-toast"
import { Toaster as SonnerToaster } from "sonner"

const SolanaProviders = dynamic(() => import("./providers/SolanaProviders"), { ssr: false })
const GlobalBanner = dynamic(() => import("@/components/GlobalBanner"), { ssr: false })

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SolanaProviders>
      <GlobalBanner />
      {children}
      <Toaster position="top-right" />
      <SonnerToaster />
    </SolanaProviders>
  )
}