import type { Metadata } from 'next'
import './globals.css'
import { logger } from '@/lib/logger'

logger.info({ network: process.env.TRON_NETWORK ?? 'unknown' }, 'tron-ctl starting')

export const metadata: Metadata = {
  title: 'tron-ctl',
  description: 'Personal USDT TRC20 wallet manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
