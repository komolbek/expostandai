// Stand types
export type StandType = 'linear' | 'corner' | 'peninsula' | 'island'

export type StandStyle = 'hi-tech' | 'classic' | 'eco' | 'minimal'

export type MainGoal = 'brand_awareness' | 'sales_increase' | 'trade' | 'prestige'

export type BudgetRange =
  | 'under_500k'
  | '500k_1m'
  | '1m_2m'
  | '2m_5m'
  | 'over_5m'

export type InquiryStatus = 'new' | 'quoted' | 'accepted' | 'rejected' | 'archived'

// Zone and element options
export type StandZone =
  | 'reception'
  | 'presentation'
  | 'open_meeting'
  | 'closed_meeting'
  | 'mini_kitchen'
  | 'storage'

export type StandElement =
  | 'display_cases'
  | 'brochure_stands'
  | 'podiums'
  | 'monitors_led'
  | 'plants'

// Type aliases for convenience
export type Zone = StandZone
export type Element = StandElement

// Uploaded file info
export interface UploadedFile {
  id: string
  name: string
  url: string
  type: string
  size: number
}

// Inquiry data collected from chat
export interface InquiryData {
  // Company info
  company_name: string
  products_services: string

  // Exhibition details
  exhibition_name: string
  exhibition_date: string

  // Stand specifications
  area_sqm: number
  stand_type: StandType
  staff_count: number

  // Stand dimensions (in meters)
  width_meters: number
  length_meters: number
  height_meters: number

  // Design preferences
  main_goal: MainGoal
  style: StandStyle
  has_suspended: boolean
  zones: StandZone[]
  elements: StandElement[]
  brand_colors: string
  color_background: string
  color_main: string
  color_accent: string

  // File uploads
  brand_files: UploadedFile[] // logos, brand guidelines (eps, cdr, ai)
  previous_stand_files: UploadedFile[] // photos of previous stands

  // Budget and notes
  budget_range: BudgetRange
  special_requests: string
  exclusions: string
}

// Contact information
export interface ContactInfo {
  name: string
  phone: string
  email?: string
}

// Full inquiry as stored in database
export interface Inquiry extends Partial<InquiryData>, ContactInfo {
  id: string
  created_at: string
  updated_at: string
  status: InquiryStatus

  // Generated content
  generated_images: string[]
  selected_image_index?: number

  // Conversation log
  conversation_log: ChatMessage[]

  // Admin fields
  quoted_price?: number
  admin_notes?: string
}

// Chat message structure
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  quickReplies?: string[]
  multiSelect?: boolean
  inputType?: 'text' | 'number' | 'date' | 'file'
}

// Chat state for tracking conversation progress
export interface ChatState {
  phase: ChatPhase
  collectedData: Partial<InquiryData>
  isComplete: boolean
}

export type ChatPhase =
  | 'greeting'
  | 'company_name'
  | 'products_services'
  | 'exhibition_details'
  | 'area'
  | 'stand_type'
  | 'staff_count'
  | 'main_goal'
  | 'style'
  | 'height'
  | 'suspended'
  | 'zones'
  | 'elements'
  | 'brand_colors'
  | 'brand_files_upload'
  | 'previous_stand_upload'
  | 'budget'
  | 'special_requests'
  | 'summary'
  | 'complete'

// API request/response types
export interface ChatRequest {
  messages: ChatMessage[]
  currentState: ChatState
}

export interface ChatResponse {
  message: string
  quickReplies?: string[]
  multiSelect?: boolean
  inputType?: 'text' | 'number' | 'date' | 'file'
  updatedState: ChatState
}

export interface GenerateRequest {
  inquiryData: Partial<InquiryData>
}

export interface GenerateResponse {
  images: Array<{
    url: string
    variation: 'base' | 'alternative' | 'premium'
  }>
  generationTime: number
}

export interface InquirySubmitRequest {
  contactInfo: ContactInfo
  inquiryData: Partial<InquiryData>
  generatedImages: string[]
  selectedImageIndex?: number
  conversationLog: ChatMessage[]
}

export interface InquirySubmitResponse {
  success: boolean
  inquiryId: string
  message: string
}

// Admin types
export interface InquiryListResponse {
  inquiries: Inquiry[]
  total: number
  page: number
  totalPages: number
}

