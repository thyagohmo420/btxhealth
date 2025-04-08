'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

export default function UserAccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 