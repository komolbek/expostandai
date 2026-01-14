import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateGenerationTracker, canGenerate } from '@/lib/db'

// Helper to get client identifier (IP + user agent hash)
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Create a simple hash of IP + user agent for fingerprinting
  let hash = 0
  const combined = `${ip}-${userAgent}`
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return `${ip}-${hash.toString(16)}`
}

// GET - Check generation status for current client
export async function GET(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request)

    // Ensure tracker exists (will create with default 2 max generations)
    await getOrCreateGenerationTracker(identifier)

    const status = await canGenerate(identifier)

    return NextResponse.json({
      identifier,
      ...status,
    })
  } catch (error) {
    console.error('[Generation Status] Error:', error)
    return NextResponse.json(
      { error: 'Ошибка при проверке статуса генерации' },
      { status: 500 }
    )
  }
}
