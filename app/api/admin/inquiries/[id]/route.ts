import { NextRequest, NextResponse } from 'next/server'
import { getInquiryById, updateInquiry } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { deleteImagesFromUrls } from '@/lib/upload-from-url'
import type { InquiryStatus } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const inquiry = await getInquiryById(id)

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...inquiry,
      files: [], // No file storage in local mode
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Inquiry detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    // Only allow updating certain fields
    const allowedFields = ['status', 'quoted_price', 'admin_notes', 'deleteImages']
    const updateData: {
      status?: InquiryStatus
      quoted_price?: number | null
      admin_notes?: string | null
    } = {}

    for (const field of allowedFields) {
      if (field in body && field !== 'deleteImages') {
        (updateData as Record<string, unknown>)[field] = body[field]
      }
    }

    // If status is being changed to 'completed' and deleteImages flag is true, delete the images
    if (body.status === 'completed' && body.deleteImages === true) {
      console.log('[Admin] Marking inquiry as completed with image deletion')

      // Get current inquiry to access image URLs
      const currentInquiry = await getInquiryById(id)
      if (currentInquiry?.generated_images && currentInquiry.generated_images.length > 0) {
        try {
          await deleteImagesFromUrls(currentInquiry.generated_images)
          console.log('[Admin] Successfully deleted images from storage')
        } catch (error) {
          console.error('[Admin] Failed to delete images:', error)
          // Don't fail the status update if image deletion fails
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const inquiry = await updateInquiry(id, updateData)

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(inquiry)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Inquiry update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
