'use client'

import { TBtn } from '@/src/shared/ui'
import { toast } from '@/src/shared/ui'

export function ToastPreviews() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <TBtn variant="ghost" onClick={() => toast.info('This is an info message')}>Info toast</TBtn>
      <TBtn variant="go" onClick={() => toast.ok('Operation succeeded!')}>OK toast</TBtn>
      <TBtn icon="alert" onClick={() => toast.warn('Heads up — check this')}>Warn toast</TBtn>
      <TBtn variant="danger" onClick={() => toast.fail('Something went wrong')}>Fail toast</TBtn>
    </div>
  )
}
