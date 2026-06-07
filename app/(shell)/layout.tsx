'use client'

import { usePathname, useRouter } from 'next/navigation'
import { MHeader, MBottomNav } from '@/src/shared/ui'

type Tab = 'wallets' | 'master' | 'operations' | 'archived'

const PATH_TO_TAB: Record<string, Tab> = {
  '/wallets':  'wallets',
  '/master':   'master',
  '/activity': 'operations',
  '/archived': 'archived',
}

const TAB_TO_PATH: Record<Tab, string> = {
  wallets:    '/wallets',
  master:     '/master',
  operations: '/activity',
  archived:   '/archived',
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = PATH_TO_TAB[pathname] ?? 'wallets'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <MHeader activeTab={activeTab} onTabChange={tab => router.push(TAB_TO_PATH[tab])} />
      <main style={{ flex: 1, paddingBottom: 'calc(60px + env(safe-area-inset-bottom))' }}>
        {children}
      </main>
      <MBottomNav activeTab={activeTab} onTabChange={tab => router.push(TAB_TO_PATH[tab])} />
    </div>
  )
}
