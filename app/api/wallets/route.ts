import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const wallets = await db.wallet.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, label: true, address: true, status: true, colorIndex: true, createdAt: true },
  })
  return NextResponse.json(wallets.map(w => ({ ...w, createdAt: w.createdAt.toISOString() })))
}
