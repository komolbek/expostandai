'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-lg font-bold text-white">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ExpoStand AI</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Проектирование и строительство выставочных стендов с использованием
              искусственного интеллекта.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900">Контакты</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="tel:+998977722155"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                >
                  <Phone className="h-4 w-4" />
                  +998 97 772 21 55
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@expocity.uz"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                >
                  <Mail className="h-4 w-4" />
                  info@expocity.uz
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  Ташкент, Узбекистан
                </span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900">Навигация</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/chat" className="text-sm text-gray-600 hover:text-primary-600">
                  Создать стенд
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm text-gray-600 hover:text-primary-600">
                  Вход для сотрудников
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ExpoCity. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
