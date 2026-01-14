// Local JSON file storage for development
import fs from 'fs'
import path from 'path'
import type { Inquiry, InquiryStatus, PromoCode } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json')
const ADMIN_USERS_FILE = path.join(DATA_DIR, 'admin_users.json')
const PROMO_CODES_FILE = path.join(DATA_DIR, 'promo_codes.json')
const GENERATION_TRACKING_FILE = path.join(DATA_DIR, 'generation_tracking.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch (error) {
      console.error(`[DB-JSON] Failed to create data directory:`, error)
    }
  }
}

// Helper to read JSON file
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  ensureDataDir()
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`[DB-JSON] Error reading ${filePath}:`, error)
  }
  return defaultValue
}

// Helper to write JSON file
function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDataDir()
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`[DB-JSON] Error writing ${filePath}:`, error)
    throw error
  }
}

// Generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Placeholder for compatibility with PostgreSQL module
export async function initializeDatabase(): Promise<void> {
  ensureDataDir()
  console.log('[DB-JSON] Local storage initialized')
}

// ============ INQUIRIES ============

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

export async function createInquiry(data: InquiryInsert): Promise<Inquiry> {
  const inquiries = readJsonFile<Inquiry[]>(INQUIRIES_FILE, [])

  const newInquiry: Inquiry = {
    id: generateUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'new' as InquiryStatus,
    name: data.contact_name,
    phone: data.contact_phone,
    email: data.contact_email || undefined,
    company_name: data.company_name,
    products_services: data.products_services || undefined,
    exhibition_name: data.exhibition_name || undefined,
    exhibition_date: data.exhibition_date || undefined,
    area_sqm: data.area_sqm || undefined,
    stand_type: data.stand_type as Inquiry['stand_type'],
    staff_count: data.staff_count || undefined,
    main_goal: data.main_goal as Inquiry['main_goal'],
    style: data.style as Inquiry['style'],
    height_meters: data.height_meters || undefined,
    has_suspended: data.has_suspended || false,
    zones: data.zones as Inquiry['zones'],
    elements: data.elements as Inquiry['elements'],
    brand_colors: data.brand_colors || undefined,
    budget_range: data.budget_range as Inquiry['budget_range'],
    special_requests: data.special_requests || undefined,
    exclusions: data.exclusions || undefined,
    generated_images: data.generated_images || [],
    selected_image_index: data.selected_image_index ?? undefined,
    conversation_log: (data.conversation_log as unknown as Inquiry['conversation_log']) || [],
  }

  inquiries.push(newInquiry)
  writeJsonFile(INQUIRIES_FILE, inquiries)

  return newInquiry
}

export async function getInquiries(options: {
  status?: InquiryStatus | 'all'
  page?: number
  limit?: number
}): Promise<{ inquiries: Inquiry[]; total: number }> {
  const { status = 'all', page = 1, limit = 20 } = options

  let inquiries = readJsonFile<Inquiry[]>(INQUIRIES_FILE, [])

  // Filter by status
  if (status !== 'all') {
    inquiries = inquiries.filter((i) => i.status === status)
  }

  // Sort by created_at descending
  inquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const total = inquiries.length
  const offset = (page - 1) * limit
  const paginatedInquiries = inquiries.slice(offset, offset + limit)

  return { inquiries: paginatedInquiries, total }
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const inquiries = readJsonFile<Inquiry[]>(INQUIRIES_FILE, [])
  return inquiries.find((i) => i.id === id) || null
}

export async function updateInquiry(
  id: string,
  data: Partial<{
    status: InquiryStatus
    quoted_price: number | null
    admin_notes: string | null
  }>
): Promise<Inquiry | null> {
  const inquiries = readJsonFile<Inquiry[]>(INQUIRIES_FILE, [])
  const index = inquiries.findIndex((i) => i.id === id)

  if (index === -1) return null

  const updateData: Partial<Inquiry> = {
    updated_at: new Date().toISOString(),
  }
  if (data.status !== undefined) updateData.status = data.status
  if (data.quoted_price !== undefined) updateData.quoted_price = data.quoted_price ?? undefined
  if (data.admin_notes !== undefined) updateData.admin_notes = data.admin_notes ?? undefined

  inquiries[index] = {
    ...inquiries[index],
    ...updateData,
  }

  writeJsonFile(INQUIRIES_FILE, inquiries)
  return inquiries[index]
}

// ============ ADMIN USERS ============

interface AdminUser {
  id: string
  email: string
  password_hash: string
  created_at: string
}

function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const users = readJsonFile<AdminUser[]>(ADMIN_USERS_FILE, [])
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createAdminUser(email: string, password: string): Promise<AdminUser> {
  const users = readJsonFile<AdminUser[]>(ADMIN_USERS_FILE, [])

  const newUser: AdminUser = {
    id: generateUUID(),
    email: email.toLowerCase(),
    password_hash: simpleHash(password),
    created_at: new Date().toISOString(),
  }

  users.push(newUser)
  writeJsonFile(ADMIN_USERS_FILE, users)

  return newUser
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const users = readJsonFile<AdminUser[]>(ADMIN_USERS_FILE, [])
  return users.find((u) => u.id === id) || null
}

export function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash
}

// ============ PROMO CODES ============

function generatePromoCodeString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `EXPO-${code}`
}

