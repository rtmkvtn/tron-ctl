interface TubeProps {
  active: boolean
  coinCount?: number
  duration?: number
}

export function Tube({ active, coinCount = 3, duration = 1300 }: TubeProps) {
  return (
    <div style={{
      position: 'relative',
      height: 28,
      borderRadius: 14,
      border: '3px solid var(--ink)',
      background: 'var(--bg-2)',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,.4)',
      width: '100%',
    }}>
      {active && Array.from({ length: coinCount }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: 3,
            transform: 'translateY(-50%)',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%, #ffe39a, var(--w-amber))',
            border: '2.5px solid var(--ink)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 10,
            fontWeight: 800,
            color: 'var(--ink)',
            boxShadow: '1px 1px 0 rgba(6,8,16,.4)',
            animation: `travel ${duration}ms linear ${(i * duration) / coinCount}ms infinite`,
          }}
        >
          ₮
        </div>
      ))}
    </div>
  )
}
