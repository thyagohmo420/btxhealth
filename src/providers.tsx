'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { PatientsProvider } from '@/contexts/PatientsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PatientsProvider>
        {children}
      </PatientsProvider>
    </AuthProvider>
  )
} 