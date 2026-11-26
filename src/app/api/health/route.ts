import { NextResponse } from 'next/server'

// Liveness check used by Docker HEALTHCHECK, CI smoke tests and the load balancer.
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    status: 'ok',
    version: process.env.APP_VERSION || 'dev',
    uptime: Math.round(process.uptime()),
  })
}
