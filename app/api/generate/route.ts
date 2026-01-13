import { NextRequest, NextResponse } from 'next/server'
import { generateStandDesigns } from '@/lib/image-gen'
import type { GenerateRequest } from '@/lib/types'

export const maxDuration = 120 // 2 minutes for image generation

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

    // Generate images
    const result = await generateStandDesigns(inquiryData)

    return NextResponse.json({
      images: result.images,
      generationTime: result.generationTime,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}
