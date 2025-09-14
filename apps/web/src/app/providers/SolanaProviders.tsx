'use client';

import React, { PropsWithChildren } from 'react';

export default function SolanaProviders({ children }: PropsWithChildren) {
  // Wallet functionality disabled
  return <>{children}</>;
}
