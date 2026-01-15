import type { ChatState, InquiryData, StandStyle, StandType } from './types'

// System prompt for Claude AI conversation
export function getSystemPrompt(currentState: ChatState): string {
  return `You are an AI assistant for ExpoCity, helping clients design exhibition stands in Russia and Uzbekistan.

Your job is to collect requirements through friendly conversation in Russian.
Ask ONE question at a time. Be concise, warm, and professional.

CURRENT PHASE: ${currentState.phase}
DATA COLLECTED SO FAR: ${JSON.stringify(currentState.collectedData, null, 2)}

CONVERSATION FLOW:
1. greeting → Ask for company name
2. company_name → Ask about products/services
3. products_services → Ask about exhibition name and date
4. exhibition_details → Ask about stand area (in sq meters)
5. area → Ask about stand type (linear/corner/peninsula/island)
6. stand_type → Ask how many staff will work at the stand
7. staff_count → Ask about main exhibition goal
8. main_goal → Ask about preferred style
9. style → Ask about desired height
10. height → Ask if they need a suspended structure
11. suspended → Ask which zones they need (multi-select)
12. zones → Ask which additional elements (multi-select)
13. elements → Ask about brand colors
14. brand_colors → Transition to file upload (brand_files_upload) - handled by frontend
15. brand_files_upload → (handled by frontend) → previous_stand_upload
16. previous_stand_upload → (handled by frontend) → budget
17. budget → Ask about special requests or things to avoid
18. special_requests → Show summary for confirmation
19. summary → Mark as complete if confirmed

NOTE: Phases brand_files_upload and previous_stand_upload are handled by the frontend.
When user responds from brand_colors phase, set nextPhase to "brand_files_upload".
When receiving "Продолжить" message after file uploads, continue to next logical question.

REQUIRED FIELDS (must collect before summary):
- company_name
- products_services
- area_sqm
- stand_type
- staff_count
- main_goal
- style
- height_meters
- zones (at least one)
- budget_range

OPTIONAL FIELDS:
- exhibition_name, exhibition_date
- has_suspended
- elements
- brand_colors
- brand_files, previous_stand_files (handled by frontend)
- special_requests, exclusions

RESPONSE FORMAT:
You MUST respond with valid JSON only (no markdown, no explanation outside JSON):
{
  "message": "Your message in Russian (use emoji sparingly)",
  "quickReplies": ["Option 1", "Option 2"] or null,
  "multiSelect": true or false,
  "inputType": "text" | "number" | "date" | "file" | null,
  "extractedData": { "field_name": "value" } or null,
  "nextPhase": "next_phase_name",
  "isComplete": false
}

IMPORTANT RULES:
- Always respond in Russian
- Be encouraging and friendly but professional
- If user gives unclear answer, politely ask for clarification
- For multi-select questions (zones, elements), set multiSelect: true
- When showing summary, list all collected data clearly
- If user wants to edit, go back to the appropriate phase
- Set isComplete: true only when user confirms the summary`
}

// Logo analysis result type
export interface LogoAnalysis {
  description: string
  colors: string[]
  style: string
  hasText: boolean
  textContent?: string
}

