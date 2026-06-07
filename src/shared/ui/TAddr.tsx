'use client'

import { useState } from 'react'
import { TIcon } from './TIcon'

interface TAddrProps { value: string }

export function TAddr({ value }: TAddrProps) {
  const [copied, setCopied] = useState(false)
  const truncated = value.length > 8 ? `${value.slice(0, 4)}…${value.slice(-4)}` : value

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--txt-2)' }}>
      <span>{truncated}</span>
      <button
        onClick={copy}
        aria-label="Copy address"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--txt-faint)', display: 'flex', alignItems: 'center' }}
      >
        <TIcon n={copied ? 'check' : 'copy'} s={13} />
      </button>
    </span>
  )
}
