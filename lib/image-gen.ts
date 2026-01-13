import OpenAI from 'openai'
import Replicate from 'replicate'
import type { InquiryData } from './types'
import { buildImagePrompt } from './prompts'

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null
let _replicate: Replicate | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

function getReplicate(): Replicate {
  if (!_replicate) {
    const auth = process.env.REPLICATE_API_TOKEN
    if (!auth) {
      throw new Error('REPLICATE_API_TOKEN is not configured')
    }
    _replicate = new Replicate({ auth })
  }
  return _replicate
}

export interface GeneratedImage {
  url: string
  variation: 'base' | 'alternative' | 'premium'
}

// Primary: DALL-E 3
async function generateWithDalle(prompt: string): Promise<string> {
  const openai = getOpenAI()
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1792x1024',
    quality: 'hd',
    style: 'natural',
  })

  const url = response.data?.[0]?.url
  if (!url) {
    throw new Error('No image URL returned from DALL-E')
  }

  return url
}

// Fallback: Replicate Flux
async function generateWithFlux(prompt: string): Promise<string> {
  const replicate = getReplicate()
  const output = await replicate.run('black-forest-labs/flux-1.1-pro', {
    input: {
      prompt,
      aspect_ratio: '16:9',
      output_format: 'webp',
      output_quality: 90,
      safety_tolerance: 2,
      prompt_upsampling: true,
    },
  })

  // Flux returns a URL string or array
  if (typeof output === 'string') {
    return output
  }
  if (Array.isArray(output) && output.length > 0) {
    return String(output[0])
  }

  throw new Error('No image URL returned from Flux')
}

// Generate a single image with fallback
async function generateSingleImage(
  data: Partial<InquiryData>,
  variation: 'base' | 'alternative' | 'premium'
): Promise<GeneratedImage> {
  const prompt = buildImagePrompt(data, variation)

  // Try DALL-E first, fall back to Flux
  try {
    console.log(`Generating ${variation} image with DALL-E 3...`)
    const url = await generateWithDalle(prompt)
    return { url, variation }
  } catch (dalleError) {
    console.error('DALL-E generation failed, trying Flux:', dalleError)

    try {
      const url = await generateWithFlux(prompt)
      return { url, variation }
    } catch (fluxError) {
      console.error('Flux generation also failed:', fluxError)
      throw new Error(`Image generation failed for ${variation}: Both DALL-E and Flux failed`)
    }
  }
}

// Generate all 3 variations
export async function generateStandDesigns(
  data: Partial<InquiryData>
): Promise<{ images: GeneratedImage[]; generationTime: number }> {
  const startTime = Date.now()

  const variations: Array<'base' | 'alternative' | 'premium'> = ['base', 'alternative', 'premium']

  // Generate images sequentially to avoid rate limits
  // DALL-E 3 has a limit of 1 image per request anyway
  const images: GeneratedImage[] = []

  for (const variation of variations) {
    try {
      const image = await generateSingleImage(data, variation)
      images.push(image)
    } catch (error) {
      console.error(`Failed to generate ${variation} image:`, error)
    }
  }

  // If we got at least one image, return what we have
  if (images.length === 0) {
    throw new Error('All image generation attempts failed')
  }

  const generationTime = Date.now() - startTime

  return { images, generationTime }
}

// Generate a single additional image (for regeneration)
export async function regenerateImage(
  data: Partial<InquiryData>,
  variation: 'base' | 'alternative' | 'premium' = 'base'
): Promise<GeneratedImage> {
  return generateSingleImage(data, variation)
}
