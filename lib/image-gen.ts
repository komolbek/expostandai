import OpenAI from 'openai'
import Replicate from 'replicate'
import type { InquiryData, UploadedFile } from './types'
import { buildImagePrompt, type LogoAnalysis } from './prompts'

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

// Analyze uploaded logo using GPT-4o Vision
export async function analyzeLogoWithVision(logoUrl: string): Promise<LogoAnalysis> {
  const openai = getOpenAI()

  // Convert relative URL to absolute URL for the API
  // Note: With Uploadthing, all URLs should be absolute already
  const absoluteUrl = logoUrl.startsWith('http')
    ? logoUrl
    : `${process.env.NEXT_PUBLIC_APP_URL}${logoUrl}`

  try {
    console.log('Analyzing logo with GPT-4o Vision...')
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this company logo for use in generating an exhibition stand design. Provide a JSON response with:
1. "description": A detailed visual description of the logo (shape, elements, composition) that can be used to recreate it in an image generation prompt
2. "colors": Array of the main colors in the logo (e.g., ["blue", "white", "gold"])
3. "style": The visual style (e.g., "modern minimalist", "classic corporate", "playful", "tech-focused")
4. "hasText": Boolean - whether the logo contains text
5. "textContent": If hasText is true, what text is visible

Respond ONLY with valid JSON, no other text.`
            },
            {
              type: 'image_url',
              image_url: { url: absoluteUrl, detail: 'high' }
            }
          ]
        }
      ]
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from GPT-4o Vision')
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as LogoAnalysis
    }

    // Fallback if JSON parsing fails
    return {
      description: content,
      colors: [],
      style: 'corporate',
      hasText: false
    }
  } catch (error) {
    console.error('Logo analysis failed:', error)
    // Return a generic fallback
    return {
      description: 'company logo',
      colors: [],
      style: 'corporate',
      hasText: false
    }
  }
}

// Analyze first logo from brand files
export async function analyzeLogoFromFiles(brandFiles: UploadedFile[]): Promise<LogoAnalysis | null> {
  if (!brandFiles || brandFiles.length === 0) {
    return null
  }

  // Find the first image file (logo)
  const imageFile = brandFiles.find(file =>
    file.type.startsWith('image/') ||
    file.name.match(/\.(png|jpg|jpeg|svg|webp)$/i)
  )

  if (!imageFile) {
    return null
  }

  return analyzeLogoWithVision(imageFile.url)
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

// Generate a single image with fallback chain: DALL-E 3 -> Flux
async function generateSingleImage(
  data: Partial<InquiryData>,
  variation: 'base' | 'alternative' | 'premium',
  logoAnalysis?: LogoAnalysis | null
): Promise<GeneratedImage> {
  const prompt = buildImagePrompt(data, variation, logoAnalysis)

  // Try DALL-E 3 first
  try {
    console.log(`Generating ${variation} image with DALL-E 3...`)
    const url = await generateWithDalle(prompt)
    return { url, variation }
  } catch (dalleError) {
    console.error('DALL-E 3 generation failed, trying Flux:', dalleError)

    // Try Flux as fallback
    try {
      console.log(`Generating ${variation} image with Flux...`)
      const url = await generateWithFlux(prompt)
      return { url, variation }
    } catch (fluxError) {
      console.error('Flux generation also failed:', fluxError)
      throw new Error(`Image generation failed for ${variation}: All providers failed`)
    }
  }
}

// Generate all 3 variations
export async function generateStandDesigns(
  data: Partial<InquiryData>
): Promise<{ images: GeneratedImage[]; generationTime: number }> {
  const startTime = Date.now()

  // First, analyze logo if brand files are uploaded
  let logoAnalysis: LogoAnalysis | null = null
  if (data.brand_files && data.brand_files.length > 0) {
    console.log('Analyzing uploaded logo with GPT-4 Vision...')
    try {
      logoAnalysis = await analyzeLogoFromFiles(data.brand_files)
      if (logoAnalysis) {
        console.log('Logo analysis complete:', logoAnalysis)
      }
    } catch (error) {
      console.error('Logo analysis failed, proceeding without:', error)
    }
  }

  const variations: Array<'base' | 'alternative' | 'premium'> = ['base', 'alternative', 'premium']

  // Generate images sequentially to avoid rate limits
  // DALL-E 3 has limits on concurrent requests
  const images: GeneratedImage[] = []

  for (const variation of variations) {
    try {
      const image = await generateSingleImage(data, variation, logoAnalysis)
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
