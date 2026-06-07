export default function DesignSystemPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-baloo), system-ui', fontSize: 28, fontWeight: 800, color: 'var(--txt)', marginBottom: 8 }}>
        Design System
      </h1>
      <p style={{ color: 'var(--txt-3)', fontSize: 14, marginBottom: 48 }}>
        Component gallery — all variants and states
      </p>
      {/* sections added per issue */}
    </main>
  )
}
