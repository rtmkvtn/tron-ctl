'use client'

import { useReducedMotion, AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { TIcon } from './TIcon'
import type { IconName } from './TIcon'

interface SheetProps {
  open: boolean
  onClose: () => void
  icon?: IconName
  iconBg?: string
  title: string
  sub?: string
  children: ReactNode
  footer?: ReactNode
}

export function Sheet({ open, onClose, icon, iconBg, title, sub, children, footer }: SheetProps) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sheet-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(8,10,20,.5)', backdropFilter: 'blur(3px)', zIndex: 41 }}
          />
          <motion.div
            key="sheet-panel"
            initial={{ x: 48, opacity: 0.25 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 32 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(560px, 94%)',
              background: 'var(--bg-2)',
              borderLeft: '4px solid var(--ink)',
              zIndex: 42,
              boxShadow: '-10px 0 0 rgba(6,8,16,.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 14px', borderBottom: '2px solid var(--line)', flexShrink: 0 }}>
              {icon && (
                <span style={{ width: 36, height: 36, borderRadius: 10, background: iconBg ?? 'var(--surf)', border: '2px solid var(--ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <TIcon n={icon} s={18} />
                </span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--txt)' }}>{title}</div>
                {sub && <div style={{ fontSize: 12, color: 'var(--txt-3)', marginTop: 2 }}>{sub}</div>}
              </div>
              <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-3)', padding: 4, display: 'flex', alignItems: 'center' }}>
                <TIcon n="x" s={18} />
              </button>
            </div>

            {/* body */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>{children}</div>

            {/* footer */}
            {footer && (
              <div style={{ padding: '12px 20px 16px', borderTop: '2px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
