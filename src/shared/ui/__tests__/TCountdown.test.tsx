import { render, screen } from '@testing-library/react'
import { TCountdown } from '../TCountdown'

const NOW = new Date('2025-01-15T12:00:00Z').getTime()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

test('shows "Ready" when maturesAt is in the past', () => {
  render(<TCountdown maturesAt={new Date(NOW - 1000)} />)
  expect(screen.getByText('Ready')).toBeInTheDocument()
})

test('uses default colour when > 24h remaining', () => {
  const future = new Date(NOW + 48 * 60 * 60 * 1000)
  render(<TCountdown maturesAt={future} />)
  const el = screen.getByTestId('countdown')
  expect(el).toHaveStyle({ color: 'var(--txt-2)' })
})

test('uses --critical colour when < 24h remaining', () => {
  const future = new Date(NOW + 12 * 60 * 60 * 1000)
  render(<TCountdown maturesAt={future} />)
  const el = screen.getByTestId('countdown')
  expect(el).toHaveStyle({ color: 'var(--critical)' })
})

test('uses --fail colour when < 1h remaining', () => {
  const future = new Date(NOW + 30 * 60 * 1000)
  render(<TCountdown maturesAt={future} />)
  const el = screen.getByTestId('countdown')
  expect(el).toHaveStyle({ color: 'var(--fail)' })
})
