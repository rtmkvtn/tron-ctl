'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallets } from '@/src/entities/wallet/api'
import { GenerateModal } from '@/src/features/generate-wallet/ui/GenerateModal'
import { WalletSheet } from '@/src/widgets/wallet-sheet/ui/WalletSheet'
import { TAddr, TPill, TCard, TIcon, TCallout } from '@/src/shared/ui'
import type { Wallet } from '@/src/entities/wallet/types'

const WALLET_COLORS = [
  '--w-blue', '--w-green', '--w-amber', '--w-purple', '--w-pink',
  '--w-teal', '--w-coral', '--w-lime', '--w-sky', '--w-rose',
]

function WalletDot({ colorIndex, size = 36 }: { colorIndex: number; size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `var(${WALLET_COLORS[colorIndex]})`,
      border: '2.5px solid var(--ink)',
      flexShrink: 0,
    }} />
  )
}

function MasterHero({ wallet }: { wallet: Wallet }) {
  return (
    <TCard style={{ overflow: 'hidden', padding: 0 }}>
      {/* blue gradient strip */}
      <div style={{
        background: 'radial-gradient(circle at 38% 50%, #8fc0ff, #3f7dff 72%)',
        border: 'none',
        borderBottom: '3px solid var(--ink)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,.5), rgba(143,192,255,.3))',
          border: '2.5px solid var(--ink)',
          flexShrink: 0,
          animation: 'bob 3.4s ease-in-out infinite',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{wallet.label}</div>
          <TAddr value={wallet.address} />
        </div>
        <TPill kind="master">MASTER</TPill>
      </div>

      {/* stat cells */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '3px solid var(--ink)' }}>
        {[
          { label: 'Delegatable ⚡', value: '—' },
          { label: 'Liquid TRX', value: '—' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderRight: i === 0 ? '3px solid var(--ink)' : 'none',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--txt-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--txt-3)' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </TCard>
  )
}

function StatGrid({ regularCount }: { regularCount: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { label: 'USDT held', value: '0.00' },
        { label: 'Delegated ⚡', value: '—' },
      ].map((s, i) => (
        <TCard key={i} style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--txt-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--txt-2)' }}>{s.value}</div>
        </TCard>
      ))}
    </div>
  )
}

function WalletCard({ wallet, onClick }: { wallet: Wallet; onClick: () => void }) {
  return (
    <TCard
      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      onClick={onClick}
    >
      <WalletDot colorIndex={wallet.colorIndex} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--txt)', marginBottom: 2 }}>{wallet.label}</div>
        <TAddr value={wallet.address} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--txt-3)' }}>0.00</span>
        <span style={{ fontSize: 10, color: 'var(--txt-faint)' }}>USDT</span>
      </div>
    </TCard>
  )
}

interface GenerateCardProps {
  atCapacity: boolean
  onClick: () => void
}

function GenerateCard({ atCapacity, onClick }: GenerateCardProps) {
  if (atCapacity) {
    return (
      <TCallout variant="warn" style={{ gap: 10 }}>
        <TIcon n="alert" s={16} style={{ flexShrink: 0, color: 'var(--pending)' }} />
        <span>At capacity — archive a wallet first</span>
      </TCallout>
    )
  }
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px',
        background: 'transparent',
        border: '3px dashed var(--surf-3)',
        borderRadius: 14,
        color: 'var(--txt-3)',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <TIcon n="plus" s={16} />
      Generate wallet
    </button>
  )
}

export function WalletsPage() {
  const { data: wallets = [], isLoading } = useWallets()
  const [showGenerate, setShowGenerate] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  if (isLoading) {
    return <div style={{ padding: 24, color: 'var(--txt-3)', fontSize: 14 }}>Loading…</div>
  }

  const master = wallets.find(w => w.status === 'MASTER')
  const regulars = wallets.filter(w => w.status === 'REGULAR')
  const archived = wallets.filter(w => w.status === 'ARCHIVED')
  const atCapacity = regulars.length >= 10

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>

      {/* master hero */}
      {master && <MasterHero wallet={master} />}

      {/* stat grid */}
      {master && <StatGrid regularCount={regulars.length} />}

      {/* regular wallets section */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: 'var(--w-amber)',
          marginBottom: 10,
        }}>
          Regular Wallets · {regulars.length}/10
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {regulars.map(w => (
            <WalletCard key={w.id} wallet={w} onClick={() => setSelectedId(w.id)} />
          ))}
          <GenerateCard atCapacity={atCapacity} onClick={() => setShowGenerate(true)} />
        </div>
      </div>

      {/* archived link */}
      {archived.length > 0 && (
        <button
          onClick={() => router.push('/archived')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--bandwidth)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
            padding: 0,
          }}
        >
          View {archived.length} archived wallet{archived.length !== 1 ? 's' : ''} →
        </button>
      )}

      <GenerateModal open={showGenerate} onClose={() => setShowGenerate(false)} />

      <WalletSheet walletId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
