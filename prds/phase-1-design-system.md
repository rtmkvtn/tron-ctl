# PRD — Phase 1: Design System Port

**Parent plan**: `PLAN.md` § Phase 1  
**Status**: ready to implement  
**Exit criteria**: `pnpm dev` → `/dev/components` renders all component variants and states; visual comparison against `design/usdt-trc20-wallet/project/mobile.html` shows every primitive matches.

---

## Goal

Port the prototype's visual language into production-quality React components living in `src/shared/ui/`. No application logic, no real wallet data — just the design system every subsequent phase builds on top of.

---

## Scope

### In scope

- CSS design tokens ported from `proto.css` into `app/globals.css`
- Fonts: Baloo 2 (UI) + Geist Mono (numbers/addresses/hashes) via `next/font`
- Full `src/shared/ui/` component library (see component list below)
- Framer Motion — entrance + exit animations on Modal, Sheet, and Toasts
- sonner — toast engine with custom-rendered components per kind
- qr-code-styling — real QR codes with USDT logo overlay
- Hand-drawn inline SVG map — 27 icons in a single `TIcon.tsx`
- Responsive shell: `MHeader` (logo + inline nav on desktop) + `MBottomNav` (mobile only, 4 tabs)
- `src/app/providers.tsx` — wraps app with sonner `<Toaster />`
- `/dev/components` page — all variants and states for visual verification

### Out of scope

- Real wallet data (Phase 2)
- Any API calls
- Constellation animated bubbles (shell/rings only in this phase)
- Route-level pages beyond `/dev/components`

---

## Architecture

All components live in `src/shared/ui/` and are exported from a single barrel `src/shared/ui/index.ts`. The Next.js `app/` directory imports from `src/app/providers.tsx` which wraps with sonner. No FSD layers above `shared/` are touched in this phase.

```
src/
├── app/
│   └── providers.tsx               # <Toaster /> + future providers
└── shared/
    └── ui/
        ├── tokens.css              # design token reference (comments only, vars in globals.css)
        ├── TIcon.tsx               # 27-icon inline SVG map
        ├── TBtn.tsx
        ├── TPill.tsx
        ├── TCard.tsx
        ├── TAddr.tsx
        ├── THash.tsx
        ├── TCountdown.tsx
        ├── TQR.tsx
        ├── Modal.tsx
        ├── Sheet.tsx               # slide-in side panel (desktop wallet detail)
        ├── TField.tsx              # label + input wrapper
        ├── TSeg.tsx                # segmented control
        ├── TCallout.tsx            # info / warn / crit callout block
        ├── MHeader.tsx             # app header — logo + desktop nav
        ├── MBottomNav.tsx          # mobile-only bottom tab bar
        ├── SunRays.tsx             # animated spinning rays (master visual)
        ├── Constellation.tsx       # shell: rings + slot layout (no bubbles yet)
        ├── Tube.tsx                # animated coin-travel pipe
        ├── toast.ts                # typed thin wrapper around sonner's toast()
        └── index.ts                # barrel re-export of everything above
app/
├── layout.tsx                      # updated: font vars + <Providers>
└── dev/
    └── components/
        └── page.tsx                # all-states preview
```

---

## Detailed requirements

### CSS tokens (`app/globals.css`)

Port all CSS custom properties from `proto.css` verbatim:

```css
@import "tailwindcss";

:root {
  /* surfaces */
  --bg:        #161a2e;
  --bg-2:      #1d2238;
  --stage-a:   #3a4170;
  --stage-b:   #232843;
  --surf:      #2a2f4a;
  --surf-2:    #323858;
  --surf-3:    #3a4166;
  --ink:       #0c0e16;
  --line:      rgba(255,255,255,.10);

  /* wallet color palette */
  --w-blue:    #5b9bff;
  --w-green:   #46d98a;
  --w-amber:   #ffc24d;
  --w-purple:  #b77fff;
  --w-pink:    #ff7eb3;
  --w-teal:    #3dd6c8;
  --w-coral:   #ff7c5c;
  --w-lime:    #a3e635;
  --w-sky:     #38bdf8;
  --w-rose:    #fb7185;

  /* domain colors */
  --energy:    #ffc24d;
  --bandwidth: #5b9bff;
  --usdt:      #46d98a;

  /* status */
  --ok:        #2fd36e;
  --pending:   #ffb13d;
  --critical:  #ff8a3d;
  --fail:      #ff5d6c;

  /* text levels */
  --txt:       #ffffff;
  --txt-2:     rgba(255,255,255,.74);
  --txt-3:     rgba(255,255,255,.52);
  --txt-faint: rgba(255,255,255,.36);

  /* shadows */
  --sh-sm:  3px 4px 0 rgba(6,8,16,.55);
  --sh:     5px 6px 0 rgba(6,8,16,.55);
  --sh-lg:  8px 11px 0 rgba(6,8,16,.55);
}

/* reduced motion: disable all CSS animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All keyframe animations from `proto.css` (`bob`, `drift`, `spin`, `spawnIn`, `popOut`, `tw`, `pillbob`, `travel`, `fall`, `fade`, `pop`, `slidein`, `dashmove`, `bobY`, `bdot`) are also ported into `globals.css`.

### Fonts (`app/layout.tsx`)

```typescript
import { Baloo_2, Geist_Mono } from 'next/font/google'

