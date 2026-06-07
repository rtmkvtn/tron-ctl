import { TIcon } from './TIcon'

type Tab = 'wallets' | 'master' | 'operations' | 'archived'

const TABS: { value: Tab; label: string; icon: Parameters<typeof TIcon>[0]['n'] }[] = [
  { value: 'wallets',    label: 'Wallets',    icon: 'wallet' },
  { value: 'master',     label: 'Master',     icon: 'crown' },
  { value: 'operations', label: 'Operations', icon: 'list' },
  { value: 'archived',   label: 'Archived',   icon: 'archive' },
]

interface MBottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function MBottomNav({ activeTab, onTabChange }: MBottomNavProps) {
  return (
    <nav
      className="md-hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: 'var(--bg-2)',
        borderTop: '3px solid var(--ink)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(t => {
        const active = t.value === activeTab
        return (
          <button
            key={t.value}
            data-active={active ? 'true' : undefined}
            onClick={() => onTabChange(t.value)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              color: active ? 'var(--w-amber)' : 'var(--txt-faint)',
              fontWeight: 700,
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'color .1s',
            }}
          >
            <TIcon n={t.icon} s={20} />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
