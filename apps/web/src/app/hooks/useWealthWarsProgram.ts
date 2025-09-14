import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';

/**
 * Hook to manage Solana wallet connection and on-chain program integration
 */
export function useWealthWarsProgram() {
  // Always call hooks at the top level - React rules
  const connectionContext = useConnection();
  const wallet = useWallet();
  
  // Safely extract connection
  const connection = connectionContext?.connection || null;

  // Update wallet connection when wallet changes
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && connection) {
      // const program = initializeWealthWarsProgram(connection, wallet);
    } 
  }, [wallet.connected, wallet.publicKey, connection]);

  return {
    isConnected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}
