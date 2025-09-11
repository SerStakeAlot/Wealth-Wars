import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { useGame } from '../lib/store';
import { toast } from 'react-hot-toast';

/**
 * Hook to manage Solana wallet connection and on-chain program integration
 */
export function useWealthWarsProgram() {
  // Always call hooks at the top level - React rules
  const connectionContext = useConnection();
  const wallet = useWallet();
  
  // Safely extract connection
  const connection = connectionContext?.connection || null;
  
  const { 
    setWalletConnection, 
    clearWalletConnection, 
    setOnChainMode, 
    isOnChainMode,
    wealthWarsProgram,
    refreshPlayerData 
  } = useGame();

  // Update wallet connection when wallet changes
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && connection) {
      // Create anchor wallet wrapper
      const anchorWallet = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction!,
        signAllTransactions: wallet.signAllTransactions!,
      };

      setWalletConnection(connection, anchorWallet);
      setOnChainMode(true);
      
      // Refresh player data when connected
      refreshPlayerData();
      
      toast.success('Connected to Wealth Wars on-chain!');
    } else {
      clearWalletConnection();
      setOnChainMode(false);
    }
  }, [wallet.connected, wallet.publicKey, connection]);

  // Auto-initialize player if needed
  useEffect(() => {
    if (wealthWarsProgram && wallet.connected) {
      // Check if player exists, if not initialize
      const checkAndInitPlayer = async () => {
        try {
          const playerState = await wealthWarsProgram.getPlayerState();
          if (!playerState && wallet.connected) {
            // Player not initialized, prompt user
            console.log('Player account not found, call initPlayerOnChain to initialize');
          }
        } catch (error) {
          console.error('Error checking player state:', error);
        }
      };

      checkAndInitPlayer();
    }
  }, [wealthWarsProgram, wallet.connected]);

  return {
    isConnected: wallet.connected,
    isOnChainMode,
    wealthWarsProgram,
    publicKey: wallet.publicKey,
  };
}
