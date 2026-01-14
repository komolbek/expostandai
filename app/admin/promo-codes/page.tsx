import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { PromoCodeList } from '@/components/admin/PromoCodeList'

export const metadata = {
  title: 'Промокоды | ExpoStand AI',
}

export default async function PromoCodesPage() {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <PromoCodeList />
    </AdminLayout>
  )
}
