// Unified database module - uses PostgreSQL in production, JSON files in development
import type { Inquiry, InquiryStatus, PromoCode } from './types'

// Check if PostgreSQL is configured
const USE_POSTGRES = !!process.env.DATABASE_URL

// Dynamically import the appropriate module
let dbModule: typeof import('./db-postgres') | typeof import('./db-json') | null = null

async function getDbModule() {
  if (dbModule) return dbModule

  if (USE_POSTGRES) {
    console.log('[DB] Using PostgreSQL database')
    dbModule = await import('./db-postgres')
    // Initialize database schema on first use
    await dbModule.initializeDatabase()
  } else {
    console.log('[DB] Using local JSON storage (development mode)')
    dbModule = await import('./db-json')
  }

  return dbModule
}

// Re-export the interface
export interface InquiryInsert {
  contact_name: string
  contact_phone: string
  contact_email?: string | null
  company_name: string
  products_services?: string | null
  exhibition_name?: string | null
  exhibition_date?: string | null
  area_sqm?: number | null
  stand_type?: string | null
  staff_count?: number | null
  main_goal?: string | null
  style?: string | null
  height_meters?: number | null
  has_suspended?: boolean
  zones?: string[] | null
  elements?: string[] | null
  brand_colors?: string | null
  budget_range?: string | null
  special_requests?: string | null
  exclusions?: string | null
  generated_images?: string[] | null
  selected_image_index?: number | null
  conversation_log?: Record<string, unknown>[] | null
}

// ============ INQUIRIES ============

export async function createInquiry(data: InquiryInsert): Promise<Inquiry> {
  const db = await getDbModule()
  return db.createInquiry(data)
}

export async function getInquiries(options: {
  status?: InquiryStatus | 'all'
  page?: number
  limit?: number
}): Promise<{ inquiries: Inquiry[]; total: number }> {
  const db = await getDbModule()
  return db.getInquiries(options)
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const db = await getDbModule()
  return db.getInquiryById(id)
}

export async function updateInquiry(
  id: string,
  data: Partial<{
    status: InquiryStatus
    quoted_price: number | null
    admin_notes: string | null
  }>
): Promise<Inquiry | null> {
  const db = await getDbModule()
  return db.updateInquiry(id, data)
}

// ============ ADMIN USERS ============

export async function getAdminByEmail(email: string) {
  const db = await getDbModule()
  return db.getAdminByEmail(email)
}

export async function createAdminUser(email: string, password: string) {
  const db = await getDbModule()
  return db.createAdminUser(email, password)
}

export async function getAdminById(id: string) {
  const db = await getDbModule()
  return db.getAdminById(id)
}

export function verifyPassword(password: string, hash: string): boolean {
  // Simple hash comparison - same algorithm in both modules
  let computedHash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    computedHash = (computedHash << 5) - computedHash + char
    computedHash = computedHash & computedHash
  }
  return computedHash.toString(16) === hash
}

// ============ PROMO CODES ============

export async function createPromoCode(options?: {
  expires_at?: string
  max_generations?: number
}): Promise<PromoCode> {
  const db = await getDbModule()
  return db.createPromoCode(options)
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  const db = await getDbModule()
  return db.getPromoCodes()
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const db = await getDbModule()
  return db.getPromoCodeByCode(code)
}

export async function validatePromoCode(code: string): Promise<{
  valid: boolean
  error?: string
  promoCode?: PromoCode
}> {
  const db = await getDbModule()
  return db.validatePromoCode(code)
}

export async function usePromoCode(
  code: string,
  usageInfo: { ip?: string; phone?: string; userAgent?: string }
): Promise<PromoCode | null> {
  const db = await getDbModule()
  return db.usePromoCode(code, usageInfo)
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const db = await getDbModule()
  return db.deletePromoCode(id)
}

// ============ GENERATION TRACKING ============

export async function getOrCreateGenerationTracker(
  identifier: string,
  defaultMaxGenerations: number = 2
) {
  const db = await getDbModule()
  return db.getOrCreateGenerationTracker(identifier, defaultMaxGenerations)
}

export async function incrementGenerationCount(identifier: string) {
  const db = await getDbModule()
  return db.incrementGenerationCount(identifier)
}

export async function applyPromoCodeToTracker(
  identifier: string,
  promoCode: string,
  maxGenerations: number
) {
  const db = await getDbModule()
  return db.applyPromoCodeToTracker(identifier, promoCode, maxGenerations)
}

export async function canGenerate(identifier: string): Promise<{
  allowed: boolean
  remaining: number
  max: number
}> {
  const db = await getDbModule()
  return db.canGenerate(identifier)
}

export async function getTrackerPromoCode(identifier: string): Promise<string | null> {
  const db = await getDbModule()
  return db.getTrackerPromoCode(identifier)
}

export async function updatePromoCodePhone(code: string, phone: string): Promise<void> {
  const db = await getDbModule()
  return db.updatePromoCodePhone(code, phone)
}
