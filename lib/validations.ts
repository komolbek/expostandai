import { z } from 'zod'

// Phone number validation (Uzbekistan format)
const phoneSchema = z.string().regex(
  /^\+?998\d{9}$|^\d{9}$/,
  'Invalid phone number format'
)

// Email validation (optional)
const emailSchema = z.string().email().optional().or(z.literal(''))

// Contact info schema
export const contactInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: phoneSchema,
  email: emailSchema,
})

// Inquiry data schema
export const inquiryDataSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  products_services: z.string().max(1000).optional(),
  exhibition_name: z.string().max(200).optional(),
  exhibition_date: z.string().optional(),
  // Support both old (area_sqm) and new (width/length) formats
  area_sqm: z.number().positive().max(10000).optional(),
  width_meters: z.number().positive().max(100).optional(),
  length_meters: z.number().positive().max(100).optional(),
  stand_type: z.enum(['island', 'peninsula', 'corner', 'inline']).optional(),
  staff_count: z.number().int().positive().max(100).optional(),
  main_goal: z.enum(['sales', 'branding', 'networking', 'product_launch', 'prestige', 'brand_awareness', 'trade']).optional(),
  style: z.enum(['modern', 'classic', 'minimalist', 'futuristic', 'eco', 'hi-tech']).optional(),
  height_meters: z.number().positive().max(20).optional(),
  has_suspended: z.boolean().optional(),
  zones: z.array(z.string()).optional(),
  elements: z.array(z.string()).optional(),
  // Support both old (brand_colors) and new (color_main/accent) formats
  brand_colors: z.string().max(200).optional(),
  color_main: z.string().max(50).optional(),
  color_accent: z.string().max(50).optional(),
  budget_range: z.enum(['economy', 'standard', 'premium', 'luxury']).optional(),
  special_requests: z.string().max(2000).optional(),
  exclusions: z.string().max(1000).optional(),
  brand_files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).optional().nullable(),
})

// Inquiry submission request schema
export const inquirySubmitSchema = z.object({
  contactInfo: contactInfoSchema,
  inquiryData: inquiryDataSchema,
  generatedImages: z.array(z.string()).optional().nullable(),
  selectedImageIndex: z.number().int().min(0).optional().nullable(),
  conversationLog: z.array(z.record(z.unknown())).optional().nullable(),
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Generate request schema
export const generateRequestSchema = z.object({
  inquiryData: inquiryDataSchema,
})

// Promo code schema
export const promoCodeSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
})

// Type exports
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type InquiryData = z.infer<typeof inquiryDataSchema>
export type InquirySubmitRequest = z.infer<typeof inquirySubmitSchema>
export type LoginRequest = z.infer<typeof loginSchema>
export type GenerateRequest = z.infer<typeof generateRequestSchema>
export type PromoCodeRequest = z.infer<typeof promoCodeSchema>