export async function createPromoCode(options?: {
  expires_at?: string
  max_generations?: number
}): Promise<PromoCode> {
  const promoCodes = readJsonFile<PromoCode[]>(PROMO_CODES_FILE, [])

  let code = generatePromoCodeString()
  while (promoCodes.some((p) => p.code === code)) {
    code = generatePromoCodeString()
  }

  const newPromoCode: PromoCode = {
    id: generateUUID(),
    code,
    max_generations: options?.max_generations ?? 5,
    created_at: new Date().toISOString(),
    expires_at: options?.expires_at,
    is_used: false,
  }

  promoCodes.push(newPromoCode)
  writeJsonFile(PROMO_CODES_FILE, promoCodes)

  return newPromoCode
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  const promoCodes = readJsonFile<PromoCode[]>(PROMO_CODES_FILE, [])
  return promoCodes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const promoCodes = readJsonFile<PromoCode[]>(PROMO_CODES_FILE, [])
  return promoCodes.find((p) => p.code.toUpperCase() === code.toUpperCase()) || null
}

export async function validatePromoCode(code: string): Promise<{
  valid: boolean
  error?: string
  promoCode?: PromoCode
}> {
  const promoCode = await getPromoCodeByCode(code)

  if (!promoCode) {
    return { valid: false, error: 'Промокод не найден' }
  }

  if (promoCode.is_used) {
    return { valid: false, error: 'Промокод уже использован' }
  }

  if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
    return { valid: false, error: 'Срок действия промокода истёк' }
  }

  return { valid: true, promoCode }
}

export async function usePromoCode(
  code: string,
  usageInfo: { ip?: string; phone?: string; userAgent?: string }
): Promise<PromoCode | null> {
  const promoCodes = readJsonFile<PromoCode[]>(PROMO_CODES_FILE, [])
  const index = promoCodes.findIndex((p) => p.code.toUpperCase() === code.toUpperCase())

  if (index === -1) return null

  promoCodes[index] = {
    ...promoCodes[index],
    is_used: true,
    used_at: new Date().toISOString(),
    used_by_ip: usageInfo.ip,
    used_by_phone: usageInfo.phone,
    used_by_user_agent: usageInfo.userAgent,
  }

  writeJsonFile(PROMO_CODES_FILE, promoCodes)
  return promoCodes[index]
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const promoCodes = readJsonFile<PromoCode[]>(PROMO_CODES_FILE, [])
  const index = promoCodes.findIndex((p) => p.id === id)

  if (index === -1) return false

  promoCodes.splice(index, 1)
  writeJsonFile(PROMO_CODES_FILE, promoCodes)
  return true
}

// ============ GENERATION TRACKING ============

interface GenerationTracker {
  identifier: string
  generation_count: number
  max_generations: number
  promo_code_used?: string
  last_generation_at: string
  created_at: string
}

export async function getOrCreateGenerationTracker(
  identifier: string,
  defaultMaxGenerations: number = 2
): Promise<GenerationTracker> {
  const trackers = readJsonFile<GenerationTracker[]>(GENERATION_TRACKING_FILE, [])
  let tracker = trackers.find((t) => t.identifier === identifier)

  if (!tracker) {
    tracker = {
      identifier,
      generation_count: 0,
      max_generations: defaultMaxGenerations,
      created_at: new Date().toISOString(),
      last_generation_at: new Date().toISOString(),
    }
    trackers.push(tracker)
    writeJsonFile(GENERATION_TRACKING_FILE, trackers)
  }

  return tracker
}

export async function incrementGenerationCount(identifier: string): Promise<GenerationTracker | null> {
  const trackers = readJsonFile<GenerationTracker[]>(GENERATION_TRACKING_FILE, [])
  const index = trackers.findIndex((t) => t.identifier === identifier)

  if (index === -1) return null

  trackers[index].generation_count += 1
  trackers[index].last_generation_at = new Date().toISOString()

  writeJsonFile(GENERATION_TRACKING_FILE, trackers)
  return trackers[index]
}

export async function applyPromoCodeToTracker(
  identifier: string,
  promoCode: string,
  maxGenerations: number
): Promise<GenerationTracker | null> {
  const trackers = readJsonFile<GenerationTracker[]>(GENERATION_TRACKING_FILE, [])
  const index = trackers.findIndex((t) => t.identifier === identifier)

  if (index === -1) return null

  trackers[index].promo_code_used = promoCode
  trackers[index].max_generations = maxGenerations

  writeJsonFile(GENERATION_TRACKING_FILE, trackers)
  return trackers[index]
}

export async function canGenerate(identifier: string): Promise<{
  allowed: boolean
  remaining: number
  max: number
}> {
  const tracker = await getOrCreateGenerationTracker(identifier)
  const remaining = tracker.max_generations - tracker.generation_count
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    max: tracker.max_generations,
  }
}

export async function getTrackerPromoCode(identifier: string): Promise<string | null> {
  const trackers = readJsonFile<GenerationTracker[]>(GENERATION_TRACKING_FILE, [])
  const tracker = trackers.find((t) => t.identifier === identifier)
  return tracker?.promo_code_used || null
}

export async function updatePromoCodePhone(code: string, phone: string): Promise<void> {
  const promoCodes = readJsonFile<PromoCode[]>(PROMO_CODES_FILE, [])
  const index = promoCodes.findIndex((p) => p.code.toUpperCase() === code.toUpperCase())

  if (index !== -1) {
    promoCodes[index].used_by_phone = phone
    writeJsonFile(PROMO_CODES_FILE, promoCodes)
  }
}
