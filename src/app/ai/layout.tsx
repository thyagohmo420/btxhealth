'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'

export default function AILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 