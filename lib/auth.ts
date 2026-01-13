import { cookies } from 'next/headers'
import { getAdminById } from './db'

export async function getAdminSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('admin_session')?.value

  if (!sessionId) {
    return null
  }

  try {
    const user = await getAdminById(sessionId)
    return user
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
