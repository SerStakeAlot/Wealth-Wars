"use client";

import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';

/**
 * Hook: when a wallet is connected, register a minimal on-chain adapter into the game store.
 * The adapter exposes initializePlayer and doWork using the WealthWarsProgram client.
 */
export function useOnChainAdapter() {
  const setAdapter = useGameStore(s => s.setOnChainAdapter);
  const setEnabled = useGameStore(s => s.setOnChainEnabled);

  useEffect(() => {
    if (!setAdapter || !setEnabled) return;

    // Disable on-chain interactions
    setAdapter(null);
    setEnabled(false);
  }, [setAdapter, setEnabled]);
}