const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})
```

Apply both CSS variables to `<html>`. Set `font-family: var(--font-baloo), system-ui, sans-serif` as the base in `globals.css`. Addresses, hashes, and large numbers use `font-family: var(--font-mono)`.

### `TIcon`

Single component with a `paths` lookup object. Each icon is rendered as:

```tsx
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
     stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
  <path d={paths[n]} />
</svg>
```

**Required icon names** (all 27):
`wallet`, `crown`, `key`, `plus`, `archive`, `freeze`, `bolt`, `wave`, `arrowDown`, `arrowUp`, `arrowL`, `chevR`, `check`, `x`, `info`, `alert`, `clock`, `link`, `list`, `layers`, `refresh`, `dl`, `copy`, `eye`, `ext`, `edit`, `send`, `promote`, `box`

Props: `n: IconName`, `s?: number` (size, default 16), `style?: CSSProperties`.

### `TBtn`

Props: `variant?: 'primary' | 'go' | 'ghost' | 'danger'` (default `primary`), `sm?: boolean`, `lg?: boolean`, `icon?: IconName`, `iconPos?: 'left' | 'right'` (default `left`), `disabled?: boolean`, `onClick`, `children`.

Visual behaviour from prototype:
- Hover: `translate(-1px, -1px)`, shadow increases
- Active: `translate(2px, 3px)`, shadow collapses
- Disabled: `opacity: 0.45`, transform locked

### `TPill`

Props: `kind: 'master' | 'ok' | 'pending' | 'crit' | 'fail' | 'muted' | 'energy' | 'bw'`, `icon?: IconName`, `bob?: boolean`.

`bob` applies the `pillbob` CSS animation (2px vertical float loop).

### `TCard`

Props: `children`, `flat?: boolean` (removes shadow for inset contexts), `style?: CSSProperties`, `className?: string`.

Border: `3px solid var(--ink)`. Shadow: `var(--sh)`. Radius: 17px.

### `TAddr` / `THash`

Both accept `value: string`. `TAddr` truncates to `Txxx…xxxx` (first 4 + last 4 chars). `THash` truncates to `xxxx…xxxx`. Both include a copy-to-clipboard button using the `copy` icon that briefly swaps to `check` on success.

### `TCountdown`

Props: `maturesAt: Date`. Ticks every second via `useEffect`/`setInterval`. Displays `Xd Xh Xm Xs` remaining. Text color switches to `var(--critical)` when < 24 hours remain, `var(--fail)` when < 1 hour remain.

### `TQR`

Props: `value: string`, `size?: number` (default 200).

Uses `qr-code-styling` with:
- Dark background (`--bg-2`)
- `--usdt` colored dots
- USDT logo image in the center (inline SVG data URI or public asset)
- `dotsOptions: { type: 'rounded' }`

### `Modal`

Props: `open: boolean`, `onClose: () => void`, `icon?: IconName`, `iconBg?: string`, `title: string`, `sub?: string`, `wide?: boolean`, `children`, `footer?: ReactNode`.

Structure: full-viewport scrim (`backdrop-filter: blur(4px)`) + centered card. Uses Framer Motion `AnimatePresence` for both scrim fade and card `pop` scale animation on enter; reverse on exit.

### `Sheet`

Props: same as Modal except no `wide`. Slides in from the right edge. Uses Framer Motion `AnimatePresence` for `slidein` on enter, reverse slide on exit. Displayed alongside a scrim.

### `TSeg`

Props: `options: { value: string; label: string }[]`, `value: string`, `onChange: (v: string) => void`.

### `TField` / `TInput`

`TField` wraps a label + `TInput` with optional error message. `TInput` matches the prototype's input styling: `var(--surf-2)` background, `3px solid var(--ink)` border, 13px radius.

### `TCallout`

Props: `variant: 'info' | 'warn' | 'crit'`, `children`. Renders the prototype's `tcallout` pattern with left border accent color and icon.

### `toast.ts`

Thin typed wrapper around sonner. Exports:

```typescript
export const toast = {
  info: (msg: string) => sonnerToast(msg, { /* default */ }),
  ok: (msg: string) => sonnerToast(msg, { /* green */ }),
  warn: (msg: string) => sonnerToast(msg, { /* amber */ }),
  fail: (msg: string) => sonnerToast(msg, { /* red */ }),
}
```

Each kind renders a custom component that matches the prototype's toast visual exactly (dark background, thick border, colored left accent, slide-up from bottom).

### `src/app/providers.tsx`

```tsx
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-center" />
    </>
  )
}
```

### `MHeader`

Props: `activeTab: 'wallets' | 'master' | 'operations' | 'archived'`, `onTabChange: (tab) => void`.

- Mobile: logo (`tron-ctl`) + right-side network chip. No nav links (those are in `MBottomNav`).
- Desktop (`md:` breakpoint+): logo on left, inline nav links (Wallets / Master / Operations / Archived) on right. `MBottomNav` is hidden at this breakpoint.

### `MBottomNav`

Props: `activeTab`, `onTabChange`. Hidden at `md:` breakpoint via `md:hidden`. 4 tabs with icons + labels.

### `SunRays`

Props: `frozenTrx: number`. Renders N animated rays radiating from center, ray count and length scaling with `frozenTrx`. CSS `spin` animation (28s linear infinite). Purely presentational — pass `frozenTrx={0}` for a minimal ray set.

### `Constellation`

Shell only. Props: `walletCount: number`, `unwindingCount?: number`.

Renders:
- Full-frame stage with radial gradient background (`--stage-a` → `--stage-b`)
- Dashed concentric orbit rings (`cons-rings` pattern)
- `dashflow` SVG animation on the rings
- Slot positions computed for up to 10 regular wallets evenly distributed on a circle, plus outer ring slots for unwinding wallets
- Slot markers as empty circles (no bubble content — that's Phase 2)
- A placeholder circle in the center for the master sun

### `Tube`

Props: `active: boolean`, `coinCount?: number` (default 3), `duration?: number` (ms per coin, default 1300).

Renders the horizontal pipe with traveling coin tokens. When `active`, coins animate left-to-right with staggered delays using the `travel` CSS animation. When inactive, pipe is empty.

---

## Dependencies to add

```json
{
  "dependencies": {
    "framer-motion": "^11",
    "sonner": "^1",
    "qr-code-styling": "^1"
  }
}
```

---

## `/dev/components` page

Route: `app/dev/components/page.tsx`

Renders a dark-background scrollable page divided into named sections. Each section shows all states of one component:

| Section | States shown |
|---|---|
| **Colors** | All CSS token swatches |
| **Typography** | Baloo 2 weights, Geist Mono |
| **TIcon** | All 27 icons in a grid |
| **TBtn** | All 4 variants × normal / hover-demo / disabled; sm and lg sizes; with icon |
| **TPill** | All 8 kinds; with and without icon; bob animated |
| **TCard** | Default + flat variant |
| **TAddr / THash** | Long address truncated; copy interaction |
| **TCountdown** | Future date (normal), < 24h (orange), < 1h (red) |
| **TQR** | A real TRON address encoded |
| **TSeg** | 3-option segmented control, interactive |
| **TField / TInput** | Normal, focused, error state |
| **TCallout** | info, warn, crit |
| **Modal** | Trigger button → modal opens with animation; close with animation |
| **Sheet** | Trigger button → sheet slides in; close slides out |
| **Toasts** | 4 trigger buttons, one per kind |
| **SunRays** | Static render at frozenTrx=0 and frozenTrx=1000 |
| **Constellation** | Shell with walletCount=5, unwindingCount=1 |
| **Tube** | Active (coins traveling) + inactive side by side |
| **MHeader** | Desktop and mobile renderings |
| **MBottomNav** | All 4 tabs, each active state |

---

## Test strategy

Phase 1 has no business logic — verification is visual.

1. **Visual comparison** — open `/dev/components` and `design/usdt-trc20-wallet/project/mobile.html` side by side; every component must visually match
2. **Responsive check** — resize to mobile (< 768px): `MBottomNav` visible, header nav hidden; resize to desktop: reverse
3. **Animation check** — open Modal, Sheet, Toasts; verify entrance and exit both animate smoothly
4. **Reduced motion** — enable OS reduced-motion setting; all CSS and Framer Motion animations must stop
5. **Font check** — UI text renders in Baloo 2; addresses/hashes render in Geist Mono
6. **Type check** — `pnpm build` passes with zero errors
