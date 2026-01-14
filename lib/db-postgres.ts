import { Pool } from 'pg'
import type { Inquiry, InquiryStatus, PromoCode } from './types'

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect()
  try {
    // Create inquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'new',

        -- Contact info
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),

        -- Company info
        company_name VARCHAR(255),
        products_services TEXT,

        -- Exhibition details
        exhibition_name VARCHAR(255),
        exhibition_date VARCHAR(100),

        -- Stand specifications
        area_sqm INTEGER,
        stand_type VARCHAR(50),
        staff_count INTEGER,

        -- Design preferences
        main_goal VARCHAR(50),
        style VARCHAR(50),
        height_meters DECIMAL(4,2),
        has_suspended BOOLEAN DEFAULT FALSE,
        zones TEXT[], -- Array of zone strings
        elements TEXT[], -- Array of element strings
        brand_colors TEXT,
        color_background VARCHAR(20),
        color_main VARCHAR(20),
        color_accent VARCHAR(20),

        -- Files
        brand_files JSONB DEFAULT '[]'::jsonb,
        previous_stand_files JSONB DEFAULT '[]'::jsonb,

        -- Budget and notes
        budget_range VARCHAR(50),
        special_requests TEXT,
        exclusions TEXT,

        -- Generated content
        generated_images TEXT[] DEFAULT '{}',
        selected_image_index INTEGER,
        conversation_log JSONB DEFAULT '[]'::jsonb,

        -- Admin fields
        quoted_price DECIMAL(12,2),
        admin_notes TEXT
      )
    `)

    // Create admin_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Create promo_codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        max_generations INTEGER DEFAULT 5,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        used_at TIMESTAMPTZ,
        used_by_ip VARCHAR(100),
        used_by_phone VARCHAR(50),
        used_by_user_agent TEXT,
        is_used BOOLEAN DEFAULT FALSE
      )
    `)

    // Add user_agent column if not exists (migration for existing databases)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promo_codes' AND column_name='used_by_user_agent') THEN
          ALTER TABLE promo_codes ADD COLUMN used_by_user_agent TEXT;
        END IF;
      END $$;
    `)

    // Create generation_tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS generation_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        identifier VARCHAR(255) UNIQUE NOT NULL,
        generation_count INTEGER DEFAULT 0,
        max_generations INTEGER DEFAULT 2,
        promo_code_used VARCHAR(50),
        last_generation_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_generation_tracking_identifier ON generation_tracking(identifier)`)

    console.log('[DB-PG] Database schema initialized')
  } finally {
    client.release()
  }
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
  const result = await pool.query(
    `INSERT INTO inquiries (
      name, phone, email, company_name, products_services,
      exhibition_name, exhibition_date, area_sqm, stand_type, staff_count,
      main_goal, style, height_meters, has_suspended, zones, elements,
      brand_colors, budget_range, special_requests, exclusions,
      generated_images, selected_image_index, conversation_log
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
    ) RETURNING *`,
    [
      data.contact_name,
      data.contact_phone,
      data.contact_email || null,
      data.company_name,
      data.products_services || null,
      data.exhibition_name || null,
      data.exhibition_date || null,
      data.area_sqm || null,
      data.stand_type || null,
      data.staff_count || null,
      data.main_goal || null,
      data.style || null,
      data.height_meters || null,
      data.has_suspended || false,
      data.zones || [],
      data.elements || [],
      data.brand_colors || null,
      data.budget_range || null,
      data.special_requests || null,
      data.exclusions || null,
      data.generated_images || [],
      data.selected_image_index ?? null,
      JSON.stringify(data.conversation_log || []),
    ]
  )

  return mapRowToInquiry(result.rows[0])
}