// Promo code types
export interface PromoCode {
  id: string
  code: string
  max_generations: number // Usually 5 for promo users
  created_at: string
  expires_at?: string // Optional expiration date
  used_at?: string // When the code was used
  used_by_ip?: string // IP of the user who used it
  used_by_phone?: string // Phone number if provided
  used_by_user_agent?: string // User agent of the client who used it
  is_used: boolean
}

export interface PromoCodeValidationResult {
  valid: boolean
  error?: string
  max_generations?: number
}

export interface InquiryFile {
  id: string
  inquiry_id: string
  file_type: 'logo' | 'reference' | 'other'
  file_url: string
  file_name: string
  created_at: string
}

// Utility type for form options
export interface SelectOption {
  value: string
  label: string
  labelRu: string
}

// Constants for select options
export const STAND_TYPES: SelectOption[] = [
  { value: 'linear', label: 'Linear (3 walls)', labelRu: 'Линейный (3 стены)' },
  { value: 'corner', label: 'Corner', labelRu: 'Угловой' },
  { value: 'peninsula', label: 'Peninsula', labelRu: 'Полуостров' },
  { value: 'island', label: 'Island', labelRu: 'Остров' },
]

export const STAND_STYLES: SelectOption[] = [
  { value: 'hi-tech', label: 'Modern Hi-Tech', labelRu: 'Современный Hi-Tech' },
  { value: 'classic', label: 'Classic/Interior', labelRu: 'Классический/Интерьерный' },
  { value: 'eco', label: 'Eco/Natural', labelRu: 'Эко/Натуральные материалы' },
  { value: 'minimal', label: 'Minimalist', labelRu: 'Минималистичный' },
]

export const MAIN_GOALS: SelectOption[] = [
  { value: 'brand_awareness', label: 'Brand Awareness', labelRu: 'Узнаваемость бренда' },
  { value: 'sales_increase', label: 'Sales Increase', labelRu: 'Увеличение продаж' },
  { value: 'trade', label: 'Trade at Exhibition', labelRu: 'Торговля на выставке' },
  { value: 'prestige', label: 'Company Prestige', labelRu: 'Престиж компании' },
]

export const BUDGET_RANGES: SelectOption[] = [
  { value: 'under_500k', label: 'Under $5,000', labelRu: 'до $5,000' },
  { value: '500k_1m', label: '$5,000 - $10,000', labelRu: '$5,000 – $10,000' },
  { value: '1m_2m', label: '$10,000 - $20,000', labelRu: '$10,000 – $20,000' },
  { value: '2m_5m', label: '$20,000 - $50,000', labelRu: '$20,000 – $50,000' },
  { value: 'over_5m', label: 'Over $50,000', labelRu: 'более $50,000' },
]

export const STAND_ZONES: SelectOption[] = [
  { value: 'reception', label: 'Reception', labelRu: 'Ресепшн' },
  { value: 'presentation', label: 'Presentation Area', labelRu: 'Зона презентации' },
  { value: 'open_meeting', label: 'Open Meeting Area', labelRu: 'Открытая переговорная' },
  { value: 'closed_meeting', label: 'Closed Meeting Room', labelRu: 'Закрытая переговорная' },
  { value: 'mini_kitchen', label: 'Mini Kitchen', labelRu: 'Мини-кухня' },
  { value: 'storage', label: 'Storage Room', labelRu: 'Подсобное помещение' },
]

export const STAND_ELEMENTS: SelectOption[] = [
  { value: 'display_cases', label: 'Display Cases', labelRu: 'Витрины' },
  { value: 'brochure_stands', label: 'Brochure Stands', labelRu: 'Буклетницы' },
  { value: 'podiums', label: 'Equipment Podiums', labelRu: 'Подиумы для оборудования' },
  { value: 'monitors_led', label: 'Monitors/LED Screens', labelRu: 'Мониторы/LED экраны' },
  { value: 'plants', label: 'Live Plants', labelRu: 'Живые растения' },
]

export const HEIGHT_OPTIONS = ['2.5м', '3м', '3.5м', '4м', 'Выше 4м']

export const AREA_OPTIONS = ['9', '12', '18', '24', '36', '50+']

export const STAFF_OPTIONS = ['1-2', '3-4', '5-6', '7+']
