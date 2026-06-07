'use client'

import { useState } from 'react'
import { Modal, Sheet, TBtn } from '@/src/shared/ui'

export function OverlayPreviews() {
  const [modal, setModal] = useState(false)
  const [sheet, setSheet] = useState(false)

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <TBtn icon="box" onClick={() => setModal(true)}>Open Modal</TBtn>
      <TBtn icon="layers" variant="go" onClick={() => setSheet(true)}>Open Sheet</TBtn>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        icon="wallet"
        iconBg="var(--w-blue)"
        title="Example Modal"
        sub="Subtitle text goes here"
        footer={<><TBtn variant="ghost" onClick={() => setModal(false)}>Cancel</TBtn><TBtn onClick={() => setModal(false)}>Confirm</TBtn></>}
      >
        <p style={{ color: 'var(--txt-2)', margin: 0 }}>Modal body content. This supports any children. Observe the spring enter and exit animations.</p>
      </Modal>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        icon="wallet"
        title="Wallet Detail"
        sub="TDmx…w3Kp"
        footer={<TBtn variant="ghost" onClick={() => setSheet(false)}>Close</TBtn>}
      >
        <p style={{ color: 'var(--txt-2)', margin: 0 }}>Sheet body content. Slides in from the right. Observe the spring enter and exit animations.</p>
      </Sheet>
    </div>
  )
}
