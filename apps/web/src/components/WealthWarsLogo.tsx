"use client";

import { Orbitron } from 'next/font/google';
import React from 'react';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'], display: 'swap' });

export default function WealthWarsLogo({ className = '' }: { className?: string }) {
  return (
    <h1 className={`${orbitron.className} wealthwars-logo gold-gradient ${className}`}>WEALTH WARS</h1>
  );
}
