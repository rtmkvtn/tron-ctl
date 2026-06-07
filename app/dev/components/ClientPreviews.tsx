'use client'

import { useState } from 'react'
import { TAddr, THash, TQR, TSeg, TField, TInput, TCountdown } from '@/src/shared/ui'

const ADDR = 'TDmxABCDEFGHIJKLMNOPQRSTUVWXYZw3Kp'
const HASH = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2'

const SEG_OPTS = [
  { value: 'all', label: 'All' },
  { value: 'ok', label: 'Succeeded' },
  { value: 'fail', label: 'Failed' },
]

export function ClientPreviews() {
  const [seg, setSeg] = useState('all')
  const [inputVal, setInputVal] = useState('')

  const NOW = Date.now()

  return (
    <>
      {/* TAddr / THash */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TAddr value={ADDR} />
        <THash value={HASH} />
      </div>

      {/* TQR */}
      <div style={{ marginTop: 24 }}>
        <TQR value={ADDR} size={180} />
      </div>

      {/* TSeg */}
      <div style={{ marginTop: 24 }}>
        <TSeg options={SEG_OPTS} value={seg} onChange={setSeg} />
      </div>

      {/* TField / TInput */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
        <TField label="Normal input">
          <TInput value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder="Enter value…" />
        </TField>
        <TField label="Error state" error="This field is required">
          <TInput value="" onChange={() => {}} error placeholder="Required…" />
        </TField>
        <TField label="Disabled">
          <TInput value="read-only" onChange={() => {}} disabled />
        </TField>
      </div>

      {/* TCountdown */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TCountdown maturesAt={new Date(NOW + 48 * 3600 * 1000)} />
        <TCountdown maturesAt={new Date(NOW + 12 * 3600 * 1000)} />
        <TCountdown maturesAt={new Date(NOW + 20 * 60 * 1000)} />
      </div>
    </>
  )
}
