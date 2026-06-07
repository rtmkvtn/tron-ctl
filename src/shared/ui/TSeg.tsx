'use client'

interface Option { value: string; label: string }

interface TSegProps {
  options: Option[]
  value: string
  onChange: (v: string) => void
}

export function TSeg({ options, value, onChange }: TSegProps) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--surf-3)', borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            data-active={active ? 'true' : undefined}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--surf)' : 'transparent',
              color: active ? 'var(--txt)' : 'var(--txt-3)',
              boxShadow: active ? 'var(--sh-sm)' : 'none',
              transition: 'background .1s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
