import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client (lazy initialization)
let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured')
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// Legacy export for backward compatibility
export const supabase = {
  get from() {
    return getSupabase().from.bind(getSupabase())
  },
  get auth() {
    return getSupabase().auth
  },
  get storage() {
    return getSupabase().storage
  },
}

// Server-side Supabase client with service role key (for admin operations)
export function createServerClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database types matching the schema
export interface Database {
  public: {
    Tables: {
      inquiries: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          status: string
          contact_name: string
          contact_phone: string
          contact_email: string | null
          company_name: string
          products_services: string | null
          exhibition_name: string | null
          exhibition_date: string | null
          area_sqm: number | null
          stand_type: string | null
          staff_count: number | null
          main_goal: string | null
          style: string | null
          height_meters: number | null
          has_suspended: boolean
          zones: string[] | null
          elements: string[] | null
          brand_colors: string | null
          budget_range: string | null
          special_requests: string | null
          exclusions: string | null
          generated_images: string[] | null
          selected_image_index: number | null
          conversation_log: Record<string, unknown>[] | null
          quoted_price: number | null
          admin_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          status?: string
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
          quoted_price?: number | null
          admin_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          status?: string
          contact_name?: string
          contact_phone?: string
          contact_email?: string | null
          company_name?: string
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
          quoted_price?: number | null
          admin_notes?: string | null
        }
      }
      inquiry_files: {
        Row: {
          id: string
          inquiry_id: string
          file_type: string
          file_url: string
          file_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inquiry_id: string
          file_type: string
          file_url: string
          file_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inquiry_id?: string
          file_type?: string
          file_url?: string
          file_name?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          created_at?: string
        }
      }
    }
  }
}
