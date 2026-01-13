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

    console.log('[Admin Inquiries] Fetching inquiries:', { status, page, limit })

    const { inquiries, total } = await getInquiries({ status, page, limit })

    console.log('[Admin Inquiries] Found:', { total, count: inquiries.length })

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
    console.error('[Admin Inquiries] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
