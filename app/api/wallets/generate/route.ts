import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateKeypair } from '@/src/shared/lib/tron/keys'
import { assignColorIndex, defaultLabel } from '@/src/entities/wallet/lib'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const providedLabel: string | undefined = (body.label as string)?.trim() || undefined

  const [{ _count }, master] = await Promise.all([
    db.wallet.aggregate({ _count: { id: true } }),
    db.wallet.findFirst({ where: { status: 'MASTER' } }),
  ])

  const totalEver = _count.id
  const status = master ? 'REGULAR' : 'MASTER'

  if (status === 'REGULAR') {
    const activeRegulars = await db.wallet.count({ where: { status: 'REGULAR' } })
    if (activeRegulars >= 10) {
      return NextResponse.json({ error: 'At capacity — archive a wallet first' }, { status: 409 })
    }
  }

  const { privateKey, address } = generateKeypair()
  const label = providedLabel ?? defaultLabel(totalEver)
  const colorIndex = assignColorIndex(totalEver)

  const wallet = await db.wallet.create({
    data: { label, address, privateKey, status, colorIndex },
  })

  return NextResponse.json({ ...wallet, createdAt: wallet.createdAt.toISOString() })
}
