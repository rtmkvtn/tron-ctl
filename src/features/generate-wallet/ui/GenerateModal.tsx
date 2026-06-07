'use client'

import { useState } from 'react'
import { Modal, TBtn, TField, TInput } from '@/src/shared/ui'
import { useGenerateWallet } from '@/src/entities/wallet/api'
import type { WalletWithKey } from '@/src/entities/wallet/types'

interface GenerateModalProps {
  open: boolean
  onClose: () => void
  onGenerated?: (wallet: WalletWithKey) => void
}

export function GenerateModal({ open, onClose, onGenerated }: GenerateModalProps) {
  const [label, setLabel] = useState('')
  const { mutate, isPending } = useGenerateWallet()

  function handleGenerate() {
    mutate(label.trim() || undefined, {
      onSuccess: (wallet) => {
        setLabel('')
        onGenerated?.(wallet)
        onClose()
      },
    })
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