export async function getInquiries(options: {
  status?: InquiryStatus | 'all'
  page?: number
  limit?: number
}): Promise<{ inquiries: Inquiry[]; total: number }> {
  const { status = 'all', page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  let query = 'SELECT * FROM inquiries'
  let countQuery = 'SELECT COUNT(*) FROM inquiries'
  const params: unknown[] = []

  if (status !== 'all') {
    query += ' WHERE status = $1'
    countQuery += ' WHERE status = $1'
    params.push(status)
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  params.push(limit, offset)

  const [inquiriesResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, status !== 'all' ? [status] : []),
  ])

  return {
    inquiries: inquiriesResult.rows.map(mapRowToInquiry),
    total: parseInt(countResult.rows[0].count, 10),
  }
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const result = await pool.query('SELECT * FROM inquiries WHERE id = $1', [id])
  return result.rows.length > 0 ? mapRowToInquiry(result.rows[0]) : null
}

export async function updateInquiry(
  id: string,
  data: Partial<{
    status: InquiryStatus
    quoted_price: number | null
    admin_notes: string | null
  }>
): Promise<Inquiry | null> {
  const updates: string[] = ['updated_at = NOW()']
  const params: unknown[] = []
  let paramIndex = 1

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex++}`)
    params.push(data.status)
  }
  if (data.quoted_price !== undefined) {
    updates.push(`quoted_price = $${paramIndex++}`)
    params.push(data.quoted_price)
  }
  if (data.admin_notes !== undefined) {
    updates.push(`admin_notes = $${paramIndex++}`)
    params.push(data.admin_notes)
  }

  params.push(id)

  const result = await pool.query(
    `UPDATE inquiries SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  )

  return result.rows.length > 0 ? mapRowToInquiry(result.rows[0]) : null
}

function mapRowToInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id: row.id as string,
    created_at: (row.created_at as Date).toISOString(),
    updated_at: (row.updated_at as Date).toISOString(),
    status: row.status as InquiryStatus,
    name: row.name as string,
    phone: row.phone as string,
    email: row.email as string | undefined,
    company_name: row.company_name as string,
    products_services: row.products_services as string | undefined,
    exhibition_name: row.exhibition_name as string | undefined,
    exhibition_date: row.exhibition_date as string | undefined,
    area_sqm: row.area_sqm as number | undefined,
    stand_type: row.stand_type as Inquiry['stand_type'],
    staff_count: row.staff_count as number | undefined,
    main_goal: row.main_goal as Inquiry['main_goal'],
    style: row.style as Inquiry['style'],
    height_meters: row.height_meters ? parseFloat(row.height_meters as string) : undefined,
    has_suspended: row.has_suspended as boolean,
    zones: row.zones as Inquiry['zones'],
    elements: row.elements as Inquiry['elements'],
    brand_colors: row.brand_colors as string | undefined,
    budget_range: row.budget_range as Inquiry['budget_range'],
    special_requests: row.special_requests as string | undefined,
    exclusions: row.exclusions as string | undefined,
    generated_images: row.generated_images as string[] || [],
    selected_image_index: row.selected_image_index as number | undefined,
    conversation_log: (row.conversation_log as Inquiry['conversation_log']) || [],
    quoted_price: row.quoted_price ? parseFloat(row.quoted_price as string) : undefined,
    admin_notes: row.admin_notes as string | undefined,
  }
}

// ============ ADMIN USERS ============

interface AdminUser {
  id: string
  email: string
  password_hash: string
  created_at: string
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const result = await pool.query(
    'SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1)',
    [email]
  )
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    created_at: row.created_at.toISOString(),
  }
}

export async function createAdminUser(email: string, password: string): Promise<AdminUser> {
  const passwordHash = simpleHash(password)
  const result = await pool.query(
    'INSERT INTO admin_users (email, password_hash) VALUES (LOWER($1), $2) RETURNING *',
    [email, passwordHash]
  )
  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    created_at: row.created_at.toISOString(),
  }
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const result = await pool.query('SELECT * FROM admin_users WHERE id = $1', [id])
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    created_at: row.created_at.toISOString(),
  }
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

export function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash
}

// ============ PROMO CODES ============

