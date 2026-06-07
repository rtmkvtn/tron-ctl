# tron-ctl — USDT TRC20 Wallet Manager — Master Plan

Single-user self-hosted wallet manager for personal USDT/TRC20 operations on TRON.
This document is the canonical source for cutting feature-specific PRDs.

---

## 1. Vision & scope

**What this is.** A self-hosted, single-user web app that lets one technically literate operator (the author) manage their own pool of TRON wallets for USDT/TRC20 inflows and outflows. The app abstracts the TRON resource economy (energy / bandwidth / freezing / delegation) behind a playful "constellation" UI: one **master** wallet (a sun) provides resources to a small fleet of **regular** wallets (planets orbiting it), funding their USDT transfers via on-demand delegation plus TRX top-ups.

**What it isn't.** Not a SaaS. Not multi-tenant. Not a custodial service. Not consumer-facing. No KYC, no compliance surface, no fiat rails, no swap functionality.

**Primary user.** One operator with full VPN access to the host. Treats keys, addresses, hex hashes, freeze cooldowns, and Stake 2.0 mechanics as first-class concepts they already understand.

**Top-line goals.**

1. Manage a small pool of independent TRON wallets (≤ 10 active "regular" wallets, plus a single "master").
2. Fund USDT transfers from regular wallets without keeping TRX on every wallet — master delegates energy/bandwidth on demand and tops up TRX only when delegation can't cover the shortfall.
3. Make freezing / unfreezing / delegating / undelegating master TRX explicit and observable.
4. Let the operator role-swap which wallet is "master" with a sane 14-day unwinding workflow.
5. Soft-delete regulars via auto-sweep so no funds get stranded.

---

## 2. Locked architecture (decided during /grill-me interview)

| Topic | Decision |
|---|---|
| Deployment | Private VPS, behind existing Traefik reverse proxy, Docker-composed alongside other services |
| Reachability | VPN/Traefik perimeter — no public auth, no login screen |
| Backend | Next.js (App Router) + TypeScript |
| Frontend | React 18+ inside Next.js, Server Components where they help |
| Database | PostgreSQL (dedicated container in the compose stack) |
| ORM | Prisma |
| TRON SDK | `tronweb` |
| TRON network | Mainnet **and** Nile/Shasta testnet, switched by `TRON_NETWORK` env var; separate DB per network |
| RPC provider | TronGrid (free tier, API key required for the 100k/day quota) |
| Key storage | Plaintext in DB (Postgres column) — operator-managed backup |
| Wallet generation | Generate-only (no import path); each wallet = fresh random TRON keypair |
| Wallet roles | `master` (singleton), `regular` (≤10 active), `unwinding` (former master in 14-day cooldown), `archived` (soft-deleted, key retained) |
| Send funding | Hybrid: delegate energy/bandwidth from master, TRX top-up for shortfall |
| Bandwidth policy | Same hybrid as energy |
| Delegation lifecycle | Persistent until archive — first send to a regular sets delegation, subsequent sends reuse it, archive triggers undelegate |
| Master switch | Forced clean unwind: undelegate everything → `unfreezeBalanceV2` all of A → 14-day cooldown → user transfers liquid TRX out → A becomes archivable |
| Send UX | Two-step: Preview (compute & show plan) → Confirm (execute) |
| Send orchestration | Server-side multi-step flow streamed to UI via SSE; server completes even if tab closes |
| Restart resilience | `send_operations` table tracks sub-steps + tx hashes; reconciliation on container boot reads in-progress ops, queries chain, marks them complete/failed |
| Deposit detection | Polling-only while tab is open; 15s interval |
| Tx history | DB mirrors chain state for our wallets; catch-up sync on tab-open via TronGrid `/v1/accounts/{addr}/transactions/trc20` |
| Confirmation threshold | 19 blocks (~60s, TRON standard finality) |
| Soft delete | Auto-sweep USDT + dust TRX back to master, then archive (key retained) |
| Backup | Per-wallet "Show private key" reveal; operator's manual responsibility — no auto-export |
| Stake protocol | Stake 2.0 exclusively (`freezeBalanceV2`, `delegateResource`, `undelegateResource`, `unfreezeBalanceV2`, `withdrawExpireUnfreeze`, `cancelUnfreezeBalanceV2`) |
| Wallet metadata | Optional `label` (editable) per wallet, optional `note` per transaction (editable) |
| Logging | pino (structured JSON) |
| Resource price recompute | Per send, at preview time (no cache) |

---

## 3. Visual & interaction design language

The design departed materially from the initial "Linear/sysadmin" brief and committed to a **cartoon constellation** aesthetic. This is canonical; the implementation must match it.

### 3.1 Visual identity

- **Brand**: `tron-ctl` — lowercase, hyphenated, monospaced flavor for code/numbers
- **Font stack**: `Baloo 2` (UI), `Geist Mono` (numbers, addresses, hashes)
- **Borders**: 3px solid `#0c0e16` (`--ink`) on everything, including inputs and small chips
- **Shadows**: hard offset, no blur — `5px 6px 0 rgba(6,8,16,.55)` for cards, `3px 4px 0 …` for small, `8px 11px 0 …` for modals
- **Radii**: 17px cards, 13px buttons, 11–13px chips/pills, 22–26px modals
- **Mood**: playful, dense, vibrant — animated bobs, drifts, twinkles; no minimalism, no flat-design conservatism

### 3.2 Color tokens (from `proto.css`)

```
--bg:        #161a2e   /* app background */
--bg-2:      #1d2238   /* surfaces, header, nav */
--stage-a:   #3a4170   /* constellation stage radial center */
--stage-b:   #232843   /* constellation stage radial outer */
--surf:      #2a2f4a   /* cards */
--surf-2:    #323858   /* button bg, input bg */
--surf-3:    #3a4166   /* segmented bg, scrollbar */
--ink:       #0c0e16   /* all borders, text on bright surfaces */
--line:      rgba(255,255,255,.10)

/* wallet color palette — assigned by index */
--w-blue, --w-green, --w-amber, --w-purple, --w-pink,
--w-teal, --w-coral, --w-lime, --w-sky, --w-rose

/* domain colors */
--energy:    #ffc24d   /* energy resource */
--bandwidth: #5b9bff   /* bandwidth resource */
--usdt:      #46d98a

/* status semantics */
--ok:       #2fd36e   /* success */
--pending:  #ffb13d   /* in-progress */
--critical: #ff8a3d   /* warning, unwinding */
--fail:     #ff5d6c   /* failure, destructive */

/* text levels */
--txt:      #ffffff
--txt-2:    rgba(255,255,255,.74)
--txt-3:    rgba(255,255,255,.52)
--txt-faint:rgba(255,255,255,.36)
```

