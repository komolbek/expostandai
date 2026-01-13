import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { InquiryDetail } from '@/components/admin/InquiryDetail'

export const metadata = {
  title: 'Детали заявки | ExpoStand AI',
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  const { id } = await params

  return (
    <AdminLayout>
      <InquiryDetail inquiryId={id} />
    </AdminLayout>
  )
}
