import type { CSSProperties, ReactNode } from 'react'

interface TCardProps {
  children: ReactNode
  flat?: boolean
  style?: CSSProperties
  className?: string
}

export function TCard({ children, flat, style, className }: TCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surf)',
        border: '3px solid var(--ink)',
        borderRadius: 17,
        boxShadow: flat ? 'none' : 'var(--sh)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