Master wallet is **always** the blue planet/sun gradient (`radial-gradient(circle at 38% 32%, #8fc0ff, #3f7dff 72%)`). Regular wallets are assigned colors from the palette by their index modulo 10.

### 3.3 Component vocabulary (port targets)

These come from `proto-ui.jsx`/`foundations.jsx` and need direct equivalents:

- `TBtn` — buttons, variants: `primary` (amber), `go` (green), `ghost`, `danger` (red), `sm`/`lg` sizes
- `TPill` — status pills, kinds: `master`, `ok`, `pending`, `crit`, `fail`, `muted`, `energy`, `bw`; optional `bob` animation
- `TIcon` — single icon component with stroke-based glyphs (names: `wallet`, `crown`, `key`, `plus`, `archive`, `freeze`, `bolt`, `wave`, `arrowDown`, `arrowUp`, `arrowL`, `chevR`, `check`, `x`, `info`, `alert`, `clock`, `link`, `list`, `layers`, `refresh`, `dl`, `copy`, `eye`, `ext`, `edit`, `send`, `promote`, `box`)
- `TCard` — primary container with thick border + hard shadow
- `TAddr` / `THash` — monospace address/hash cell with copy button + truncation (`Txxx…xxxx`)
- `TCountdown` — live-ticking countdown to a `maturesAt` timestamp; goes red when < 24h remaining
- `TQR` — placeholder QR rendered as 7×7 grid of black dots
- `Modal` — bottom-sheet on mobile, centered card on desktop; icon + title + sub + body + footer
- `Toasts` — bottom-anchored, slide-up; kinds: default, `ok2` (green), `warn` (amber), `fail` (red)
- `SunRays` — animated emitting rays around the master; ray length/count scale with frozen TRX
- `Constellation` — full-frame stage: dashed concentric rings, master sun in center, wallet bubbles orbiting at varying radii, drifting ex-masters in the outer ring, sparkles
- `Tube` — animated horizontal/vertical pipe with traveling coin tokens during sends

### 3.4 Animations

- `bob` (3.4s ease-in-out infinite) — sun and planets gently bounce vertically
- `drift` (5s) — unwinding wallets drift askew, rotated -5°
- `spawn` (0.6s cubic-bezier with overshoot) — new wallet appears
- `popOut` (0.45s) — wallet disappears (archive)
- `tw` (2.6s) — sparkles twinkle
- `travel` — coins move along tubes during send
- `dashmove` — animated dashed delegation edges
- `fall` (confetti) — on send success
- `spin` — slow rotation of ray emitters
- Honor `prefers-reduced-motion: reduce` → kill animations

### 3.5 Mobile-specific behavior (from `mobile.css`)

- Wrapped in iOS-frame device illustration in the prototype (just chrome; production runs full-viewport)
- 4-tab bottom nav: **Wallets** / **Master** / **Activity** / **Archived**
- Wallets tab has a Map ↔ List **toggle** (segmented control near top)
- Wallet detail = full-screen slide-up sheet
- Modals = bottom sheets (slide up from bottom, rounded top corners, max-height 88%)
- Send flow = vertical-stacked tube animation (master top → wallet middle → destination bottom)
- Active wallet count chip + delegatable energy chip floating on the constellation
- FAB stack bottom-right (withdraw matured + generate wallet)

---

## 4. Domain model

### 4.1 Entities & states

```
Wallet
  status: master | regular | unwinding | archived
  invariants:
    - exactly one wallet has status=master at any time
    - 0..10 wallets have status=regular
    - 0..N wallets have status=unwinding
    - 0..N wallets have status=archived
    - generated keys never deleted from DB (even after archive)
```

State transitions:

```
[nonexistent] --generate--> regular
[nonexistent] --first generate--> master (bootstrap; no master exists yet)

regular --archive--> archived       (sweep USDT + dust TRX → master, then archive)
archived --restore--> regular        (only if active count < 10)

master --promote(other)--> unwinding   (the OLD master demotes; chosen regular ascends)
regular --promote-->  master           (target ascends; previous master enters unwinding)

unwinding --maturity+withdraw--> archivable  (after 14 days + withdrawExpireUnfreeze)
unwinding --(blocked while cooling)--> [no operations allowed]
```

### 4.2 Operations & resource model

A **send** from a regular wallet is the central multi-step operation:

1. **Compute** at preview time:
   - `energy_needed` = chain estimate via `triggerConstantContract` against USDT contract `transfer(to, amount)` (typically ~65,000)
   - `bandwidth_needed` = transaction byte size (~345 bytes)
   - `master.delegatable_energy` = `master.frozenEnergyResource - sum(active delegations to regulars)`
   - `master.delegatable_bw` = analogous
2. **Plan**:
   - `delegate_energy = min(energy_needed, delegatableEnergy)` (user can edit downward in preview)
   - `delegate_bw = min(bandwidth_needed, delegatableBw)`
   - `shortfall_energy = energy_needed - delegate_energy`
   - `shortfall_bw = bandwidth_needed - delegate_bw`
   - `topup_TRX = ceil((shortfall_energy / current_sun_per_energy) + (shortfall_bw / current_sun_per_bandwidth) * 1.05)` (5% buffer)
3. **Execute** sequentially via SSE:
   - If `delegate_energy > 0`: `delegateResource(energyAmount, walletAddress, 'ENERGY')`
   - If `delegate_bw > 0`: `delegateResource(bwAmount, walletAddress, 'BANDWIDTH')`
   - If `topup_TRX > 0`: master sends TRX to wallet
   - Wallet sends USDT: contract.transfer(to, amount)
   - Wait for 19 confirmations on each step
4. **Persist**: write a `SendOperation` row with all sub-step hashes and final status

A **promote** is also a multi-step operation, similar shape:
1. For each active delegation from current master: `undelegateResource`
2. `unfreezeBalanceV2(amount=all_frozen_energy, resource=ENERGY)` on current master
3. `unfreezeBalanceV2(amount=all_frozen_bw, resource=BANDWIDTH)` on current master
4. Mark old master `unwinding` with `maturesAt = now() + 14d`
5. Mark target wallet `master`

