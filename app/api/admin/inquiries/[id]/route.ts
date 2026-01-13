import { NextRequest, NextResponse } from 'next/server'
import { getInquiryById, updateInquiry } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
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
    const allowedFields = ['status', 'quoted_price', 'admin_notes']
    const updateData: {
      status?: InquiryStatus
      quoted_price?: number | null
      admin_notes?: string | null
    } = {}

    for (const field of allowedFields) {
      if (field in body) {
        (updateData as Record<string, unknown>)[field] = body[field]
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
