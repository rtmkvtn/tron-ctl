import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TAddr } from '../TAddr'

const FULL = 'TDmxABCDEFGHIJKLMNOPQRSTUVWXYZw3Kp'

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
})

test('truncates to first4…last4', () => {
  render(<TAddr value={FULL} />)
  expect(screen.getByText('TDmx…w3Kp')).toBeInTheDocument()
})

test('copies full value on click', async () => {
  render(<TAddr value={FULL} />)
  await userEvent.click(screen.getByRole('button'))
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FULL)
})