A **withdraw matured** = `withdrawExpireUnfreeze()` on master.

A **freeze** = one or two `freezeBalanceV2` calls (energy and/or bandwidth amounts).

A **cancel unfreeze** = `cancelUnfreezeBalanceV2(amount, resource)` — re-freezes a pending unfreeze before it matures.

An **archive** = sweep tx (USDT contract.transfer to master) + optional dust TRX transfer + undelegate any active delegations + mark archived.

---

## 5. Database schema (Prisma)

This is the locked-in shape. Fields may evolve with implementation, but the entity boundaries should not.

```prisma
// schema.prisma — sketch (per network DB; PRISMA_DATABASE_URL set from TRON_NETWORK)

model Wallet {
  id              String        @id @default(cuid())
  label           String?
  address         String        @unique
  privateKey      String        // plaintext (locked design decision)
  status          WalletStatus  // master | regular | unwinding | archived
  colorIndex      Int           // 0..9, for palette assignment
  createdAt       DateTime      @default(now())
  archivedAt      DateTime?
  lastBalanceUsdt Decimal?      // snapshot at archive time (for archived view)

  // unwinding-specific
  unwindingStartedAt DateTime?
  maturesAt          DateTime?
  lockedTrx          Decimal?

  txs               Transaction[]
  sendOps           SendOperation[] @relation("FromWallet")
  delegationsIn     Delegation[]    @relation("DelegationToWallet")
}

enum WalletStatus { MASTER REGULAR UNWINDING ARCHIVED }

model Transaction {
  id          String          @id @default(cuid())
  walletId    String
  wallet      Wallet          @relation(fields: [walletId], references: [id])
  hash        String          @unique
  kind        TxKind
  amount      Decimal
  asset       Asset           // USDT | TRX | ENERGY | BANDWIDTH
  note        String?         // user-editable
  blockNum    BigInt?
  blockTime   DateTime?
  status      TxStatus        // PENDING | CONFIRMED | FAILED | REORGED
  rawJson     Json?           // full chain payload for debugging
  createdAt   DateTime        @default(now())
}

enum TxKind { IN OUT FREEZE UNFREEZE DELEGATE UNDELEGATE WITHDRAW CANCEL_UNFREEZE PROMOTE }
enum Asset { USDT TRX ENERGY BANDWIDTH }
enum TxStatus { PENDING CONFIRMED FAILED REORGED }

model SendOperation {
  id             String       @id @default(cuid())
  fromWalletId   String
  fromWallet     Wallet       @relation("FromWallet", fields: [fromWalletId], references: [id])
  toAddress      String
  amountUsdt     Decimal
  note           String?
  status         OpStatus     // PENDING | DELEGATE_PENDING | DELEGATE_CONFIRMED | BW_DELEGATE_PENDING | BW_DELEGATE_CONFIRMED | TOPUP_PENDING | TOPUP_CONFIRMED | USDT_BROADCASTING | USDT_CONFIRMING | SUCCEEDED | FAILED
  failureReason  String?
  failedAt       String?      // step name where it failed

  // planned amounts
  plannedEnergy  Int          // amount of energy planned to delegate
  plannedBw      Int          // amount of bandwidth planned to delegate
  plannedTopup   Decimal      // TRX top-up planned

  // sub-step tx hashes (filled as each completes)
  delegateEnergyHash String?
  delegateBwHash     String?
  topupHash          String?
  usdtHash           String?

  confirmations  Int          @default(0)
  costToMaster   Decimal?     // final accounting

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  completedAt    DateTime?
}

enum OpStatus {
  PENDING
  DELEGATE_PENDING DELEGATE_CONFIRMED
  BW_DELEGATE_PENDING BW_DELEGATE_CONFIRMED
  TOPUP_PENDING TOPUP_CONFIRMED
  USDT_BROADCASTING USDT_CONFIRMING
  SUCCEEDED FAILED
}

model Delegation {
  id             String   @id @default(cuid())
  toWalletId     String
  toWallet       Wallet   @relation("DelegationToWallet", fields: [toWalletId], references: [id])
  energyAmount   Decimal  // in sun-equivalent (frozen TRX worth of energy)
  bwAmount       Decimal
  createdAt      DateTime @default(now())
  // delegation is the source-of-truth for "how much master has delegated where"
  // master is always the implicit "from" side, no need to model that explicitly
}

model UnfreezeRecord {
  id           String   @id @default(cuid())
  walletId     String   // the master that initiated; could be unwinding wallet too
  amount       Decimal  // TRX amount
  resource     Resource // ENERGY | BANDWIDTH
  startedAt    DateTime @default(now())
  maturesAt    DateTime // startedAt + 14d
  withdrawnAt  DateTime?
  cancelledAt  DateTime?
  hash         String   @unique  // the unfreezeBalanceV2 tx hash
}

enum Resource { ENERGY BANDWIDTH }

model MasterState {
  // singleton: id == 'singleton'
  id                   String   @id @default("singleton")
  liquidTrx            Decimal  // last-known on-chain TRX balance
  frozenEnergyTrx      Decimal  // sum of frozenBalanceV2 ENERGY entries
  frozenBwTrx          Decimal  // sum of frozenBalanceV2 BANDWIDTH entries
  delegatedEnergyOut   Decimal  // cached aggregate of Delegation.energyAmount
  delegatedBwOut       Decimal
  maturedTrx           Decimal  // sum of UnfreezeRecord.amount where maturesAt < now() && withdrawnAt is null
  lastSyncedAt         DateTime?
}

model SystemConfig {
  key   String @id
  value String
}
// keys: "lastSeenBlock", "trongridApiKey", "tronNetwork", ...
```

Migrations and indices to be added during implementation. Mainnet and testnet use **separate Postgres databases** (different `DATABASE_URL` per `TRON_NETWORK`).

---

## 6. TRON network layer

### 6.1 SDK wrapper module (`lib/tron/*`)

A thin internal API over `tronweb`, organized by concern:

