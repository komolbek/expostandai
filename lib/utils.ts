import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatBudget(range: string): string {
  const budgetMap: Record<string, string> = {
    'under_500k': 'до $5,000',
    '500k_1m': '$5,000 – $10,000',
    '1m_2m': '$10,000 – $20,000',
    '2m_5m': '$20,000 – $50,000',
    'over_5m': 'более $50,000',
  }
  return budgetMap[range] || range
}

export function formatStandType(type: string): string {
  const typeMap: Record<string, string> = {
    'linear': 'Линейный',
    'corner': 'Угловой',
    'peninsula': 'Полуостров',
    'island': 'Остров',
  }
  return typeMap[type] || type
}

export function formatStyle(style: string): string {
  const styleMap: Record<string, string> = {
    'hi-tech': 'Hi-Tech',
    'classic': 'Классический',
    'eco': 'Эко',
    'minimal': 'Минимализм',
  }
  return styleMap[style] || style
}

export function formatZone(zone: string): string {
  const zoneMap: Record<string, string> = {
    'reception': 'Ресепшн',
    'presentation': 'Зона презентации',
    'open_meeting': 'Открытая переговорная',
    'closed_meeting': 'Закрытая переговорная',
    'mini_kitchen': 'Мини-кухня',
    'storage': 'Подсобное помещение',
  }
  return zoneMap[zone] || zone
}

export function formatElement(element: string): string {
  const elementMap: Record<string, string> = {
    'display_cases': 'Витрины',
    'brochure_stands': 'Буклетницы',
    'podiums': 'Подиумы',
    'monitors_led': 'Мониторы/LED',
    'plants': 'Живые растения',
  }
  return elementMap[element] || element
}

export function formatGoal(goal: string): string {
  const goalMap: Record<string, string> = {
    'brand_awareness': 'Узнаваемость бренда',
    'sales_increase': 'Увеличение продаж',
    'trade': 'Торговля на выставке',
    'prestige': 'Престиж компании',
  }
  return goalMap[goal] || goal
}

export function parseHeight(heightStr: string): number {
  const match = heightStr.match(/(\d+\.?\d*)/)
  if (match) {
    return parseFloat(match[1])
  }
  if (heightStr.includes('Выше')) {
    return 4.5
  }
  return 3
}

export function parseArea(areaStr: string): number {
  if (areaStr.includes('+')) {
    return parseInt(areaStr.replace('+', '')) + 10
  }
  return parseInt(areaStr) || 18
}

export function parseStaffCount(staffStr: string): number {
  if (staffStr.includes('+')) {
    return 8
  }
  const match = staffStr.match(/(\d+)-(\d+)/)
  if (match) {
    return Math.ceil((parseInt(match[1]) + parseInt(match[2])) / 2)
  }
  return parseInt(staffStr) || 3
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Allow various formats: +998901234567, 998901234567, 90-123-45-67
  const phoneRegex = /^[+]?[\d\s-]{9,}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function formatPhoneDisplay(phone: string): string {
  // Format as +998 90 123 45 67
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`
  }
  return phone
}
