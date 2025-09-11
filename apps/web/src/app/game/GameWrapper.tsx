'use client';

import React from 'react';
import { useWealthWarsProgram } from '../hooks/useWealthWarsProgram';

interface GameWrapperProps {
  children: React.ReactNode;
  onSolanaData?: (data: any) => void;
}

export function GameWrapper({ children, onSolanaData }: GameWrapperProps) {
  // Safely try to use Solana hooks
  let solanaData = null;
  
  try {
    solanaData = useWealthWarsProgram();
    if (onSolanaData && solanaData) {
      onSolanaData(solanaData);
    }
  } catch (error) {
    console.warn('Solana integration not available:', error);
  }

  return <>{children}</>;
}
