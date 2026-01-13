import { Resend } from 'resend'
import { getNewInquiryEmailHtml, getTelegramMessage } from './prompts'

// Lazy initialization to avoid build-time errors
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

interface NotificationData {
  company_name: string
  area_sqm?: number
  stand_type?: string
  budget_range?: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  inquiryId: string
}

// Send email notification to admin
export async function sendEmailNotification(data: NotificationData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not configured, skipping email notification')
    return false
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const adminUrl = `${appUrl}/admin/${data.inquiryId}`

  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: 'ExpoCity AI <noreply@expocity.uz>',
      to: adminEmail,
      subject: `Новая заявка на стенд - ${data.company_name}`,
      html: getNewInquiryEmailHtml({
        company_name: data.company_name,
        area_sqm: data.area_sqm,
        stand_type: data.stand_type,
        budget_range: data.budget_range,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        adminUrl,
      }),
    })

    console.log('Email notification sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return false
  }
}

// Send Telegram notification
export async function sendTelegramNotification(data: NotificationData): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram not configured, skipping notification')
    return false
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const adminUrl = `${appUrl}/admin/${data.inquiryId}`

  const message = getTelegramMessage({
    company_name: data.company_name,
    area_sqm: data.area_sqm,
    stand_type: data.stand_type,
    budget_range: data.budget_range,
    contact_phone: data.contact_phone,
    adminUrl,
  })

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: false,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Telegram API error:', errorData)
      return false
    }

    console.log('Telegram notification sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
    return false
  }
}

// Send confirmation email to client
export async function sendClientConfirmation(data: {
  email: string
  name: string
  company_name: string
}): Promise<boolean> {
  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: 'ExpoCity AI <noreply@expocity.uz>',
      to: data.email,
      subject: `Заявка получена - ${data.company_name}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f8fafc; padding: 30px 20px; border: 1px solid #e2e8f0; }
    .footer { background: #f1f5f9; padding: 15px 20px; border-radius: 0 0 8px 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Заявка получена!</h1>
    </div>
    <div class="content">
      <p>Здравствуйте, ${data.name}!</p>
      <p>Благодарим вас за интерес к нашим услугам. Мы получили вашу заявку на дизайн выставочного стенда для компании <strong>${data.company_name}</strong>.</p>
      <p>Наш специалист свяжется с вами <strong>в течение 24 часов</strong> для обсуждения деталей и предоставления коммерческого предложения.</p>
      <p>С уважением,<br>Команда ExpoCity</p>
    </div>
    <div class="footer">
      <p style="margin: 0; color: #64748b; font-size: 14px;">ExpoCity - Выставочные стенды под ключ</p>
    </div>
  </div>
</body>
</html>
`,
    })

    return true
  } catch (error) {
    console.error('Failed to send client confirmation:', error)
    return false
  }
}

// Send all notifications
export async function sendAllNotifications(data: NotificationData): Promise<void> {
  // Send notifications in parallel
  await Promise.allSettled([
    sendEmailNotification(data),
    sendTelegramNotification(data),
    data.contact_email
      ? sendClientConfirmation({
          email: data.contact_email,
          name: data.contact_name,
          company_name: data.company_name,
        })
      : Promise.resolve(),
  ])
}
