export type WalletStatus = 'MASTER' | 'REGULAR' | 'UNWINDING' | 'ARCHIVED'

export interface Wallet {
  id: string
  label: string
  address: string
  status: WalletStatus
  colorIndex: number
  createdAt: string
}

export interface WalletWithKey extends Wallet {
  privateKey: string
}
