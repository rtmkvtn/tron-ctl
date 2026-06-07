import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const wallet = await db.wallet.findUnique({
    where: { id },
    select: { privateKey: true, address: true },
  })
  if (!wallet) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  logger.info({ walletAddress: wallet.address }, 'private key accessed')

  return NextResponse.json({ privateKey: wallet.privateKey })
}
