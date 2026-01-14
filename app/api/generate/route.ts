import { NextRequest, NextResponse } from 'next/server'
import { generateStandDesigns } from '@/lib/image-gen'
import {
  getOrCreateGenerationTracker,
  canGenerate,
  incrementGenerationCount,
} from '@/lib/db'
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
  try {
    const body: GenerateRequest = await request.json()
    const { inquiryData } = body

    if (!inquiryData) {
      return NextResponse.json(
        { error: 'No inquiry data provided' },
        { status: 400 }
      )
    }

    // Get client identifier and check generation limit
    const identifier = getClientIdentifier(request)
    await getOrCreateGenerationTracker(identifier)
    const status = await canGenerate(identifier)

    if (!status.allowed) {
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
    const result = await generateStandDesigns(inquiryData)

    // Increment generation count after successful generation
    await incrementGenerationCount(identifier)
    const updatedStatus = await canGenerate(identifier)

    return NextResponse.json({
      images: result.images,
      generationTime: result.generationTime,
      remaining: updatedStatus.remaining,
      max: updatedStatus.max,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}
