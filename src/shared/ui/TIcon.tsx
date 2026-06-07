import type { CSSProperties } from 'react'

export type IconName =
  | 'wallet' | 'crown' | 'key' | 'plus' | 'archive' | 'freeze' | 'bolt' | 'wave'
  | 'arrowDown' | 'arrowUp' | 'arrowL' | 'chevR' | 'check' | 'x' | 'info' | 'alert'
  | 'clock' | 'link' | 'list' | 'layers' | 'refresh' | 'dl' | 'copy' | 'eye'
  | 'ext' | 'edit' | 'send' | 'promote' | 'box'

const paths: Record<IconName, string | string[]> = {
  wallet:    'M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 0V5a2 2 0 0 0-2-2H6L4 7M16 13h.01',
  crown:     'M3 17l3-8 5 5 5-5 3 8H3zM3 17h18',
  key:       'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  plus:      'M12 5v14M5 12h14',
  archive:   'M3 3h18v4H3zM5 7v13h14V7M10 12h4',
  freeze:    'M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93',
  bolt:      'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  wave:      'M2 12c1.5-4 3.5-6 5-6s3.5 4 5 4 3.5-6 5-6 1.5 2 3 4',
  arrowDown: 'M12 5v14m-7-7 7 7 7-7',
  arrowUp:   'M12 19V5m-7 7 7-7 7 7',
  arrowL:    'M19 12H5m7-7-7 7 7 7',
  chevR:     'M9 18l6-6-6-6',
  check:     'M20 6 9 17l-5-5',
  x:         'M18 6 6 18M6 6l12 12',
  info:      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8h.01M12 12v4',
  alert:     'M12 2 2 20h20L12 2zM12 9v4m0 4h.01',
  clock:     'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6V8l3 3',
  link:      'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  list:      'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  layers:    'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  refresh:   'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  dl:        'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  copy:      'M20 9H9a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm10 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z',
  ext:       'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
  edit:      'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  send:      'M22 2 11 13M22 2 15 22 11 13 2 9l20-7z',
  promote:   'M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z',
  box:       'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
}

interface TIconProps {
  n: IconName
  s?: number
  style?: CSSProperties
  className?: string
}

export function TIcon({ n, s = 16, style, className }: TIconProps) {
  const d = paths[n]
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {Array.isArray(d)
        ? d.map((p, i) => <path key={i} d={p} />)
        : <path d={d} />}
    </svg>
  )
}
