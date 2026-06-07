'use client'

interface TInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
  type?: string
}

export function TInput({ value, onChange, placeholder, error, disabled, type = 'text' }: TInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        background: 'var(--surf-2)',
        border: `3px solid ${error ? 'var(--fail)' : 'var(--ink)'}`,
        borderRadius: 13,
        color: 'var(--txt)',
        padding: '10px 14px',
        fontSize: 14,
        fontFamily: 'inherit',
        fontWeight: 600,
        width: '100%',
        outline: 'none',
        opacity: disabled ? .45 : 1,
        boxSizing: 'border-box',
      }}
    />
  )
}
