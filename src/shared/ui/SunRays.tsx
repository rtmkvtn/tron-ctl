interface SunRaysProps { frozenTrx: number }

const MIN_RAYS = 6
const MAX_RAYS = 16
const RADIUS   = 52
const DASH_W   = 10
const DASH_H   = 22

export function SunRays({ frozenTrx }: SunRaysProps) {
  const scale = Math.min(frozenTrx / 2000, 1)
  const count = Math.round(MIN_RAYS + (MAX_RAYS - MIN_RAYS) * scale)

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 4, pointerEvents: 'none', animation: 'spin 28s linear infinite' }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i
        const rad   = (angle * Math.PI) / 180
        const cx    = Math.cos(rad) * RADIUS
        const cy    = Math.sin(rad) * RADIUS
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: DASH_W,
              height: DASH_H,
              borderRadius: 3,
              background: 'var(--w-amber)',
              border: '2px solid var(--ink)',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px)) rotate(${angle + 90}deg)`,
            }}
          />
        )
      })}
    </div>
  )
}
