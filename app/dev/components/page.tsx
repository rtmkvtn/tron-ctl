import { TIcon } from '@/src/shared/ui'
import type { IconName } from '@/src/shared/ui'

const ALL_ICONS: IconName[] = [
  'wallet','crown','key','plus','archive','freeze','bolt','wave',
  'arrowDown','arrowUp','arrowL','chevR','check','x','info','alert',
  'clock','link','list','layers','refresh','dl','copy','eye',
  'ext','edit','send','promote','box',
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--w-amber)', marginBottom: 20 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--txt)', marginBottom: 8 }}>Design System</h1>
      <p style={{ color: 'var(--txt-3)', fontSize: 14, marginBottom: 56 }}>Component gallery — all variants and states</p>

      <Section title="Icons">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 12 }}>
          {ALL_ICONS.map(name => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', background: 'var(--surf)', border: '2px solid var(--ink)', borderRadius: 10 }}>
              <TIcon n={name} s={20} style={{ color: 'var(--txt-2)' }} />
              <span style={{ fontSize: 10, color: 'var(--txt-faint)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* further sections added per issue */}
    </main>
  )
}
