export default function Home() {
  const network = process.env.TRON_NETWORK ?? 'unknown'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#e2e8f0',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          tron-ctl
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>Personal USDT TRC20 wallet manager</p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'center',
            padding: '4px 12px',
            borderRadius: 999,
            background: '#1e293b',
            fontSize: 12,
            fontWeight: 600,
            color: '#38bdf8',
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: 8, color: '#22c55e' }}>●</span>
          {network}
        </div>
      </div>
    </main>
  )
}
