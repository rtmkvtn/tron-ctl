import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  const network = process.env.TRON_NETWORK ?? 'unknown'

  let dbStatus: 'ok' | 'error' = 'error'
  try {
    await db.$queryRaw`SELECT 1`
    dbStatus = 'ok'
  } catch (err) {
    logger.error({ err }, 'health check db ping failed')
  }

  const status = dbStatus === 'ok' ? 'ok' : 'degraded'
  const code = status === 'ok' ? 200 : 503

  return NextResponse.json({ status, network, db: dbStatus }, { status: code })
}
