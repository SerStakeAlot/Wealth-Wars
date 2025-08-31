// apps/web/src/lib/solana.ts
import { Connection, clusterApiUrl } from '@solana/web3.js';

// Use .env.local if present; otherwise default to devnet
const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  clusterApiUrl(
    (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as 'devnet' | 'testnet' | 'mainnet-beta') || 'devnet'
  );

// Reuse one Connection instance
let _connection: Connection | null = null;

export function getConnection() {
  if (!_connection) _connection = new Connection(RPC_URL, 'confirmed');
  return _connection;
}