export async function createPromoCode(options?: {
  expires_at?: string
  max_generations?: number
}): Promise<PromoCode> {
  const code = generatePromoCodeString()
  const result = await pool.query(
    `INSERT INTO promo_codes (code, max_generations, expires_at)
     VALUES ($1, $2, $3) RETURNING *`,
    [code, options?.max_generations ?? 5, options?.expires_at || null]
  )
  return mapRowToPromoCode(result.rows[0])
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  const result = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC')
  return result.rows.map(mapRowToPromoCode)
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const result = await pool.query(
    'SELECT * FROM promo_codes WHERE UPPER(code) = UPPER($1)',
    [code]
  )
  return result.rows.length > 0 ? mapRowToPromoCode(result.rows[0]) : null
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
  const result = await pool.query(
    `UPDATE promo_codes
     SET is_used = TRUE, used_at = NOW(), used_by_ip = $2, used_by_phone = $3, used_by_user_agent = $4
     WHERE UPPER(code) = UPPER($1) RETURNING *`,
    [code, usageInfo.ip || null, usageInfo.phone || null, usageInfo.userAgent || null]
  )
  return result.rows.length > 0 ? mapRowToPromoCode(result.rows[0]) : null
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM promo_codes WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

function generatePromoCodeString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `EXPO-${code}`
}

function mapRowToPromoCode(row: Record<string, unknown>): PromoCode {
  return {
    id: row.id as string,
    code: row.code as string,
    max_generations: row.max_generations as number,
    created_at: (row.created_at as Date).toISOString(),
    expires_at: row.expires_at ? (row.expires_at as Date).toISOString() : undefined,
    used_at: row.used_at ? (row.used_at as Date).toISOString() : undefined,
    used_by_ip: row.used_by_ip as string | undefined,
    used_by_phone: row.used_by_phone as string | undefined,
    used_by_user_agent: row.used_by_user_agent as string | undefined,
    is_used: row.is_used as boolean,
  }
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
  // Try to get existing
  let result = await pool.query(
    'SELECT * FROM generation_tracking WHERE identifier = $1',
    [identifier]
  )

  if (result.rows.length === 0) {
    // Create new
    result = await pool.query(
      `INSERT INTO generation_tracking (identifier, max_generations)
       VALUES ($1, $2) RETURNING *`,
      [identifier, defaultMaxGenerations]
    )
  }

  return mapRowToTracker(result.rows[0])
}

export async function incrementGenerationCount(identifier: string): Promise<GenerationTracker | null> {
  const result = await pool.query(
    `UPDATE generation_tracking
     SET generation_count = generation_count + 1, last_generation_at = NOW()
     WHERE identifier = $1 RETURNING *`,
    [identifier]
  )
  return result.rows.length > 0 ? mapRowToTracker(result.rows[0]) : null
}

export async function applyPromoCodeToTracker(
  identifier: string,
  promoCode: string,
  maxGenerations: number
): Promise<GenerationTracker | null> {
  const result = await pool.query(
    `UPDATE generation_tracking
     SET promo_code_used = $2, max_generations = $3
     WHERE identifier = $1 RETURNING *`,
    [identifier, promoCode, maxGenerations]
  )
  return result.rows.length > 0 ? mapRowToTracker(result.rows[0]) : null
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
  const result = await pool.query(
    'SELECT promo_code_used FROM generation_tracking WHERE identifier = $1',
    [identifier]
  )
  if (result.rows.length === 0) return null
  return result.rows[0].promo_code_used || null
}

export async function updatePromoCodePhone(code: string, phone: string): Promise<void> {
  await pool.query(
    'UPDATE promo_codes SET used_by_phone = $2 WHERE UPPER(code) = UPPER($1)',
    [code, phone]
  )
}

function mapRowToTracker(row: Record<string, unknown>): GenerationTracker {
  return {
    identifier: row.identifier as string,
    generation_count: row.generation_count as number,
    max_generations: row.max_generations as number,
    promo_code_used: row.promo_code_used as string | undefined,
    last_generation_at: (row.last_generation_at as Date).toISOString(),
    created_at: (row.created_at as Date).toISOString(),
  }
}

// Check if PostgreSQL is configured
export function isPostgresConfigured(): boolean {
  return !!process.env.DATABASE_URL
}
