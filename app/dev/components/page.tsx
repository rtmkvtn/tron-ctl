import { TIcon, TBtn, TPill, TCard, TCallout } from '@/src/shared/ui'
import type { IconName } from '@/src/shared/ui'
import { ClientPreviews } from './ClientPreviews'
import { OverlayPreviews } from './OverlayPreviews'
import { ToastPreviews } from './ToastPreviews'

const ALL_ICONS: IconName[] = [
  'wallet','crown','key','plus','archive','freeze','bolt','wave',
  'arrowDown','arrowUp','arrowL','chevR','check','x','info','alert',
  'clock','link','list','layers','refresh','dl','copy','eye',
  'ext','edit','send','promote','box',
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--w-amber)', marginBottom: 20, margin: '0 0 20px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', ...style }}>{children}</div>
}

export default function DesignSystemPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--txt)', margin: '0 0 8px' }}>Design System</h1>
      <p style={{ color: 'var(--txt-3)', fontSize: 14, margin: '0 0 56px' }}>Component gallery — all variants and states</p>

      <Section title="Icons">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
          {ALL_ICONS.map(name => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', background: 'var(--surf)', border: '2px solid var(--ink)', borderRadius: 10 }}>
              <TIcon n={name} s={20} style={{ color: 'var(--txt-2)' }} />
              <span style={{ fontSize: 10, color: 'var(--txt-faint)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="TBtn">
        <Row>
          <TBtn>Primary</TBtn>
          <TBtn variant="go">Go</TBtn>
          <TBtn variant="ghost">Ghost</TBtn>
          <TBtn variant="danger">Danger</TBtn>
        </Row>
        <Row style={{ marginTop: 10 }}>
          <TBtn sm>Small</TBtn>
          <TBtn>Default</TBtn>
          <TBtn lg>Large</TBtn>
        </Row>
        <Row style={{ marginTop: 10 }}>
          <TBtn icon="send">With icon</TBtn>
          <TBtn icon="plus" iconPos="right" variant="go">Icon right</TBtn>
          <TBtn disabled>Disabled</TBtn>
          <TBtn variant="ghost" disabled>Ghost disabled</TBtn>
        </Row>
      </Section>

      <Section title="TPill">
        <Row>
          {(['master','ok','pending','crit','fail','muted','energy','bw'] as const).map(k => (
            <TPill key={k} kind={k}>{k}</TPill>
          ))}
        </Row>
        <Row style={{ marginTop: 10 }}>
          <TPill kind="ok" icon="check">With icon</TPill>
          <TPill kind="pending" icon="clock" bob>Bob animation</TPill>
          <TPill kind="fail" icon="x">Failed</TPill>
        </Row>
      </Section>

      <Section title="TCard">
        <Row>
          <TCard style={{ padding: 20 }}><span style={{ color: 'var(--txt-2)' }}>Default card with shadow</span></TCard>
          <TCard flat style={{ padding: 20 }}><span style={{ color: 'var(--txt-2)' }}>Flat card (no shadow)</span></TCard>
        </Row>
      </Section>

      <Section title="TCallout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
          <TCallout variant="info"><TIcon n="info" s={16} style={{ flexShrink: 0, color: 'var(--bandwidth)' }} /><span>Info callout — informational message</span></TCallout>
          <TCallout variant="warn"><TIcon n="alert" s={16} style={{ flexShrink: 0, color: 'var(--pending)' }} /><span>Warning callout — something to be aware of</span></TCallout>
          <TCallout variant="crit"><TIcon n="alert" s={16} style={{ flexShrink: 0, color: 'var(--fail)' }} /><span>Critical callout — action required</span></TCallout>
        </div>
      </Section>

      <Section title="Toasts">
        <ToastPreviews />
      </Section>

      <Section title="Modal · Sheet">
        <OverlayPreviews />
      </Section>

      <Section title="TAddr · THash · TQR · TSeg · TField · TCountdown">
        <ClientPreviews />
      </Section>
    </main>
  )
}
