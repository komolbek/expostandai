import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ExpoStand AI - Дизайн выставочных стендов с ИИ',
  description:
    'Создайте дизайн выставочного стенда за 5 минут с помощью искусственного интеллекта. ИИ-помощник соберёт ваши требования и сгенерирует варианты дизайна.',
  keywords: ['выставочный стенд', 'дизайн стенда', 'AI', 'искусственный интеллект', 'ExpoCity'],
  openGraph: {
    title: 'ExpoStand AI - Дизайн выставочных стендов с ИИ',
    description:
      'Создайте дизайн выставочного стенда за 5 минут с помощью искусственного интеллекта',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
