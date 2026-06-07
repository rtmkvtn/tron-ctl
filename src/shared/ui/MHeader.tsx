import { TIcon } from './TIcon'

type Tab = 'wallets' | 'master' | 'operations' | 'archived'

const TABS: { value: Tab; label: string; icon: Parameters<typeof TIcon>[0]['n'] }[] = [
  { value: 'wallets',    label: 'Wallets',    icon: 'wallet' },
  { value: 'master',     label: 'Master',     icon: 'crown' },
  { value: 'operations', label: 'Operations', icon: 'list' },
  { value: 'archived',   label: 'Archived',   icon: 'archive' },
]

interface MHeaderProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function MHeader({ activeTab, onTabChange }: MHeaderProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'var(--bg-2)',
      borderBottom: '3px solid var(--ink)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: 56,
    }}>
      {/* logo */}
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--txt)', fontFamily: 'var(--font-baloo), system-ui' }}>
        tron-ctl
      </span>

      {/* desktop nav — hidden on mobile via CSS (md breakpoint) */}
      <nav style={{ display: 'none' }} className="md-nav">
        {TABS.map(t => (
          <button
            key={t.value}
            data-active={t.value === activeTab ? 'true' : undefined}
            onClick={() => onTabChange(t.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 10,
              border: 'none',
              background: t.value === activeTab ? 'var(--surf)' : 'transparent',
              color: t.value === activeTab ? 'var(--txt)' : 'var(--txt-3)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <TIcon n={t.icon} s={14} />
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