// Build image generation prompt from collected data
export function buildImagePrompt(
  data: Partial<InquiryData>,
  variation: 'base' | 'alternative' | 'premium',
  logoAnalysis?: LogoAnalysis | null
): string {
  const styleMap: Record<StandStyle, string> = {
    'hi-tech': 'modern hi-tech style with aluminum frames, glass panels, LED accent lighting, sleek metallic finishes',
    'classic': 'classic interior style with wooden panels, warm ambient lighting, elegant fabric finishes, sophisticated design',
    'eco': 'eco-friendly style with natural wood, bamboo elements, live plants, sustainable materials, organic shapes',
    'minimal': 'minimalist clean design with white surfaces, simple geometry, hidden storage, pure forms',
  }

  const typeMap: Record<StandType, string> = {
    'linear': 'LINEAR booth configuration: has solid walls on 3 sides (back wall and 2 side walls), with only the FRONT side open to the aisle for visitor access',
    'corner': 'CORNER booth configuration: has solid walls on 2 adjacent sides (forming an L-shape in the back corner), with 2 OPEN sides facing the aisles at 90 degrees for visitor access',
    'peninsula': 'PENINSULA booth configuration: has only 1 solid back wall, with 3 OPEN sides (front and both sides) facing the aisles for maximum visitor access',
    'island': 'ISLAND booth configuration: NO walls - completely open on ALL 4 SIDES, free-standing in the middle of the exhibition hall, accessible from every direction',
  }

  const zoneDescriptions = (data.zones || [])
    .map((zone) => {
      const zoneMap: Record<string, string> = {
        'reception': 'reception counter with company branding',
        'presentation': 'presentation area with display screen',
        'open_meeting': 'open meeting area with seating',
        'closed_meeting': 'enclosed private meeting room',
        'mini_kitchen': 'small kitchenette area',
        'storage': 'storage room',
      }
      return zoneMap[zone] || zone
    })
    .join(', ')

  const elementDescriptions = (data.elements || [])
    .map((element) => {
      const elementMap: Record<string, string> = {
        'display_cases': 'glass display cases for products',
        'brochure_stands': 'brochure and literature stands',
        'podiums': 'podiums for equipment display',
        'monitors_led': 'LED screens and monitors',
        'plants': 'decorative live plants and greenery',
      }
      return elementMap[element] || element
    })
    .join(', ')

  let variationNote = ''
  if (variation === 'alternative') {
    variationNote = 'Alternative layout with different arrangement of zones. '
  } else if (variation === 'premium') {
    variationNote = 'Premium upgraded version with enhanced materials and larger signage. '
  }

  // Use uppercase for better text rendering in DALL-E
  const companyName = (data.company_name || 'COMPANY').toUpperCase()
  const businessDescription = data.products_services
    ? `The company specializes in ${data.products_services}. `
    : ''

  // Build branding description based on logo analysis
  let brandingDescription: string
  let colors: string

  if (logoAnalysis) {
    // Use detailed logo description from GPT-4 Vision analysis - LOGO IS PRIMARY
    const logoColors = logoAnalysis.colors.length > 0
      ? logoAnalysis.colors.join(', ')
      : data.brand_colors || 'professional corporate colors'
    colors = logoColors

    const logoTextPart = logoAnalysis.hasText && logoAnalysis.textContent
      ? ` The logo contains the text "${logoAnalysis.textContent}".`
      : ''

    brandingDescription = `CRITICAL BRANDING REQUIREMENT - COMPANY LOGO MUST BE THE DOMINANT VISUAL ELEMENT:
The booth MUST prominently display the company logo as the PRIMARY branding element. The logo appears on: main fascia/header (largest placement), reception counter front, and all key visible surfaces.
EXACT LOGO DESCRIPTION (FOLLOW PRECISELY): ${logoAnalysis.description}${logoTextPart}
LOGO VISUAL STYLE: ${logoAnalysis.style} - maintain this exact style in the render.
The logo must be: (1) large and clearly visible, (2) backlit/illuminated for emphasis, (3) accurately rendered matching the described visual characteristics, (4) the most eye-catching element of the booth design.
Company name "${companyName}" appears as smaller secondary text below or near the main logo.`
  } else if (data.brand_files && data.brand_files.length > 0) {
    // Logo uploaded but not analyzed - still prioritize logo
    colors = data.brand_colors || 'professional corporate colors'
    brandingDescription = `CRITICAL BRANDING REQUIREMENT - COMPANY LOGO MUST BE THE DOMINANT VISUAL ELEMENT:
The booth MUST prominently display the company logo as the PRIMARY branding element on main fascia/header, reception counter, and key visible surfaces. The logo should be large, backlit/illuminated, and the most eye-catching element. Company name "${companyName}" appears as smaller secondary text below or near the logo.`
  } else {
    // No logo uploaded - use company name as primary branding
    colors = data.brand_colors || 'professional corporate colors'
    brandingDescription = `PRIMARY BRANDING - COMPANY NAME AS MAIN ELEMENT (no logo provided):
The booth features a large, prominent illuminated sign displaying the company name "${companyName}" in bold sans-serif capital letters. This text signage is the PRIMARY branding element, placed on the main fascia/header. The company name must be: (1) clearly readable from distance, (2) correctly spelled exactly as "${companyName}", (3) backlit/illuminated for maximum visibility, (4) the most prominent visual element of the booth.`
  }

  // Build dimensions description (calculate area from width × length)
  const width = data.width_meters || 3
  const length = data.length_meters || 3
  const height = data.height_meters || 3
  const calculatedArea = width * length
  const dimensionsDescription = `EXACT STAND DIMENSIONS (follow precisely): ${width}m wide (front) × ${length}m deep × ${height}m tall (${calculatedArea} square meters floor area).`

  // Budget tier affects materials quality description
  const budgetQualityMap: Record<string, string> = {
    'economy': 'Cost-effective materials with clean functional design, standard finishes.',
    'standard': 'Quality materials with professional finishes, good balance of aesthetics and functionality.',
    'premium': 'High-end premium materials, luxury finishes, exceptional craftsmanship and attention to detail.',
  }
  const budgetQuality = budgetQualityMap[data.budget_range || 'standard'] || budgetQualityMap['standard']

  return `Professional photorealistic 3D render of an exhibition trade show booth.
${businessDescription}${variationNote}${typeMap[data.stand_type as StandType] || 'exhibition booth'}.
${styleMap[data.style as StandStyle] || 'modern professional style'}. ${budgetQuality}
${dimensionsDescription}${data.has_suspended ? ' With impressive suspended hanging structure above the booth.' : ''}
${zoneDescriptions ? `Functional zones include: ${zoneDescriptions}.` : ''}
${elementDescriptions ? `Features: ${elementDescriptions}.` : ''}
Brand colors: ${colors}. ${brandingDescription}
Trade show exhibition hall environment with professional lighting, neighboring booths visible in background, visitors walking by for scale.
Photorealistic architectural visualization quality, high detail, professional photography style, well-lit, no watermarks.`
}

