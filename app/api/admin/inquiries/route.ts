import { NextRequest, NextResponse } from 'next/server'
import { getInquiries } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import type { InquiryStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const status = (searchParams.get('status') || 'all') as InquiryStatus | 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const { inquiries, total } = await getInquiries({ status, page, limit })

    return NextResponse.json({
      inquiries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Inquiries API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
