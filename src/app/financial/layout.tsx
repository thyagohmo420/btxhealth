'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['financeiro', 'admin']}>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 