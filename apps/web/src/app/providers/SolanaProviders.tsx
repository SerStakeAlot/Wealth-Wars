"use client"

// Centralized Solana wallet / connection providers.
// This wraps the app with a Connection + Wallet context using
// the standard wallet-adapter packages already present in dependencies.
// NOTE: We purposely keep this lightweight (no autoConnect spam) and
// avoid server-side usage. All logic is client-only.

import React, { PropsWithChildren, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Import base styles for wallet modal (tree-shaken minimal CSS)
import '@solana/wallet-adapter-react-ui/styles.css'

// Helper to derive RPC endpoint. We use (priority):
// 1. NEXT_PUBLIC_SOLANA_RPC
// 2. clusterApiUrl(network) where network from NEXT_PUBLIC_SOLANA_NETWORK (default 'devnet')
function getEndpoint() {
  if (typeof window === 'undefined') return 'http://localhost:8899' // SSR fallback (never actually used client ops)
  const explicit = process.env.NEXT_PUBLIC_SOLANA_RPC
  if (explicit && explicit.trim().length > 0) return explicit.trim()
  const net = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as any
  try { return clusterApiUrl(net) } catch { return clusterApiUrl('devnet') }
}

export default function SolanaProviders({ children }: PropsWithChildren) {
  const endpoint = useMemo(() => getEndpoint(), [])
  // Provide a small curated wallet list for now. Additional wallets can be appended easily.
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

