import type { CSSProperties, ReactNode } from 'react'

type CalloutVariant = 'info' | 'warn' | 'crit'

interface TCalloutProps { variant: CalloutVariant; children: ReactNode; style?: CSSProperties }

const styles: Record<CalloutVariant, { borderColor: string; background: string }> = {
  info: { borderColor: 'var(--bandwidth)', background: 'rgba(91,155,255,.08)' },
  warn: { borderColor: 'var(--pending)',   background: 'rgba(255,177,61,.08)' },
  crit: { borderColor: 'var(--fail)',      background: 'rgba(255,93,108,.08)' },
}

export function TCallout({ variant, children, style }: TCalloutProps) {
  const s = styles[variant]
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 12,
      alignItems: 'flex-start',
      fontSize: 13,
      color: 'var(--txt-2)',
      borderLeft: `3px solid ${s.borderColor}`,
      background: s.background,
      ...style,
    }}>
      {children}
    </div>
  )
}
