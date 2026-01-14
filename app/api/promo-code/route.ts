import { NextRequest, NextResponse } from 'next/server'
import {
  validatePromoCode,
  usePromoCode,
  getOrCreateGenerationTracker,
  applyPromoCodeToTracker,
} from '@/lib/db'

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

// POST - Validate and apply a promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Код не указан' }, { status: 400 })
    }

    // Validate the promo code
    const validation = await validatePromoCode(code.trim())

    if (!validation.valid || !validation.promoCode) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      )
    }

    // Get client identifier
    const identifier = getClientIdentifier(request)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Ensure tracker exists
    await getOrCreateGenerationTracker(identifier)

    // Apply the promo code to the tracker
    await applyPromoCodeToTracker(
      identifier,
      validation.promoCode.code,
      validation.promoCode.max_generations
    )

    // Mark the promo code as used
    await usePromoCode(code.trim(), { ip })

    return NextResponse.json({
      valid: true,
      max_generations: validation.promoCode.max_generations,
      message: `Промокод применён! Теперь вам доступно ${validation.promoCode.max_generations} генераций.`,
    })
  } catch (error) {
    console.error('[Promo Code] Error:', error)
    return NextResponse.json(
      { error: 'Ошибка при применении промокода' },
      { status: 500 }
    )
  }
}
