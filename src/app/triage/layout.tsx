'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

export default function TriageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['enfermagem', 'admin']}>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 