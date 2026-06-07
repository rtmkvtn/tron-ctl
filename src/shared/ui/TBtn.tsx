import type { CSSProperties, ReactNode } from 'react'
import { TIcon } from './TIcon'
import type { IconName } from './TIcon'

type Variant = 'primary' | 'go' | 'ghost' | 'danger'

interface TBtnProps {
  variant?: Variant
  sm?: boolean
  lg?: boolean
  icon?: IconName
  iconPos?: 'left' | 'right'
  disabled?: boolean
  onClick?: () => void
  children?: ReactNode
  type?: 'button' | 'submit'
  style?: CSSProperties
}

const bgMap: Record<Variant, string> = {
  primary: 'var(--w-amber)',
  go:      'var(--ok)',
  ghost:   'transparent',
  danger:  'var(--fail)',
}
const colorMap: Record<Variant, string> = {
  primary: 'var(--ink)',
  go:      'var(--ink)',
  ghost:   'var(--txt-2)',
  danger:  '#fff',
}

export function TBtn({ variant = 'primary', sm, lg, icon, iconPos = 'left', disabled, onClick, children, type = 'button', style }: TBtnProps) {
  const isGhost = variant === 'ghost'
  const size = lg ? { padding: '12px 24px', fontSize: 16 } : sm ? { padding: '5px 10px', fontSize: 12 } : { padding: '8px 16px', fontSize: 14 }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: bgMap[variant],
        color: colorMap[variant],
        border: `3px solid ${isGhost ? 'var(--surf-3)' : 'var(--ink)'}`,
        borderRadius: 13,
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: isGhost ? 'none' : 'var(--sh-sm)',
        transition: 'transform .1s, box-shadow .1s',
        opacity: disabled ? .45 : 1,
        flexDirection: iconPos === 'right' ? 'row-reverse' : 'row',
        fontFamily: 'inherit',
        ...size,
        ...style,
      }}
    >
      {icon && <TIcon n={icon} s={sm ? 13 : lg ? 18 : 15} />}
      {children}
    </button>
  )
}
