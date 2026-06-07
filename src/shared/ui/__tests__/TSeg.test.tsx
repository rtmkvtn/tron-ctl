import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TSeg } from '../TSeg'

const opts = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

test('renders all option labels', () => {
  render(<TSeg options={opts} value="a" onChange={() => {}} />)
  expect(screen.getByText('Alpha')).toBeInTheDocument()
  expect(screen.getByText('Beta')).toBeInTheDocument()
  expect(screen.getByText('Gamma')).toBeInTheDocument()
})

test('calls onChange with correct value on click', async () => {
  const onChange = vi.fn()
  render(<TSeg options={opts} value="a" onChange={onChange} />)
  await userEvent.click(screen.getByText('Beta'))
  expect(onChange).toHaveBeenCalledWith('b')
})

test('active option has data-active attribute', () => {
  render(<TSeg options={opts} value="b" onChange={() => {}} />)
  expect(screen.getByText('Beta').closest('button')).toHaveAttribute('data-active', 'true')
  expect(screen.getByText('Alpha').closest('button')).not.toHaveAttribute('data-active', 'true')
})
