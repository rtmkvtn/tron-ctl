import { vi, describe, test, expect } from 'vitest'
import { toast as sonnerToast } from 'sonner'

vi.mock('sonner', () => ({ toast: vi.fn() }))

import { toast } from '../toast'

describe('toast wrapper', () => {
  test('toast.info calls sonner with message', () => {
    toast.info('hello info')
    expect(sonnerToast).toHaveBeenCalled()
  })

  test('toast.ok calls sonner with message', () => {
    toast.ok('all good')
    expect(sonnerToast).toHaveBeenCalled()
  })

  test('toast.warn calls sonner with message', () => {
    toast.warn('heads up')
    expect(sonnerToast).toHaveBeenCalled()
  })

  test('toast.fail calls sonner with message', () => {
    toast.fail('something broke')
    expect(sonnerToast).toHaveBeenCalled()
  })
})
