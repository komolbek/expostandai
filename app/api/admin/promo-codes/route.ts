import { NextRequest, NextResponse } from 'next/server'
import { createPromoCode, getPromoCodes, deletePromoCode } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// GET - List all promo codes
export async function GET() {
  try {
    await requireAdmin()

    const promoCodes = await getPromoCodes()

    return NextResponse.json({ promoCodes })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[Admin Promo Codes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new promo code
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { expires_at, max_generations } = body

    const promoCode = await createPromoCode({
      expires_at: expires_at || undefined,
      max_generations: max_generations || 5,
    })

    return NextResponse.json({ promoCode })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[Admin Promo Codes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a promo code
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const deleted = await deletePromoCode(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[Admin Promo Codes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