- `lib/tron/client.ts` — singleton `TronWeb` instance, configured from env (`TRON_NETWORK`, `TRONGRID_API_KEY`, USDT contract address per network).
- `lib/tron/keys.ts` — `generateKeypair()` returning `{ privateKey, address }`; address derivation.
- `lib/tron/balances.ts` — `getTrxBalance(addr)`, `getUsdtBalance(addr)`, `getAccountResources(addr)` (returns energy/bandwidth used/available).
- `lib/tron/freeze.ts` — `freeze(masterKey, amount, resource)` → `freezeBalanceV2`. `unfreeze(masterKey, amount, resource)` → `unfreezeBalanceV2`. `cancelUnfreeze(masterKey, amount, resource)`. `withdrawMatured(masterKey)`.
- `lib/tron/delegate.ts` — `delegate(masterKey, amount, toAddress, resource)`. `undelegate(masterKey, amount, toAddress, resource)`. `getDelegated(masterAddr, toAddr)` — read-back.
- `lib/tron/usdt.ts` — `sendUsdt(fromKey, toAddress, amount)`. `estimateUsdtEnergy(fromAddr, toAddress, amount)` via `triggerConstantContract`.
- `lib/tron/pricing.ts` — `getCurrentSunPerEnergy()`, `getCurrentSunPerBandwidth()` from chain params endpoint.
- `lib/tron/confirmations.ts` — `waitForConfirmations(hash, n=19)` polling helper used by the orchestrator.
- `lib/tron/history.ts` — `getTrc20Transfers(addr, sinceBlock)` for the polling/catch-up reader.

### 6.2 USDT contract addresses

- Mainnet: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- Nile (testnet): `TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf` (verify before use)
- Shasta (testnet): `TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs` (verify before use)

Stored as `USDT_CONTRACT` env var per network.

### 6.3 Network access

- Single `TronWeb` instance per process, with `headers: { 'TRON-PRO-API-KEY': ... }`.
- Rate-limit awareness: 15 QPS / 100k req/day on TronGrid free tier; the polling loop must cap at ~20 req/min for headroom.
- All read paths cached for ≤ 5s where it makes sense (resource pricing, account state) to avoid bursts during preview re-renders.

---

## 7. Application screens

The mobile design (`mobile.html`) is the **primary target**. Desktop layouts exist (`index.html`/`prototype.html`) but mobile is build-first.

### 7.1 Shell

- **Top header**: brand mark, network indicator (`mainnet · vps` / `nile · vps`), reset chip (dev only).
- **Bottom nav** (4 tabs):
  - `Wallets` — dashboard (Map / List)
  - `Master` — master ops console
  - `Activity` — operations log (sends)
  - `Archived` — archived wallets list (badge with count)

### 7.2 Wallets tab — Map mode

- Full-frame constellation:
  - Master = blue glowing sun in center (210×210 desktop, ~140 mobile), with animated rays whose count/length scale with frozen TRX
  - Regular wallets = colored bubbles arranged in 2 concentric rings (4 inner + 6 outer, max 10), each with: label, USDT balance, optional delegation badge (`⚡ 65k`, `bw 600`)
  - Idle wallets (no recent activity in 24h) shown desaturated
  - Active delegations rendered as dashed flowing lines (master → bubble)
  - Unwinding ex-masters drift in the outer ring, rotated -5°, dim
  - Generate-bubble = dashed-outlined slot inviting new wallet
  - Sparkles scattered for atmosphere
- Floating overlays (mobile):
  - Bottom-left: `Wallets X/10` pill + `Delegatable ⚡ Yk` pill
  - Bottom-right FAB stack: `Withdraw matured` (only when `master.matured > 0`) + `Generate wallet`
- Tap a bubble → opens `WalletSheet`
- Tap an ex-master → opens `UnwindModal`
- Tap generate-bubble → opens `GenerateModal`

### 7.3 Wallets tab — List mode

Top-down stack:
- **Master hero card**: blue gradient header strip, MASTER pill (bob), master label, address, two-cell stat row (Delegatable ⚡, Liquid TRX), green "matured TRX ready to withdraw" callout if `matured > 0`. Tap → switches to Master tab.
- **Stat grid**: `USDT held` (sum across regulars), `Delegated ⚡` (with edge count)
- **Section header**: `REGULAR WALLETS · X/10` (amber, uppercase)
- **Wallet cards**: each = colored card with wallet icon + label + USDT balance + mini-pill chips for energy/bw delegation. Tap → opens `WalletSheet`.
- **Generate card**: dashed dotted CTA; if at cap, becomes "At cap — archive one first" with alert icon
- **Unwinding section** (if any): critical-orange section title, drift-styled cards with locked TRX + countdown timer. Tap → `UnwindModal`.
- **Archived link**: `View N archived wallets →` (sky blue). Tap → switches to Archived tab.

### 7.4 Master tab

Heavy ops console. Sections from top:

- **Page header**: MASTER pill, master label as H1, address with copy. Right: `Promote different wallet` button (danger style).
- **Top stat row** (3 cards): Liquid TRX, Frozen TRX with stacked bar (energy / bw), Delegatable/Edges grid.
- **Left column**:
  - `Active delegations` table — rows per regular wallet receiving resources, with `Undelegate` action per row
  - `Transaction history` — master's own actions (freezes, unfreezes, withdraws, delegate/undelegate, incoming TRX) with timestamp + hash
- **Right column**:
  - `Freeze TRX` card with animated mini-sun preview that grows rays as you type amounts. Two amount fields (Energy / Bandwidth). Submit opens confirmation modal that runs 1 or 2 `freezeBalanceV2` calls.
  - `Matured TRX ready` callout (green) if `master.matured > 0` → `Withdraw` button
  - `Pending unfreezes` table with amount, resource pill, live countdown, and `Cancel` action

### 7.5 Activity tab (Operations log)

- Page header: H1 "Operations", subtitle
- Filter segment: All / Succeeded / Failed (counts shown)
- Three summary cards: Succeeded count, Failed count, Total volume USDT
- Table: Status pill (with bob if in-progress), Wallet, Amount, To (truncated), Detail/reason, When (relative time). Tap row → `OpDetail` modal.
- `OpDetail` modal shows the **full pipeline** for that send:
  - Step 1: Delegate energy + bw (✓/✗/skip/wait)
  - Step 2: Top-up TRX (skipped if delegation covered, otherwise ✓/✗)
  - Step 3: USDT transfer (✓/✗ with N/19 confirmations)
  - Each step shows its hash if successful
  - Total cost to master at bottom
  - For failures: callout explaining failed-at + reason

### 7.6 Archived tab

- Page header: H1 "Archived wallets", subtitle, `N archived · M/10 active` chip
- Table: label (with `archived` muted pill), truncated address, last balance USDT, archived date, actions per row:
  - `Key` toggle — reveals private key inline below the row
  - `Restore` — disabled if active count == 10

