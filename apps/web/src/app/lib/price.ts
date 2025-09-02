export function getPriceInSol(token: string): number {
  // More detailed price function
  const prices: Record<string, number> = {
    'WEALTH': 0.01,
    'SOL': 1,
    'USDC': 0.02,
    'BTC': 50000,
    'ETH': 3000,
  };
  return prices[token] || 0.01;
}

export function recordSwap(swap: { amount: number; fromToken: string; toToken: string }): void {
  // Stub: record the swap
  console.log('Swap recorded:', swap);
}
