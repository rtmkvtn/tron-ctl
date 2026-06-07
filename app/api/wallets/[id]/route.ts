import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const wallet = await db.wallet.findUnique({
    where: { id },
    select: { id: true, label: true, address: true, status: true, colorIndex: true, createdAt: true },
  })
  if (!wallet) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...wallet, createdAt: wallet.createdAt.toISOString() })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const label: string | undefined = (body.label as string)?.trim()
  if (!label) return NextResponse.json({ error: 'Label is required' }, { status: 400 })

  try {
    const wallet = await db.wallet.update({
      where: { id },
      data: { label },
      select: { id: true, label: true, address: true, status: true, colorIndex: true, createdAt: true },
    })
    return NextResponse.json({ ...wallet, createdAt: wallet.createdAt.toISOString() })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
