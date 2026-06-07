'use client'

import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

const USDT_LOGO = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='16' fill='%2346d98a'/><text x='16' y='21' text-anchor='middle' font-size='18' font-weight='bold' fill='%230c0e16' font-family='sans-serif'>₮</text></svg>`

interface TQRProps {
  value: string
  size?: number
}

export function TQR({ value, size = 200 }: TQRProps) {
  const ref = useRef<HTMLDivElement>(null)
  const qr = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    qr.current = new QRCodeStyling({
      width: size,
      height: size,
      data: value,
      image: USDT_LOGO,
      dotsOptions: { type: 'rounded', color: '#46d98a' },
      backgroundOptions: { color: '#1d2238' },
      imageOptions: { crossOrigin: 'anonymous', margin: 4 },
      cornersSquareOptions: { type: 'extra-rounded', color: '#46d98a' },
      cornersDotOptions: { color: '#46d98a' },
    })
    if (ref.current) {
      ref.current.innerHTML = ''
      qr.current.append(ref.current)
    }
  }, [value, size])

  return (
    <div
      ref={ref}
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        border: '3px solid var(--ink)',
        overflow: 'hidden',
        boxShadow: 'var(--sh)',
      }}
    />
  )
}
