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

// Build image generation prompt from collected data
export function buildImagePrompt(data: Partial<InquiryData>, variation: 'base' | 'alternative' | 'premium'): string {
  const styleMap: Record<StandStyle, string> = {
    'hi-tech': 'modern hi-tech style with aluminum frames, glass panels, LED accent lighting, sleek metallic finishes',
    'classic': 'classic interior style with wooden panels, warm ambient lighting, elegant fabric finishes, sophisticated design',
    'eco': 'eco-friendly style with natural wood, bamboo elements, live plants, sustainable materials, organic shapes',
    'minimal': 'minimalist clean design with white surfaces, simple geometry, hidden storage, pure forms',
  }

  const typeMap: Record<StandType, string> = {
    'linear': 'linear booth with 3 back walls, open on one side',
    'corner': 'corner booth with 2 open sides at 90 degrees',
    'peninsula': 'peninsula booth with 3 open sides',
    'island': 'island booth open on all 4 sides, accessible from everywhere',
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

  const colors = data.brand_colors || 'professional corporate colors'
  const companyName = data.company_name || 'COMPANY'

  return `Professional photorealistic 3D render of an exhibition trade show booth for ${companyName}.
${variationNote}${typeMap[data.stand_type as StandType] || 'exhibition booth'}, approximately ${data.area_sqm || 24} square meters floor area.
${styleMap[data.style as StandStyle] || 'modern professional style'}.
Height: ${data.height_meters || 3} meters${data.has_suspended ? ', with impressive suspended hanging structure above the booth' : ''}.
${zoneDescriptions ? `Functional zones include: ${zoneDescriptions}.` : ''}
${elementDescriptions ? `Features: ${elementDescriptions}.` : ''}
Brand colors: ${colors}. Large "${companyName}" company signage prominently displayed.
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
    'under_500k': 'до $5,000',
    '500k_1m': '$5,000 – $10,000',
    '1m_2m': '$10,000 – $20,000',
    '2m_5m': '$20,000 – $50,000',
    'over_5m': 'более $50,000',
  }
  return budgetMap[range] || range
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}
