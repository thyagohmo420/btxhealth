'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

export default function MedicalOfficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['medico', 'admin']}>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 