### 7.7 Wallet detail sheet (slide-up)

Opened from any regular wallet card or bubble.

- Sheet header: colored icon + label (editable inline with pencil) + Active pill + generated date + tx count + close button
- Balance card: QR placeholder + USDT balance (large mono) + full address with copy
- Button row: `Send USDT` (primary) / `Show key` / `Archive` (danger)
- `Resources from master` card (energy-orange-bordered): energy + bw delegated stats with swatches, info callout "Delegated from <master> — not this wallet's to control", "Managed on master →" link
- Private key reveal block (visible only when toggled): monospace key, Copy / Hide buttons. Warning shown.
- Transaction history table: type icon (in/out), amount with color, note (or "+ add note" prompt that opens prompt), tx hash

### 7.8 Send flow (full-screen)

Multi-step, animated. Step 0 → 1 → 2 → 3.

- **Top bar**: brand + step indicator (Compose → Preview → Send) + close
- **Step 0 — Compose** (card):
  - From (read-only, shows wallet + balance)
  - To address (text input, validates TRON address format `^T[1-9A-HJ-NP-Za-km-z]{33}$` and base58 checksum, shows green/red note inline)
  - Amount (numeric, with MAX button, error if exceeds balance)
  - Note (optional textarea)
  - Cancel / `Preview →`
- **Step 1 — Preview** (card):
  - Two stat tiles: Energy needed + master delegatable, Bandwidth needed + master delegatable
  - KV row: `Delegate from master · editable` with stepper UI (− / amount / +)
  - KV row: `TRX top-up to this wallet · covers shortfall` (shows "none — fully delegated" if 0)
  - KV row: `Network fee (bandwidth)` ~X TRX
  - KV row (emphasized): **Total cost to master**
  - Info callout: "Runs 2 or 3 transactions: delegate → [top-up →] USDT transfer. The operation keeps running on the server even if you close this tab."
  - `← Back` / `Confirm & send` (green)
- **Step 2 — In flight** (animated scene):
  - Phase headline: "Delegating resources… / Topping up TRX… / Sending USDT…"
  - Confirmation counter when in transfer phase: "N / 19"
  - Animated tube scene:
    - Mobile: vertical — master (sun) top, wallet (box) middle, destination (box) bottom; tubes A & B connect them; coins travel through active tube
    - Desktop: horizontal — master left, wallet center, dest right
  - Pile of "saved" coins accumulate at wallet (post-delegate) and dest (post-transfer)
  - Below: 3 pipeline steps with active/done states (icon, label, meta)
  - Info callout: "This operation continues on the server if you close this tab."
- **Step 3 — Done**:
  - Confetti burst (~70 pieces)
  - Big green checkmark
  - "Sent! 🎉" + "19/19 confirmations · X USDT delivered"
  - KV summary card: Amount / To / USDT tx hash / Cost to master
  - Buttons: `View on Tronscan` (external link) / `Done`

### 7.9 Modals

All bottom-sheet on mobile, centered card on desktop.

- **Generate modal**:
  - If at cap (10/10): `At capacity` warning, no form
  - Otherwise: optional label input → Generate
  - After generation: **result screen** showing label, address (with copy), private key (in red-bordered key box, shown once), Copy / Download buttons, warning callout, mandatory checkbox "I've saved this private key somewhere safe", `Continue` button (disabled until checkbox)
- **Promote modal**: critical-themed. Warning callout: "<master> will detach, drift out, and lock X TRX for 14 days. Its delegations end." List of candidate wallets (regulars only) with selectable rows. `Promote & begin cooldown` button (danger).
- **Archive modal**: critical-themed. "Sweeps remaining X USDT + dust TRX to master, ends its delegations, then pops the bubble out of orbit." `Sweep & archive` (danger).
- **Unwind modal** (clicked an unwinding wallet): shows address, locked TRX, matures-in countdown with seconds, info callout. `Withdraw matured TRX` button (disabled until countdown reaches zero).
- **Withdraw matured modal**: confirm withdrawing matured TRX into master's liquid balance.
- **Freeze confirm modal**: shown after clicking "Freeze X TRX" on master tab. Per-resource breakdown, info callout about Stake 2.0 and 14-day cooldown.

### 7.10 Toasts

- Bottom-anchored (above bottom nav on mobile, above viewport bottom on desktop)
- Kinds: default (gray), `ok2` (green), `warn` (amber), `fail` (red)
- 3.2s auto-dismiss
- Slide-up animation with overshoot
- Examples: "Wallet added to orbit ✨", "Froze 2,500 TRX — rays grew ✨", "Sent 12,500 USDT", "vendor-pool swept to master & archived"

---

## 8. State management

### 8.1 Client state

- React Context + `useReducer` per the prototype's `proto-store.jsx` shape, **but moved to TanStack Query** for server-state hydration in the real app.
- Source of truth = Postgres; client state = TanStack Query cache hydrated from API routes.
- Optimistic updates for label edits and tx notes. Pessimistic for everything involving chain ops.

### 8.2 Server-side derived state

- `MasterState` table is a denormalized cache, updated by:
  - The polling loop (when tab is open)
  - The send orchestrator (after each sub-step)
  - The reconciliation routine on container boot
- Always re-derivable from `Wallet`s + `Delegation`s + `UnfreezeRecord`s — never the only source of truth.

### 8.3 SSE streams

- `POST /api/operations/send` kicks off a send. Returns `{ operationId }`.
- `GET /api/operations/{id}/stream` is an SSE endpoint emitting events:
  - `{ event: 'phase.changed', phase: 'delegate'|'topup'|'usdt'|'confirming'|'done' }`
  - `{ event: 'tx.broadcast', hash }`
  - `{ event: 'tx.confirmation', n, of: 19 }`
  - `{ event: 'tx.confirmed', hash }`
  - `{ event: 'op.succeeded' }`
  - `{ event: 'op.failed', step, reason }`
- The orchestrator function on the server runs independently of the SSE connection: closing the tab does not stop it; reopening attaches to the same operation by id and resumes the stream from current state.

---

## 9. Background work

### 9.1 Polling loop (client-driven, tab-open only)

- Started by the dashboard when the Wallets tab mounts.
- Every 15s: hits `GET /api/balances?wallets=ids` which queries TronGrid for current balances and recent tx, writes deltas to DB, returns refreshed snapshot.
- Stopped on tab visibilitychange to `hidden`.

