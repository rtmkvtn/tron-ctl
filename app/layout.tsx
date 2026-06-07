import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { logger } from '@/lib/logger'
import { Providers } from '@/src/app/providers'

logger.info({ network: process.env.TRON_NETWORK ?? 'unknown' }, 'tron-ctl starting')

const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'tron-ctl',
  description: 'Personal USDT TRC20 wallet manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo.variable} ${GeistMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif', background: 'var(--bg)', color: 'var(--txt)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
