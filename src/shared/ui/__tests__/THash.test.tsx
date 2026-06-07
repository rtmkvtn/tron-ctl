import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { THash } from '../THash'

const FULL = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0'

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
})

test('truncates to first4…last4', () => {
  render(<THash value={FULL} />)
  expect(screen.getByText('a1b2…a9b0')).toBeInTheDocument()
})

test('copies full value on click', async () => {
  render(<THash value={FULL} />)
  await userEvent.click(screen.getByRole('button'))
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FULL)
})
