'use client'

import { useState } from 'react'
import { SunRays, Constellation, Tube, MHeader, MBottomNav } from '@/src/shared/ui'

type Tab = 'wallets' | 'master' | 'operations' | 'archived'

export function ComplexPreviews() {
  const [tab, setTab] = useState<Tab>('wallets')

  return (
    <>
      {/* SunRays */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        {[0, 500, 2000].map(trx => (
          <div key={trx} style={{ position: 'relative', width: 120, height: 120, display: 'grid', placeItems: 'center', background: 'var(--surf)', border: '3px solid var(--ink)', borderRadius: 14 }}>
            <SunRays frozenTrx={trx} />
            <span style={{ position: 'relative', zIndex: 5, fontSize: 11, fontWeight: 800, color: 'var(--txt-3)' }}>{trx} TRX</span>
          </div>
        ))}
      </div>

      {/* Constellation */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
        <div style={{ width: 320 }}>
          <Constellation walletCount={5} unwindingCount={1} />
        </div>
        <div style={{ width: 220 }}>
          <Constellation walletCount={2} />
        </div>
      </div>

      {/* Tube */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt-faint)', marginBottom: 6 }}>Active</div>
          <Tube active={true} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt-faint)', marginBottom: 6 }}>Inactive</div>
          <Tube active={false} />
        </div>
      </div>

      {/* Shell */}
      <div style={{ border: '3px solid var(--ink)', borderRadius: 14, overflow: 'hidden', maxWidth: 640, marginBottom: 16 }}>
        <MHeader activeTab={tab} onTabChange={setTab} />
        <div style={{ background: 'var(--bg)', padding: 16, color: 'var(--txt-3)', fontSize: 13 }}>Page content area</div>
        <MBottomNav activeTab={tab} onTabChange={setTab} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--txt-faint)' }}>Note: MBottomNav hides at md breakpoint (≥768px); resize to see responsive behaviour.</p>
    </>
  )
}
