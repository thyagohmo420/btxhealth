'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['farmacia', 'admin']}>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 