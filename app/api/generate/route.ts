import { NextRequest, NextResponse } from 'next/server'
import { generateStandDesigns } from '@/lib/image-gen'
import {
  getOrCreateGenerationTracker,
  canGenerate,
  incrementGenerationCount,
} from '@/lib/db'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import type { GenerateRequest } from '@/lib/types'

export const maxDuration = 120 // 2 minutes for image generation

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

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = getClientIp(request)

  console.log('[Generate] Incoming request:', {
    method: request.method,
    url: request.url,
    clientIp,
    headers: {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent')?.substring(0, 50),
    },
  })

  try {
    // Rate limiting (in addition to per-user generation limits)
    const rateLimit = checkRateLimit(`generate:${clientIp}`, RATE_LIMITS.imageGeneration)

    if (!rateLimit.success) {
      console.log('[Generate] Rate limit exceeded:', {
        clientIp,
        resetTime: new Date(rateLimit.resetTime).toISOString(),
      })
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    const body: GenerateRequest = await request.json()
    const { inquiryData } = body

    console.log('[Generate] Request parsed:', {
      hasInquiryData: !!inquiryData,
      companyName: inquiryData?.company_name,
      standType: inquiryData?.stand_type,
      budgetRange: inquiryData?.budget_range,
    })

    if (!inquiryData) {
      console.error('[Generate] No inquiry data provided')
      return NextResponse.json(
        { error: 'No inquiry data provided' },
        { status: 400 }
      )
    }

    // Get client identifier and check generation limit
    const identifier = getClientIdentifier(request)
    await getOrCreateGenerationTracker(identifier)
    const status = await canGenerate(identifier)

    console.log('[Generate] Generation status:', {
      identifier,
      allowed: status.allowed,
      remaining: status.remaining,
      max: status.max,
    })

    if (!status.allowed) {
      console.log('[Generate] Generation limit exceeded:', {
        identifier,
        remaining: status.remaining,
        max: status.max,
      })
      return NextResponse.json(
        {
          error: 'Лимит генераций исчерпан',
          remaining: 0,
          max: status.max,
        },
        { status: 429 }
      )
    }

    // Generate images
    console.log('[Generate] Starting image generation...')
    const result = await generateStandDesigns(inquiryData)

    console.log('[Generate] Images generated:', {
      count: result.images.length,
      generationTime: `${result.generationTime}ms`,
    })

    // Increment generation count after successful generation
    await incrementGenerationCount(identifier)
    const updatedStatus = await canGenerate(identifier)

    console.log('[Generate] Generation count updated:', {
      identifier,
      remaining: updatedStatus.remaining,
      max: updatedStatus.max,
    })

    const duration = Date.now() - startTime
    console.log(`[Generate] Request completed successfully in ${duration}ms`)

    return NextResponse.json({
      images: result.images,
      generationTime: result.generationTime,
      remaining: updatedStatus.remaining,
      max: updatedStatus.max,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Generate] Request failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientIp,
    })
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}
