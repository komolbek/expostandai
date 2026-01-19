import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminByEmail, createAdminUser, verifyPassword } from '@/lib/db'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validations'

// Create initial admin from environment variables (run once on first login attempt)
async function ensureInitialAdmin(): Promise<void> {
  const initialEmail = process.env.ADMIN_INITIAL_EMAIL
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD

  if (!initialEmail || !initialPassword) {
    return // No initial admin configured
  }

  const existingAdmin = await getAdminByEmail(initialEmail)
  if (!existingAdmin) {
    await createAdminUser(initialEmail, initialPassword)
    console.log('[Admin] Initial admin user created from environment variables')
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = getClientIp(request)

  console.log('[Admin Login] Incoming request:', {
    method: request.method,
    url: request.url,
    clientIp,
    headers: {
      'content-type': request.headers.get('content-type'),
    },
  })

  try {
    // Rate limiting
    const rateLimit = checkRateLimit(`login:${clientIp}`, RATE_LIMITS.login)

    if (!rateLimit.success) {
      console.log('[Admin Login] Rate limit exceeded:', {
        clientIp,
        resetTime: new Date(rateLimit.resetTime).toISOString(),
      })
      return NextResponse.json(
        { error: 'Слишком много попыток входа. Попробуйте позже.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      console.error('[Admin Login] Validation failed:', {
        clientIp,
        errors: result.error.flatten(),
      })
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    console.log('[Admin Login] Attempting login for:', { email })

    // Ensure initial admin exists (from env vars)
    await ensureInitialAdmin()

    // Check if admin user exists
    const user = await getAdminByEmail(email)

    if (!user) {
      console.warn('[Admin Login] User not found:', { email, clientIp })
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password with bcrypt
    console.log('[Admin Login] Verifying password...')
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      console.warn('[Admin Login] Invalid password:', { email, clientIp })
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    const duration = Date.now() - startTime
    console.log(`[Admin Login] Login successful in ${duration}ms:`, { email, userId: user.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Admin Login] Request failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientIp,
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
