'use client'

import { useState } from 'react'
import { useWallets } from '@/src/entities/wallet/api'
import { GenerateModal } from '@/src/features/generate-wallet/ui/GenerateModal'
import { TAddr } from '@/src/shared/ui'

const WALLET_COLORS = [
  '--w-blue', '--w-green', '--w-amber', '--w-purple', '--w-pink',
  '--w-teal', '--w-coral', '--w-lime', '--w-sky', '--w-rose',
]

export function WalletsPage() {
  const { data: wallets = [], isLoading } = useWallets()
  const [showGenerate, setShowGenerate] = useState(false)

  if (isLoading) {
    return <div style={{ padding: 24, color: 'var(--txt-3)', fontSize: 14 }}>Loading…</div>
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640, margin: '0 auto' }}>
      {wallets.map(w => (
        <div
          key={w.id}
          style={{
            background: 'var(--surf)',
            border: '3px solid var(--ink)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `var(${WALLET_COLORS[w.colorIndex]})`,
            border: '2.5px solid var(--ink)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--txt)', marginBottom: 2 }}>{w.label}</div>
            <TAddr value={w.address} />
          </div>
        </div>
      ))}

      <button
        onClick={() => setShowGenerate(true)}
        style={{
          padding: '14px 16px',
          background: 'transparent',
          border: '3px dashed var(--surf-3)',
          borderRadius: 14,
          color: 'var(--txt-3)',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 14,
          textAlign: 'left',
        }}
      >
        + Generate wallet
      </button>

      <GenerateModal open={showGenerate} onClose={() => setShowGenerate(false)} />
    </div>
  )
}
