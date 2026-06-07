# Ubiquitous Language

## Wallet roles

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **master** | The singleton wallet that holds TRX, freezes it for resources, and delegates to regular wallets | master wallet, primary wallet, staking wallet |
| **regular** | An active non-master wallet that receives USDT and sends via master-funded resources (≤10 active at once) | active_child, child wallet, sub-wallet, secondary wallet |
| **unwinding** | A former master wallet that has initiated unstake and is waiting out the 14-day cooldown before TRX is reclaimable | retiring, cooling-down |
| **archived** | A soft-deleted wallet — read-only, private key retained, excluded from operations | deleted, removed, inactive |

## TRON resources

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **energy** | The TRON resource consumed by smart-contract execution (required for every TRC20 transfer) | gas, compute |
| **bandwidth** | The TRON resource consumed by every transaction on the network, regardless of type | BW (abbreviation in code only) |
| **resource** | Collective term for energy and/or bandwidth when the distinction doesn't matter | — |
| **TRX** | The native TRON coin — used to acquire resources via freezing and for direct top-ups | TRON (the coin), tron |
| **USDT** | The TRC20 stablecoin being managed; always means TRC20 USDT unless qualified | tether |

## Staking & delegation

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **freeze** | Lock TRX in the master to earn energy or bandwidth (Stake 2.0: `freezeBalanceV2`) | stake, lock |
| **unfreeze** | Initiate the 14-day cooldown after which frozen TRX becomes reclaimable (`unfreezeBalanceV2`) | unstake, unlock |
| **cooldown** | The mandatory 14-day waiting period between unfreezing and withdrawing TRX | unbonding period, lock-up |
| **withdraw** | Reclaim TRX after cooldown expires (`withdrawExpireUnfreeze`) | claim, redeem |
| **delegate** | Transfer a resource quota from master to a regular wallet for a single send (`delegateResource`) | lend, share, assign |
| **undelegate** | Reclaim a previously delegated resource quota back to master (`undelegateResource`) | revoke, reclaim |
| **delegation** | An active resource quota currently held by a regular wallet, granted by master | lease, grant |

## Send operation

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **send** | The complete user-initiated action of moving USDT from a regular wallet to an external address | transfer (at the top level), payment |
| **operation** | A persisted record of one send — its inputs, sub-step states, and final outcome | transaction, job |
| **pipeline** | The ordered sequence of steps that execute within a single operation | flow, process |
| **delegate step** | First pipeline step — master delegates energy/bandwidth to the sender wallet | delegation phase |
| **top-up step** | Optional second pipeline step — master sends TRX to cover a resource shortfall | TRX transfer, funding step |
| **transfer step** | Final pipeline step — the actual USDT TRC20 transfer from the regular wallet to the recipient | send step, USDT step |

## Operation status

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **in progress** | An operation currently executing steps | pending, running |
| **succeeded** | An operation that completed all pipeline steps successfully | done, completed, ok |
| **failed** | An operation that errored at a pipeline step; no USDT left the wallet | errored, rejected |

## Wallet attributes

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **address** | The on-chain TRON address (34 chars, starts with T) identifying a wallet | account, public key |
| **private key** | The secret key that authorises signing for a wallet's address | secret, key (alone) |
| **label** | The human-readable name assigned to a wallet within tron-ctl | name, alias, title |
| **balance** | A wallet's USDT holdings as last synced from the chain | funds, amount |

## Infrastructure

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **tron-ctl** | The application itself | app (in prose) |
| **network** | The TRON network environment: `mainnet`, `nile`, or `shasta` | chain, environment (when "network" suffices) |
| **TronGrid** | The TRON API service used to query the chain (free tier, API key required) | TRON API, node API |

---

## Relationships

- A **master** holds frozen TRX and grants **delegations** to **regular** wallets.
- A **regular** wallet can only send USDT if master delegates sufficient **resource** before each **transfer step**.
- A **send** produces exactly one **operation** record; an **operation** contains exactly one **pipeline**.
- A **pipeline** always includes a **delegate step** and a **transfer step**; a **top-up step** is inserted only when delegation alone doesn't cover the required **resource**.
- An **unwinding** wallet was once the **master**; it holds no **delegations** and accepts no new **sends** while in **cooldown**.
- An **archived** wallet has no active **delegations** and is excluded from future **sends**.

---

## Example dialogue

> **Dev:** "When a user initiates a **send**, do we delegate before or after the **transfer step**?"
>
> **Domain expert:** "The **delegate step** always runs first — master delegates **energy** and **bandwidth** to the regular wallet, then we check if that covers the full cost. If there's a shortfall, the **top-up step** sends TRX to cover it, then the **transfer step** executes."
>
> **Dev:** "What if the **delegate step** fails? Does USDT leave the wallet?"
>
> **Domain expert:** "No — the **operation** is marked **failed** and nothing else executes. No USDT ever leaves a wallet unless the **transfer step** succeeds."
>
> **Dev:** "And if the user promotes a different wallet to **master**, what happens to the old one?"
>
> **Domain expert:** "The old master becomes **unwinding**. Its TRX enters **cooldown** for 14 days. It keeps its **address** and **private key** but can't receive new **delegations** or be used in a **send**."
>
> **Dev:** "So 'unwinding' and 'archived' are both inactive, but they're different?"
>
> **Domain expert:** "Yes — **unwinding** is a transient state tied to the **cooldown** timer. Once TRX is **withdrawn**, it can be retired or the wallet **archived**. **Archived** is permanent and applies to any wallet, not just former masters."

---

## Flagged ambiguities

- **"transfer"** appears at two levels: the high-level user action ("transfer USDT to someone") and the final pipeline step. Canonical choice: use **send** for the user action and **transfer step** for the pipeline sub-step. Never use "transfer" alone at the top level.
- **"network"** could mean the TRON network (`mainnet`) or a Docker network (`traefik-public`). In domain prose always means the TRON network; qualify as "Docker network" in infrastructure contexts.
- **"stake/unstake"** are common synonyms for **freeze/unfreeze**. The TRON protocol uses freeze/unfreeze (Stake 2.0 is the protocol name, not a verb). Use **freeze** and **unfreeze** everywhere.
- **"account"** was used informally to mean both **address** (on-chain) and **wallet** (in-app record). These are distinct: a **wallet** is the application's record; an **address** is its on-chain identifier.