### 9.2 Catch-up sync (tab-open trigger)

- On tab focus (or first mount), client calls `GET /api/sync` which:
  1. Reads `SystemConfig['lastSeenBlock']`
  2. For each wallet (master + regulars): queries TronGrid `/v1/accounts/{addr}/transactions/trc20?min_timestamp=...`
  3. Persists new transactions in `Transaction` table (idempotent on hash)
  4. Updates balances
  5. Updates `lastSeenBlock`
  6. Returns refreshed state

### 9.3 Reconciliation on boot

Container start sequence:

1. Prisma migrate deploy
2. Run reconciliation:
   - For each `SendOperation` not in `{SUCCEEDED, FAILED}`: query chain for each sub-step hash; update status accordingly. If a sub-step never broadcast, mark `FAILED`.
   - For each `UnfreezeRecord` not yet `withdrawnAt` whose `maturesAt < now()`: surface as matured (UI computes from data, no automatic withdrawal — withdrawal is a user action).
3. Start the Next.js server.

### 9.4 Operation orchestrator

A long-running async function (per operation) invoked from the SSE endpoint. State machine:

```
PENDING
  → broadcast delegateResource(ENERGY) → DELEGATE_PENDING
    → wait 19 conf → DELEGATE_CONFIRMED
  → (if delegating bw) broadcast delegateResource(BANDWIDTH) → BW_DELEGATE_PENDING → BW_DELEGATE_CONFIRMED
  → (if topup needed) broadcast TRX transfer → TOPUP_PENDING → TOPUP_CONFIRMED
  → broadcast USDT contract.transfer → USDT_BROADCASTING → USDT_CONFIRMING (n/19) → SUCCEEDED
  
On any broadcast error / failed confirmation: → FAILED (set failureReason + failedAt)
```

The orchestrator writes to `SendOperation` after every state change, so the SSE consumer (and any new attacher) can render current state from the row alone.

---

## 10. API surface (Next.js route handlers)

| Method + Path | Purpose |
|---|---|
| `POST /api/wallets/generate` | Create a new wallet (regular by default; first call creates master if none exists) |
| `GET /api/wallets` | List all wallets with current state |
| `GET /api/wallets/{id}` | Full detail + tx history |
| `PATCH /api/wallets/{id}` | Update label |
| `POST /api/wallets/{id}/archive` | Soft-delete with sweep |
| `POST /api/wallets/{id}/restore` | Move archived → regular (if under cap) |
| `POST /api/wallets/{id}/promote` | Promote regular → master (initiates unwinding flow) |
| `GET /api/wallets/{id}/key` | Reveal private key (logged for audit) |
| `GET /api/master` | Master snapshot (frozen, delegated, matured, pending unfreezes) |
| `POST /api/master/freeze` | Freeze TRX (one or two `freezeBalanceV2` calls) |
| `POST /api/master/unfreeze` | Start unfreeze cooldown |
| `POST /api/master/cancel-unfreeze/{recordId}` | Cancel pending unfreeze |
| `POST /api/master/withdraw-matured` | Withdraw matured TRX to liquid |
| `POST /api/master/undelegate/{walletId}` | Undelegate from a regular wallet |
| `POST /api/operations/send` | Plan + start a send; returns `{ operationId, plan }` |
| `POST /api/operations/send/preview` | Compute the plan only (no execution) |
| `GET /api/operations/{id}/stream` | SSE stream of operation progress |
| `GET /api/operations` | List recent operations (filterable by status) |
| `GET /api/operations/{id}` | Single operation detail |
| `PATCH /api/transactions/{id}` | Update note |
| `GET /api/balances` | Refresh balances for given wallet ids (used by polling) |
| `GET /api/sync` | Catch-up sync entrypoint |
| `GET /api/network` | Current network + RPC health |

All endpoints return JSON. No auth, no rate-limiting at app level (VPN perimeter).

---

## 11. Deployment & operational concerns

### 11.1 Containers

```yaml
# docker-compose.yml — sketch, lives alongside existing Traefik
services:
  tron-ctl:
    build: .
    environment:
      - DATABASE_URL=postgres://tron:secret@tron-ctl-db:5432/tron_ctl_${TRON_NETWORK}
      - TRON_NETWORK=mainnet
      - TRONGRID_API_KEY=${TRONGRID_API_KEY}
      - USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
      - LOG_LEVEL=info
    volumes: []  # stateless; all state in Postgres
    networks: [traefik, internal]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tron-ctl.rule=Host(`wallet.example.dev`)"
      - "traefik.http.services.tron-ctl.loadbalancer.server.port=3000"
  tron-ctl-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: tron
      POSTGRES_PASSWORD: secret  # via .env / secrets in real life
      POSTGRES_DB: tron_ctl_mainnet
    volumes:
      - tron-ctl-pgdata:/var/lib/postgresql/data
    networks: [internal]
networks:
  traefik: { external: true }
  internal: {}
volumes:
  tron-ctl-pgdata:
```

### 11.2 Dockerfile

- Multi-stage: deps → build (Prisma generate + Next.js build with standalone output) → runtime (Node 22 alpine, ~150MB)
- `pnpm` for install
- `prisma migrate deploy` on container start, before `node server.js`

### 11.3 Env vars

| Var | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | Postgres connection | yes |
| `TRON_NETWORK` | `mainnet` / `nile` / `shasta` | yes |
| `TRONGRID_API_KEY` | TronGrid API key | yes |
| `USDT_CONTRACT` | USDT TRC20 contract per network | yes (network-specific) |
| `LOG_LEVEL` | pino level | no (default: `info`) |
| `RECONCILIATION_ON_BOOT` | `1`/`0` | no (default: `1`) |

### 11.4 Backups

**Not automated.** Per locked decision: user clicks "Show private key" per wallet and saves it themselves. To support that ergonomically:

- Postgres volume snapshots are the operator's responsibility (e.g., `pg_dump` via cron, sent to off-box storage).
- Every wallet has a "Show private key" button that displays + offers Copy + Download (download = single-key plain text file).
- No bulk export endpoint planned.

### 11.5 Logging

- pino JSON to stdout, captured by Docker logging driver.
- Log every chain tx broadcast (level=info) and every error (level=error) with operation context.
- Never log private keys, full mnemonics, or full raw transactions containing signatures.

### 11.6 Observability

- Manual: `docker logs tron-ctl`, Postgres queries, Tronscan for chain state.
- No Prometheus / Grafana / OpenTelemetry. Defer until pain is felt.

