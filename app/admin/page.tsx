import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { InquiryList } from '@/components/admin/InquiryList'

export const metadata = {
  title: 'Панель управления | ExpoStand AI',
}

export default async function AdminPage() {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <InquiryList />
    </AdminLayout>
  )
}
