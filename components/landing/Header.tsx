'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { MessageSquare } from 'lucide-react'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ExpoStand AI</span>
        </Link>

        <Link href="/chat">
          <Button size="sm" leftIcon={<MessageSquare className="h-4 w-4" />}>
            Создать стенд
          </Button>
        </Link>
      </div>
    </header>
  )
}
