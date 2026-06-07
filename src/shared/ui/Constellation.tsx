interface ConstellationProps {
  walletCount: number
  unwindingCount?: number
}

const RINGS = [90, 160, 230]
const OUTER_RING = 300

export function Constellation({ walletCount, unwindingCount = 0 }: ConstellationProps) {
  const regularSlots = Array.from({ length: Math.min(walletCount, 10) }, (_, i) => {
    const ring = RINGS[i % RINGS.length]
    const angle = (360 / Math.max(walletCount, 1)) * i - 90
    const rad = (angle * Math.PI) / 180
    return { x: Math.cos(rad) * ring, y: Math.sin(rad) * ring }
  })

  const unwindingSlots = Array.from({ length: unwindingCount }, (_, i) => {
    const angle = (360 / Math.max(unwindingCount, 1)) * i - 60
    const rad = (angle * Math.PI) / 180
    return { x: Math.cos(rad) * OUTER_RING, y: Math.sin(rad) * OUTER_RING }
  })

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1',
      maxWidth: 680,
      borderRadius: 20,
      background: `radial-gradient(circle at 50% 50%, var(--stage-a), var(--stage-b))`,
      border: '3px solid var(--ink)',
      overflow: 'hidden',
    }}>
      {/* orbit rings */}
      {[...RINGS, OUTER_RING].map(r => (
        <div key={r} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: r * 2, height: r * 2,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          border: '2px dashed rgba(255,255,255,.13)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* master placeholder */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 64, height: 64,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 32%, rgba(143,192,255,.3), rgba(63,125,255,.2))',
        border: '3px dashed rgba(143,192,255,.4)',
        zIndex: 3,
      }} />

      {/* regular wallet slots */}
      {regularSlots.map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          width: 36, height: 36,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.06)',
          border: '2px dashed rgba(255,255,255,.2)',
          zIndex: 2,
        }} />
      ))}

      {/* unwinding wallet slots */}
      {unwindingSlots.map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          width: 32, height: 32,
          borderRadius: 8,
          background: 'rgba(255,138,61,.06)',
          border: '2px dashed rgba(255,138,61,.3)',
          zIndex: 2,
        }} />
      ))}
    </div>
  )
}
