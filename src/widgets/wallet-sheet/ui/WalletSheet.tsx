'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useWallet, useUpdateLabel, fetchWalletKey } from '@/src/entities/wallet/api'
import { TIcon, TPill, TAddr, TBtn, TQR } from '@/src/shared/ui'
import type { Wallet } from '@/src/entities/wallet/types'

const WALLET_COLORS = [
  '--w-blue', '--w-green', '--w-amber', '--w-purple', '--w-pink',
  '--w-teal', '--w-coral', '--w-lime', '--w-sky', '--w-rose',
]

interface WalletSheetProps {
  walletId: string | null
  onClose: () => void
}

function SheetContent({ wallet, onClose }: {
  wallet: Wallet
  onClose: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(wallet.label)
  const [key, setKey] = useState<string | null>(null)
  const [keyLoading, setKeyLoading] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: updateLabel } = useUpdateLabel()

  useEffect(() => {
    setDraft(wallet.label)
  }, [wallet.label])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function saveLabel() {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === wallet.label) { setEditing(false); return }
    updateLabel({ id: wallet.id, label: trimmed }, {
      onSuccess: () => setEditing(false),
    })
  }

  async function handleShowKey() {
    setKeyLoading(true)
    try {
      const k = await fetchWalletKey(wallet.id)
      setKey(k)
    } finally {
      setKeyLoading(false)
    }
  }

  async function handleCopyKey() {
    if (!key) return
    await navigator.clipboard.writeText(key)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  function handleHideKey() {
    setKey(null)
    setKeyCopied(false)
  }

  const createdAt = new Date(wallet.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <>
      {/* sheet header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '18px 20px 14px',
        borderBottom: '2px solid var(--line)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: `var(${WALLET_COLORS[wallet.colorIndex]})`,
          border: '2.5px solid var(--ink)',
          flexShrink: 0,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveLabel()
                if (e.key === 'Escape') { setEditing(false); setDraft(wallet.label) }
              }}
              onBlur={saveLabel}
              style={{
                background: 'var(--surf-2)',
                border: '2px solid var(--w-amber)',
                borderRadius: 8,
                color: 'var(--txt)',
                padding: '4px 8px',
                fontSize: 16,
                fontWeight: 800,
                fontFamily: 'inherit',
                width: '100%',
                outline: 'none',
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {wallet.label}
              </span>
              <button
                onClick={() => setEditing(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-faint)', padding: 2, display: 'flex', alignItems: 'center' }}
                aria-label="Edit label"
              >
                <TIcon n="edit" s={14} />
              </button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <TPill kind="ok">Active</TPill>
            <span style={{ fontSize: 11, color: 'var(--txt-faint)' }}>Since {createdAt}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-3)', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <TIcon n="x" s={18} />
        </button>
      </div>

      {/* body */}
      <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* balance card */}
        <div style={{
          background: 'var(--surf)',
          border: '3px solid var(--ink)',
          borderRadius: 14,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ opacity: 0.5 }}>
            <TQR value={wallet.address} size={100} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 28, color: 'var(--txt)' }}>0.00</div>
            <div style={{ fontSize: 12, color: 'var(--txt-faint)', marginTop: 2 }}>USDT</div>
          </div>
          <TAddr value={wallet.address} />
        </div>

        {/* button row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <TBtn disabled style={{ flex: 1 }} icon="send">Send USDT</TBtn>
          <TBtn
            variant="ghost"
            icon="key"
            disabled={keyLoading}
            onClick={key ? handleHideKey : handleShowKey}
          >
            {key ? 'Hide key' : keyLoading ? '…' : 'Show key'}
          </TBtn>
          <TBtn variant="danger" disabled icon="archive">Archive</TBtn>
        </div>

        {/* inline key reveal */}
        {key && (
          <div style={{
            background: 'rgba(255,93,108,.08)',
            border: '3px solid var(--fail)',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fail)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Private key — keep secret
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--txt)',
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}>
              {key}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <TBtn sm icon={keyCopied ? 'check' : 'copy'} onClick={handleCopyKey}>
                {keyCopied ? 'Copied!' : 'Copy'}
              </TBtn>
              <TBtn sm variant="ghost" icon="x" onClick={handleHideKey}>Hide</TBtn>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export function WalletSheet({ walletId, onClose }: WalletSheetProps) {
  const reduced = useReducedMotion()
  const { data: wallet } = useWallet(walletId ?? '')

  return (
    <AnimatePresence>
      {walletId && (
        <>
          <motion.div
            key="ws-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(8,10,20,.5)', backdropFilter: 'blur(3px)', zIndex: 41 }}
          />
          <motion.div
            key="ws-panel"
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
            {wallet
              ? <SheetContent wallet={wallet} onClose={onClose} />
              : <div style={{ padding: 24, color: 'var(--txt-3)', fontSize: 14 }}>Loading…</div>
            }
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
