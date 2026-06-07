import type { ReactNode } from 'react'
import { TIcon } from './TIcon'
import type { IconName } from './TIcon'

type PillKind = 'master' | 'ok' | 'pending' | 'crit' | 'fail' | 'muted' | 'energy' | 'bw'

interface TPillProps {
  kind: PillKind
  icon?: IconName
  bob?: boolean
  children: ReactNode
}

const bgMap: Record<PillKind, string> = {
  master:  'radial-gradient(circle at 38% 32%, #8fc0ff, #3f7dff 72%)',
  ok:      'var(--ok)',
  pending: 'var(--pending)',
  crit:    'var(--critical)',
  fail:    'var(--fail)',
  muted:   'var(--surf-3)',
  energy:  'var(--energy)',
  bw:      'var(--bandwidth)',
}
const colorMap: Record<PillKind, string> = {
  master: 'var(--ink)', ok: 'var(--ink)', pending: 'var(--ink)', crit: 'var(--ink)',
  fail: '#fff', muted: 'var(--txt-3)', energy: 'var(--ink)', bw: 'var(--ink)',
}

export function TPill({ kind, icon, bob, children }: TPillProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 800,
      border: '2px solid var(--ink)',
      background: bgMap[kind],
      color: colorMap[kind],
      animation: bob ? 'pillbob 1.4s ease-in-out infinite' : undefined,
    }}>
      {icon && <TIcon n={icon} s={11} />}
      {children}
    </span>
  )
}
