interface SunRaysProps { frozenTrx: number }

const MIN_RAYS = 6
const MAX_RAYS = 16
const MIN_LEN  = 28
const MAX_LEN  = 64

export function SunRays({ frozenTrx }: SunRaysProps) {
  const scale = Math.min(frozenTrx / 2000, 1)
  const count = Math.round(MIN_RAYS + (MAX_RAYS - MIN_RAYS) * scale)
  const len   = MIN_LEN + (MAX_LEN - MIN_LEN) * scale

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 4, pointerEvents: 'none', animation: 'spin 28s linear infinite' }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: len,
              height: 3,
              borderRadius: 2,
              background: 'linear-gradient(to right, rgba(255,194,77,.7), transparent)',
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 50%',
            }}
          />
        )
      })}
    </div>
  )
}
