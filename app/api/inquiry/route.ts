import { NextRequest, NextResponse } from 'next/server'
import { createInquiry, getTrackerPromoCode, updatePromoCodePhone } from '@/lib/db'
import { sendAllNotifications } from '@/lib/notifications'
import type { InquirySubmitRequest } from '@/lib/types'

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
  try {
    const body: InquirySubmitRequest = await request.json()
    const { contactInfo, inquiryData, generatedImages, selectedImageIndex, conversationLog } = body

    // Validate required fields
    if (!contactInfo.name || !contactInfo.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    if (!inquiryData.company_name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Check if this client used a promo code and link the phone number
    const identifier = getClientIdentifier(request)
    const promoCodeUsed = await getTrackerPromoCode(identifier)
    if (promoCodeUsed) {
      await updatePromoCodePhone(promoCodeUsed, contactInfo.phone)
    }

    // Insert inquiry into database
    const inquiry = await createInquiry({
      contact_name: contactInfo.name,
      contact_phone: contactInfo.phone,
      contact_email: contactInfo.email || null,
      company_name: inquiryData.company_name,
      products_services: inquiryData.products_services || null,
      exhibition_name: inquiryData.exhibition_name || null,
      exhibition_date: inquiryData.exhibition_date || null,
      area_sqm: inquiryData.area_sqm || null,
      stand_type: inquiryData.stand_type || null,
      staff_count: inquiryData.staff_count || null,
      main_goal: inquiryData.main_goal || null,
      style: inquiryData.style || null,
      height_meters: inquiryData.height_meters || null,
      has_suspended: inquiryData.has_suspended || false,
      zones: inquiryData.zones || null,
      elements: inquiryData.elements || null,
      brand_colors: inquiryData.brand_colors || null,
      budget_range: inquiryData.budget_range || null,
      special_requests: inquiryData.special_requests || null,
      exclusions: inquiryData.exclusions || null,
      generated_images: generatedImages || null,
      selected_image_index: selectedImageIndex ?? null,
      conversation_log: conversationLog as unknown as Record<string, unknown>[],
    })

    // Send notifications (don't wait for them to complete)
    sendAllNotifications({
      company_name: inquiryData.company_name,
      area_sqm: inquiryData.area_sqm,
      stand_type: inquiryData.stand_type,
      budget_range: inquiryData.budget_range,
      contact_name: contactInfo.name,
      contact_phone: contactInfo.phone,
      contact_email: contactInfo.email,
      inquiryId: inquiry.id,
    }).catch((err) => console.error('Notification error:', err))

    return NextResponse.json({
      success: true,
      inquiryId: inquiry.id,
      message: 'Заявка успешно отправлена',
    })
  } catch (error) {
    console.error('Inquiry submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}
