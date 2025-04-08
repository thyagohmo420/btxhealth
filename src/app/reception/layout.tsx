'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['recepcao', 'admin']}>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 