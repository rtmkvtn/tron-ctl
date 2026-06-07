import { toast as sonner } from 'sonner'

const base = {
  style: {
    background: 'var(--bg-2)',
    border: '3px solid var(--ink)',
    color: 'var(--txt)',
    fontFamily: 'var(--font-baloo), system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 14,
    borderRadius: 13,
    boxShadow: 'var(--sh)',
  },
}

export const toast = {
  info: (msg: string) => sonner(msg, { ...base }),
  ok:   (msg: string) => sonner(msg, { ...base, style: { ...base.style, borderLeftColor: 'var(--ok)', borderLeftWidth: 4 } }),
  warn: (msg: string) => sonner(msg, { ...base, style: { ...base.style, borderLeftColor: 'var(--pending)', borderLeftWidth: 4 } }),
  fail: (msg: string) => sonner(msg, { ...base, style: { ...base.style, borderLeftColor: 'var(--fail)', borderLeftWidth: 4 } }),
}
