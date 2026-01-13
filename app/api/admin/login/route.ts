import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminByEmail, createAdminUser, verifyPassword } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if admin user exists
    let user = await getAdminByEmail(email)

    if (!user) {
      // For MVP, create first admin user automatically
      if (email === 'admin@expocity.uz' && password === 'admin123') {
        user = await createAdminUser(email, password)
      } else {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
    } else {
      // Verify password
      if (!verifyPassword(password, user.password_hash)) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