---

## 12. Delivery plan — phases

Each phase is intended to be cuttable as a separate PRD. Phases are ordered to ship something runnable as early as possible and add capability outward.

### Phase 0 — Foundation (scaffolding)

**Goal**: empty repo → boots to a blank Next.js page in Docker behind Traefik.

- Initialize Next.js 15 App Router + TypeScript with `pnpm`
- Tailwind 4 + design tokens from `proto.css` (CSS variables + utilities)
- Prisma + Postgres scaffold (no migrations yet)
- Docker compose + Dockerfile
- Traefik labels
- pino logger
- `TRON_NETWORK` env var read at startup; log it
- Healthcheck endpoint `/api/health`

**Exit criteria**: `docker compose up` → `https://wallet.example.dev/` loads, returns 200, logs network name.

### Phase 1 — Design system port

**Goal**: visual primitives match the prototype, in production-quality React components.

- Port color tokens, font imports (Baloo 2, Geist Mono)
- Build `<TBtn>`, `<TPill>`, `<TIcon>` (SVG sprite or component), `<TCard>`, `<TAddr>`, `<THash>`, `<TCountdown>`, `<TQR>`, `<Modal>`, `<Toasts>`, `<TSeg>`, `<TField>` + `<TInput>`
- Build mobile shell: `<MHeader>`, `<MBottomNav>`, scrollable body
- Storybook-style preview page (`/dev/components`) for visual diffing against prototype
- Honor `prefers-reduced-motion`

**Exit criteria**: visit `/dev/components`, side-by-side with `mobile.html` prototype, every primitive matches.

### Phase 2 — Database & wallet generation (no chain yet)

**Goal**: generate, label, archive, restore wallets — purely DB-side.

