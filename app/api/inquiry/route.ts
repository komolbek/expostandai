import { NextRequest, NextResponse } from 'next/server'
import { createInquiry, getTrackerPromoCode, updatePromoCodePhone } from '@/lib/db'
import { sendAllNotifications } from '@/lib/notifications'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { inquirySubmitSchema } from '@/lib/validations'
import { uploadImageFromUrl } from '@/lib/upload-from-url'

// Helper to get client identifier (same as in other routes)
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

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

  console.log('[Inquiry] Incoming request:', {
    method: request.method,
    url: request.url,
    clientIp,
    headers: {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent')?.substring(0, 50),
    },
  })

  try {
    // Rate limiting
    const rateLimit = checkRateLimit(`inquiry:${clientIp}`, RATE_LIMITS.formSubmission)

    if (!rateLimit.success) {
      console.log('[Inquiry] Rate limit exceeded:', {
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

    // Parse and validate request body with Zod
    const body = await request.json()
    console.log('[Inquiry] Request body parsed:', {
      hasContactInfo: !!body.contactInfo,
      hasInquiryData: !!body.inquiryData,
      companyName: body.inquiryData?.company_name,
      contactName: body.contactInfo?.name,
      contactPhone: body.contactInfo?.phone,
    })

    const result = inquirySubmitSchema.safeParse(body)

    if (!result.success) {
      console.error('[Inquiry] Validation failed:', {
        clientIp,
        errors: JSON.stringify(result.error.flatten(), null, 2),
        bodyKeys: Object.keys(body),
        rawBody: JSON.stringify(body, null, 2),
      })
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    console.log('[Inquiry] Validation passed')

    const { contactInfo, inquiryData, generatedImages, selectedImageIndex, conversationLog } = result.data

    // Check if this client used a promo code and link the phone number
    const identifier = getClientIdentifier(request)
    const promoCodeUsed = await getTrackerPromoCode(identifier)
    if (promoCodeUsed) {
      await updatePromoCodePhone(promoCodeUsed, contactInfo.phone)
    }

    // Upload selected image to permanent storage if it's from DALL-E/Flux (temporary URL)
    // Only save the selected image, not all generated images
    let selectedImageUrl: string | null = null
    if (generatedImages && generatedImages.length > 0 && selectedImageIndex !== null && selectedImageIndex !== undefined) {
      const selectedImage = generatedImages[selectedImageIndex]

      // Check if the URL is a temporary URL (DALL-E or Replicate/Flux)
      if (selectedImage?.includes('oaidalleapiprodscus.blob.core.windows.net') || selectedImage?.includes('replicate.delivery')) {
        console.log('[Inquiry] Uploading selected image to permanent storage...')
        try {
          const permanentUrl = await uploadImageFromUrl(
            selectedImage,
            `inquiry-${Date.now()}-selected.png`
          )

          selectedImageUrl = permanentUrl
          console.log('[Inquiry] Successfully uploaded selected image to permanent storage')
        } catch (error) {
          console.error('[Inquiry] Failed to upload selected image to permanent storage:', error)
          // Continue with temporary URL - better to have the inquiry than to fail completely
          selectedImageUrl = selectedImage
        }
      } else {
        // Already permanent (UploadThing URL)
        selectedImageUrl = selectedImage
      }
    }

    // Insert inquiry into database
    console.log('[Inquiry] Creating inquiry in database...')

    // Calculate area_sqm from width/length if not provided
    const area = inquiryData.area_sqm ||
                 (inquiryData.width_meters && inquiryData.length_meters
                   ? inquiryData.width_meters * inquiryData.length_meters
                   : null)

    // Combine colors if using new format
    const brandColors = inquiryData.brand_colors ||
                       (inquiryData.color_main || inquiryData.color_accent
                         ? `Main: ${inquiryData.color_main || 'N/A'}, Accent: ${inquiryData.color_accent || 'N/A'}`
                         : null)

    const inquiry = await createInquiry({
      contact_name: contactInfo.name,
      contact_phone: contactInfo.phone,
      contact_email: contactInfo.email || null,
      company_name: inquiryData.company_name,
      products_services: inquiryData.products_services || null,
      exhibition_name: inquiryData.exhibition_name || null,
      exhibition_date: inquiryData.exhibition_date || null,
      area_sqm: area,
      stand_type: inquiryData.stand_type || null,
      staff_count: inquiryData.staff_count || null,
      main_goal: inquiryData.main_goal || null,
      style: inquiryData.style || null,
      height_meters: inquiryData.height_meters || null,
      has_suspended: inquiryData.has_suspended || false,
      zones: inquiryData.zones || null,
      elements: inquiryData.elements || null,
      brand_colors: brandColors,
      budget_range: inquiryData.budget_range || null,
      special_requests: inquiryData.special_requests || null,
      exclusions: inquiryData.exclusions || null,
      generated_images: selectedImageUrl ? [selectedImageUrl] : null,
      selected_image_index: selectedImageUrl ? 0 : null,
      conversation_log: conversationLog as unknown as Record<string, unknown>[],
    })

    console.log('[Inquiry] Inquiry created:', {
      inquiryId: inquiry.id,
      company: inquiryData.company_name,
    })

    // Send notifications (don't wait for them to complete)
    sendAllNotifications({
      company_name: inquiryData.company_name,
      area_sqm: area || undefined,
      width_meters: inquiryData.width_meters,
      length_meters: inquiryData.length_meters,
      height_meters: inquiryData.height_meters,
      stand_type: inquiryData.stand_type,
      budget_range: inquiryData.budget_range,
      contact_name: contactInfo.name,
      contact_phone: contactInfo.phone,
      contact_email: contactInfo.email,
      inquiryId: inquiry.id,
    }).catch((err) => console.error('[Inquiry] Notification error:', err))

    const duration = Date.now() - startTime
    console.log(`[Inquiry] Request completed successfully in ${duration}ms`)

    return NextResponse.json({
      success: true,
      inquiryId: inquiry.id,
      message: 'Заявка успешно отправлена',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Inquiry] Request failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientIp,
    })
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}
