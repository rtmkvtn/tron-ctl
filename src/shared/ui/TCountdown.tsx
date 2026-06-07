'use client'

import { useEffect, useState } from 'react'

interface TCountdownProps { maturesAt: Date }

function fmt(ms: number): string {
  if (ms <= 0) return 'Ready'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0 || d > 0) parts.push(`${h}h`)
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`)
  parts.push(`${sec}s`)
  return parts.join(' ')
}

function color(ms: number): string {
  if (ms < 60 * 60 * 1000) return 'var(--fail)'
  if (ms < 24 * 60 * 60 * 1000) return 'var(--critical)'
  return 'var(--txt-2)'
}

export function TCountdown({ maturesAt }: TCountdownProps) {
  const [remaining, setRemaining] = useState(() => maturesAt.getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => setRemaining(maturesAt.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [maturesAt])

  return (
    <span data-testid="countdown" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: color(remaining) }}>
      {fmt(remaining)}
    </span>
  )
}
