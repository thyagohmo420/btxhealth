'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { PatientsProvider } from '@/contexts/PatientsContext'
import { QueueProvider } from '@/contexts/QueueContext'
import { ProfessionalsProvider } from '@/contexts/ProfessionalsContext'
import { Toaster } from 'sonner'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <PatientsProvider>
            <QueueProvider>
              <ProfessionalsProvider>
                <ProtectedRoute>
                  <Layout>
                    {children}
                  </Layout>
                </ProtectedRoute>
              </ProfessionalsProvider>
            </QueueProvider>
          </PatientsProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
} 