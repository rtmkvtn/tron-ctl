import type { CSSProperties, ReactNode } from 'react'

interface TFieldProps {
  label: string
  error?: string
  children: ReactNode
  style?: CSSProperties
}

export function TField({ label, error, children, style }: TFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt-3)' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 11, color: 'var(--fail)', fontWeight: 600 }}>{error}</span>}
    </div>
  )
}
