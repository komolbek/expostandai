import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Страница не найдена
          </h2>
          <p className="text-gray-600 mb-6">
            Страница, которую вы ищете, не существует или была перемещена.
          </p>
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}