- Prisma schema migrations (Phase 5 schema, but no chain interactions yet)
- `lib/tron/keys.ts` — deterministic local keypair generation (uses tronweb's address derivation but no RPC calls)
- Routes: `POST /api/wallets/generate`, `GET /api/wallets`, `GET /api/wallets/{id}`, `PATCH /api/wallets/{id}`, `POST /api/wallets/{id}/archive`, `POST /api/wallets/{id}/restore`
- Wallets-tab List view rendering real DB state (USDT balances stub at 0 until Phase 4)
- Generate modal + Archive modal + key reveal
- Wallet detail sheet (without resources card or tx history yet)

**Exit criteria**: can generate up to 10 regular wallets + 1 master, label them, archive, restore. Refresh = same state. No chain interactions yet.

### Phase 3 — TRON read layer (balances, resources, history)

**Goal**: real balances and tx history mirrored into DB.

- `lib/tron/client.ts` + TronGrid wiring (API key)
- `lib/tron/balances.ts` (TRX balance, USDT balance, account resources)
- `lib/tron/history.ts` (TRC20 transfer fetch with pagination + idempotent persist)
- `GET /api/balances` and `GET /api/sync`
- Client-side polling loop (15s while Wallets tab visible)
- Catch-up sync on tab focus
- Wallet detail sheet: real balances + tx history table + note editing
- Master tab read-only: liquid TRX, frozen TRX (from chain), delegatable energy/bw (computed)

**Exit criteria**: generate master, fund it externally with testnet TRX, see balance reflected in UI within 15s. Send testnet USDT to a regular wallet, see it appear in history.

### Phase 4 — Freeze / unfreeze / withdraw

**Goal**: master can stake TRX into resources.

- `lib/tron/freeze.ts` (all five Stake 2.0 freeze ops)
- Routes: `POST /api/master/freeze`, `POST /api/master/unfreeze`, `POST /api/master/cancel-unfreeze/{id}`, `POST /api/master/withdraw-matured`
- `UnfreezeRecord` lifecycle (insert on unfreeze, mark withdrawn on withdraw, mark cancelled on cancel)
- Master tab interactive: Freeze form with animated mini-sun preview + confirm modal, pending unfreezes table with live countdowns + Cancel, matured callout + Withdraw
- Toasts on success

**Exit criteria**: on testnet — freeze 100 TRX for energy, see frozen+delegatable energy update. Start unfreeze, see pending row + countdown. Cancel pending, see refrozen. Start another, wait for maturity (use Nile testnet's 14-day still — or short-circuit with chain time fast-forward if Nile supports), withdraw, see liquid TRX update.

### Phase 5 — Delegation lifecycle (manual)

**Goal**: manually delegate / undelegate from master to a regular.

- `lib/tron/delegate.ts`
- `Delegation` table maintained
- Routes: `POST /api/master/undelegate/{walletId}` (used after Phase 6 too)
- Master tab: Active delegations table with Undelegate per row
- Wallet detail sheet: "Resources from master" card

**Exit criteria**: on testnet — manually delegate 50k energy from master to a regular, see it reflected on both sides; undelegate, see it gone.

### Phase 6 — Send flow (the core feature)

**Goal**: end-to-end send USDT from a regular wallet with the hybrid funding policy and SSE-streamed progress UI.

- `lib/tron/usdt.ts` + energy estimation
- `lib/tron/pricing.ts`
- Operation orchestrator state machine
- Routes: `POST /api/operations/send/preview`, `POST /api/operations/send`, `GET /api/operations/{id}/stream` (SSE), `GET /api/operations`, `GET /api/operations/{id}`
- Send flow UI (full-screen multi-step with the cartoon tube animation)
- Activity tab: operations list + filter + detail modal

**Exit criteria**: on testnet — initiate a send from a partially-funded regular wallet, watch the SSE stream advance through delegate → top-up → USDT transfer → 19 confirmations → success state with confetti. Close tab mid-flight, reopen Activity tab, see the same operation continue. Force-restart container mid-flight, on boot see reconciliation detect partial state and mark op accordingly.

### Phase 7 — Constellation Map view

**Goal**: the playful planet-and-sun map view of the dashboard.

- `<Constellation>` component:
  - Sun in center with rays scaled by frozen TRX
  - Bubbles arranged in 2 concentric rings (inner ring r=180, outer r=260 ish — tune by device)
  - Each bubble colored by `colorIndex`, shows label + balance + delegation chips
  - Dashed flowing edges from master to delegated regulars
  - Drifting ex-masters at outermost ring
  - Sparkle decorations
  - `spawn` animation on new wallet
  - `popOut` animation on archive
  - Idle saturation for stale wallets
- Map/List segmented toggle
- FAB stack (Generate + Withdraw)
- Floating stat pills (Wallets X/10, Delegatable ⚡)

**Exit criteria**: visually matches the prototype's Map view within reasonable tolerance. Tapping bubbles, ex-masters, and the generate-bubble works.

### Phase 8 — Promotion / unwinding workflow

**Goal**: switch master role with clean unwinding.

- Promote modal with candidate list
- Promote orchestrator (multi-step, like send): undelegate-all → unfreeze-all-energy → unfreeze-all-bw → mark wallets
- Unwinding tab/section rendering — locked TRX, countdown
- Unwind modal with locked Withdraw until matured
- `POST /api/wallets/{id}/promote`

**Exit criteria**: on testnet — promote a regular, watch the orchestrator run, see old master enter unwinding with a 14-day countdown, see new master enter master role. Withdraw matured (after waiting / fast-forward), see wallet retirable.

### Phase 9 — Polish & resilience

**Goal**: tighten the edges.

- Confetti, sparkles, all the animations
- Toast nuance + reduced-motion fallbacks
- Tronscan deep links from every hash
- Idle-wallet saturation
- Error states across all flows (TronGrid down, insufficient TRX, contract revert, etc.)
- Loading skeletons
- Empty states
- Network indicator in header
- Reset (dev only) wired up

### Phase 10 — Operations

**Goal**: production-ready ops.

- Health check beyond `200 OK`: returns network, last block seen, DB connectivity, TronGrid reachability
- Structured logs around every chain call with operation id correlation
- Defensive coding against TronGrid rate-limiting (exponential backoff, jitter)
- Documentation: `README.md` for the repo, `.env.example`, deployment runbook
- Migration to a real (separate) Postgres if shared infra is preferred

### Phase 11 — CI/CD pipeline

**Goal**: automated build → push → deploy, matching the oil-payments infra pattern.

- GitHub Actions workflow: on push to `main` → build Docker image → push to `ghcr.io/rtmkvtn/tron-ctl:latest`
- `docker-compose.yml` updated to use `image: ghcr.io/rtmkvtn/tron-ctl:latest` instead of `build: .`
- Deploy step: SSH to VPS → `docker compose pull && docker compose up -d` (or use a deploy action)
- `.env` secrets managed via GitHub Actions secrets → VPS env file or Docker secrets
- Optionally: tag releases as `ghcr.io/rtmkvtn/tron-ctl:{git-sha}` for rollback capability
- Branch protection: require CI green before merge to main

**Exit criteria**: merge a commit to main → image appears in GHCR within 5 minutes → VPS auto-pulls and restarts the container → `/api/health` returns 200 with new commit sha in the response.

---

## 13. Non-goals (explicit)

So no one builds them by accident:

- ❌ HD wallet derivation (BIP32/44). All keys are random and independent.
- ❌ Mnemonic / seed phrase import or export.
- ❌ Hardware wallet (Ledger) integration.
- ❌ Multi-user / RBAC / login UI.
- ❌ Multi-currency: only USDT TRC20.
- ❌ Multi-chain: only TRON.
- ❌ Fiat conversion or price tracking.
- ❌ Push notifications / email / mobile alerts.
- ❌ Public API / webhooks.
- ❌ Auto-backup of keys.
- ❌ Background polling while tab is closed.
- ❌ Event subscription via TronGrid event stream (deferred; polling is good enough at ≤10 wallets).
- ❌ Bulk send / batch send.
- ❌ Address book / saved destinations.

---

## 14. Open questions (resolve before each phase)

- **Q1 (Phase 6)**: When master has *partial* energy and ALSO partial bandwidth, do we delegate both then top up TRX for the combined shortfall in one transfer, or two separate top-ups? — Default: one combined top-up.
- **Q2 (Phase 6)**: TronGrid energy estimation via `triggerConstantContract` returns an estimate. We need a safety buffer for delegation amount (the chain price of energy can drift between preview and execution). — Default: delegate `1.05 ×` estimated energy, top up `1.05 ×` shortfall.
- **Q3 (Phase 8)**: When promoting, do we wait for each undelegate confirmation sequentially, or fire them all then wait? — Default: sequential for transparency in the SSE stream.
- **Q4 (Phase 10)**: Do we want a sanity-check guardrail that refuses sends if master's free quota is suspiciously empty (might indicate a chain issue)? — Default: no, surface the error from TronGrid only.
- **Q5 (Phase 3)**: When polling finds an *outgoing* USDT tx that the app didn't initiate (i.e., user moved funds via TronLink directly), do we record it with a note? — Default: yes, with kind=`OUT`, note=`"external"`.
- **Q6 (Phase 1)**: Tailwind v4 or v3? — Default: v4 (oxide).
- **Q7 (Phase 5)**: When a regular wallet receives a delegation in-place (already has X, we delegate +Y), do we model this as a new Delegation row or update an existing one? — Default: single row per (master, regular, resource) tuple, updated in place. Simpler aggregate math.

---

## 15. Glossary

- **Energy**: TRON resource consumed by smart-contract execution (USDT transfers). Renewable; regenerates over 24h proportional to delegated stake.
- **Bandwidth**: TRON resource consumed by any transaction (proportional to byte size). 600 free per day per account, then burned at 1000 sun/byte.
- **Freeze**: stake TRX to receive energy or bandwidth (`freezeBalanceV2`).
- **Unfreeze**: start the 14-day cooldown that returns TRX to liquid (`unfreezeBalanceV2`).
- **Delegate**: lend energy or bandwidth from one account to another (`delegateResource`). Instant, no marketplace lockup at `lock_period=0`.
- **Withdraw matured**: claim TRX that has finished its 14-day cooldown (`withdrawExpireUnfreeze`).
- **Master**: the wallet flagged as `master` in our DB. Holds frozen TRX, delegates to regulars, funds top-ups.
- **Regular**: a normal wallet that receives + sends USDT. Up to 10 active.
- **Unwinding**: former master demoted by a `promote` action; in 14-day cooldown.
- **Archived**: soft-deleted regular; key retained; not polled.
- **TRC20**: TRON's smart-contract token standard. USDT runs on TRC20 (and ERC20 on Ethereum, and others).
- **TronGrid**: the HTTP RPC service we use. Free tier: 100k req/day, 15 QPS, API key required.
- **Stake 2.0**: TRON's current freeze/delegate protocol. Required for inter-account resource delegation.
