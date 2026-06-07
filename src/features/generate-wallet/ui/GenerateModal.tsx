'use client'

import { useState } from 'react'
import { Modal, TBtn, TField, TInput, TCallout, TIcon } from '@/src/shared/ui'
import { useGenerateWallet } from '@/src/entities/wallet/api'
import type { WalletWithKey } from '@/src/entities/wallet/types'

interface GenerateModalProps {
  open: boolean
  onClose: () => void
}

export function GenerateModal({ open, onClose }: GenerateModalProps) {
  const [label, setLabel] = useState('')
  const [generated, setGenerated] = useState<WalletWithKey | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const { mutate, isPending } = useGenerateWallet()

  function handleGenerate() {
    mutate(label.trim() || undefined, {
      onSuccess: (wallet) => {
        setLabel('')
        setGenerated(wallet)
        setSaved(false)
        setCopied(false)
      },
    })
  }

  function handleContinue() {
    setGenerated(null)
    setSaved(false)
    onClose()
  }

  async function handleCopy() {
    if (!generated) return
    await navigator.clipboard.writeText(generated.privateKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (generated) {
    return (
      <Modal
        open={open}
        onClose={handleContinue}
        icon="key"
        title="Save your private key"
        sub={generated.label}
        footer={
          <TBtn variant="go" onClick={handleContinue} disabled={!saved}>
            Continue →
          </TBtn>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TCallout variant="crit">
            <TIcon n="alert" s={16} style={{ flexShrink: 0, color: 'var(--fail)' }} />
            <span>This is the <strong>only time</strong> this key will be shown here. Save it now — it cannot be recovered if lost.</span>
          </TCallout>

          <div style={{
            background: 'rgba(255,93,108,.08)',
            border: '3px solid var(--fail)',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--txt)',
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}>
              {generated.privateKey}
            </span>
            <TBtn sm onClick={handleCopy} icon={copied ? 'check' : 'copy'}>
              {copied ? 'Copied!' : 'Copy key'}
            </TBtn>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={saved}
              onChange={e => setSaved(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: 'var(--ok)', flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: 'var(--txt-2)', fontWeight: 600, lineHeight: 1.4 }}>
              I've saved this private key somewhere safe
            </span>
          </label>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="plus"
      title="Generate wallet"
      sub="Creates a new random TRON keypair"
      footer={
        <>
          <TBtn variant="ghost" onClick={onClose}>Cancel</TBtn>
          <TBtn variant="go" onClick={handleGenerate} disabled={isPending}>
            {isPending ? 'Generating…' : 'Generate →'}
          </TBtn>
        </>
      }
    >
      <TField label="Label (optional)">
        <TInput
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="e.g. vendor-pool"
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' && !isPending) handleGenerate() }}
        />
      </TField>
    </Modal>
  )
}