// Email template for new inquiry notification
export function getNewInquiryEmailHtml(inquiry: {
  company_name: string
  area_sqm?: number
  stand_type?: string
  budget_range?: string
  contact_name: string
  contact_phone: string
  adminUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .footer { background: #f1f5f9; padding: 15px 20px; border-radius: 0 0 8px 8px; text-align: center; }
    .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .detail { margin: 8px 0; }
    .label { font-weight: bold; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🆕 Новая заявка на стенд!</h1>
    </div>
    <div class="content">
      <div class="detail">
        <span class="label">🏢 Компания:</span> ${inquiry.company_name}
      </div>
      <div class="detail">
        <span class="label">📐 Площадь:</span> ${inquiry.area_sqm || '—'} м²
      </div>
      <div class="detail">
        <span class="label">🏗 Тип:</span> ${inquiry.stand_type || '—'}
      </div>
      <div class="detail">
        <span class="label">💰 Бюджет:</span> ${inquiry.budget_range || '—'}
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <div class="detail">
        <span class="label">👤 Контакт:</span> ${inquiry.contact_name}
      </div>
      <div class="detail">
        <span class="label">📞 Телефон:</span> ${inquiry.contact_phone}
      </div>
      <a href="${inquiry.adminUrl}" class="btn">Открыть в панели</a>
    </div>
    <div class="footer">
      <p style="margin: 0; color: #64748b; font-size: 14px;">ExpoCity AI Stand Designer</p>
    </div>
  </div>
</body>
</html>
`
}

// Telegram message format
export function getTelegramMessage(inquiry: {
  company_name: string
  area_sqm?: number
  stand_type?: string
  budget_range?: string
  contact_phone: string
  adminUrl: string
}): string {
  const standTypeRu = formatStandTypeForTelegram(inquiry.stand_type)
  const budgetRu = formatBudgetForTelegram(inquiry.budget_range)
  const standDetails = inquiry.area_sqm
    ? `${inquiry.area_sqm}м², ${standTypeRu}`
    : standTypeRu || '—'

  return `🆕 *Новая заявка\\!*

*Компания:* ${escapeMarkdown(inquiry.company_name)}
*Детали стенда:* ${escapeMarkdown(standDetails)}
*Бюджет:* ${escapeMarkdown(budgetRu)}
*Телефон клиента:* ${escapeMarkdown(inquiry.contact_phone)}

🔗 [Ссылка на заявку в админке](${inquiry.adminUrl})`
}

function formatStandTypeForTelegram(type?: string): string {
  if (!type) return '—'
  const typeMap: Record<string, string> = {
    'linear': 'Линейный',
    'corner': 'Угловой',
    'peninsula': 'Полуостров',
    'island': 'Остров',
  }
  return typeMap[type] || type
}

function formatBudgetForTelegram(range?: string): string {
  if (!range) return '—'
  const budgetMap: Record<string, string> = {
    'economy': 'Эконом',
    'standard': 'Стандарт',
    'premium': 'Премиум',
  }
  return budgetMap[range] || range
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}
