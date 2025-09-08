import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SolanaProviders from "./providers/SolanaProviders";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wealth Wars",
  description: "Build, defend, and grow your empire on-chain",
  openGraph: {
    title: "Wealth Wars",
    description: "Build, defend, and grow your empire on-chain",
    type: "website",
    url: "https://wealthwars.com",
    siteName: "Wealth Wars",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wealth Wars - Build your empire on-chain"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@WealthWars",
    creator: "@WealthWars",
    title: "Wealth Wars",
    description: "Build, defend, and grow your empire on-chain",
    images: ["/og-image.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SolanaProviders>
          {children}
          <Toaster position="top-right" />
        </SolanaProviders>
      </body>
    </html>
  );
}
