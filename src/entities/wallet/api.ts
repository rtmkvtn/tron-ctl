'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Wallet, WalletWithKey } from './types'

const WALLETS_KEY = ['wallets'] as const

export function useWallets() {
  return useQuery<Wallet[]>({
    queryKey: WALLETS_KEY,
    queryFn: () => fetch('/api/wallets').then(r => r.json()),
  })
}

export function useWallet(id: string) {
  return useQuery<Wallet>({
    queryKey: ['wallets', id],
    queryFn: () => fetch(`/api/wallets/${id}`).then(r => r.json()),
  })
}

export function useGenerateWallet() {
  const qc = useQueryClient()
  return useMutation<WalletWithKey, Error, string | undefined>({
    mutationFn: (label?: string) =>
      fetch('/api/wallets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label || undefined }),
      }).then(async r => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}))
          throw new Error(err.error ?? 'Failed to generate wallet')
        }
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: WALLETS_KEY }),
  })
}

export function useUpdateLabel() {
  const qc = useQueryClient()
  return useMutation<Wallet, Error, { id: string; label: string }>({
    mutationFn: ({ id, label }) =>
      fetch(`/api/wallets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      }).then(async r => {
        if (!r.ok) throw new Error('Failed to update label')
        return r.json()
      }),
    onSuccess: (wallet) => {
      qc.invalidateQueries({ queryKey: WALLETS_KEY })
      qc.invalidateQueries({ queryKey: ['wallets', wallet.id] })
    },
  })
}
