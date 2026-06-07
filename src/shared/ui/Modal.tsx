'use client'

import { useReducedMotion, AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { TIcon } from './TIcon'
import type { IconName } from './TIcon'

interface ModalProps {
  open: boolean
  onClose: () => void
  icon?: IconName
  iconBg?: string
  title: string
  sub?: string
  wide?: boolean
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, icon, iconBg, title, sub, wide, children, footer }: ModalProps) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(8,10,20,.62)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            display: 'grid',
            placeItems: 'center',
            padding: 24,
          }}
        >
          <motion.div
            key="card"
            initial={{ scale: 0.9, opacity: 0.35 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: wide ? 'min(600px, 96%)' : 'min(460px, 96%)',
              background: 'var(--bg-2)',
              border: '4px solid var(--ink)',
              borderRadius: 22,
              boxShadow: 'var(--sh-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '92vh',
            }}
          >
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 14px', borderBottom: '2px solid var(--line)' }}>
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
              <div style={{ padding: '12px 20px 16px', borderTop: '2px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
