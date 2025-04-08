"use client"

import { AuthProvider } from '@/contexts/AuthContext'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as ReactHotToastToaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <Providers>
        {children}
        <Toaster />
        <ReactHotToastToaster position="top-right" />
        <SonnerToaster position="top-right" richColors closeButton />
      </Providers>
    </AuthProvider>
  )
} 