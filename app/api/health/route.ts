import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const startedAt = Date.now();

  try {
    await checkDatabaseHealth();

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[health] database check failed', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 }
    );
  }
}
