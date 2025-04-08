'use client'

import { useAuth } from '@/contexts/AuthContext'
import AccessDenied from '@/components/AccessDenied'

export default function AccessDeniedPage() {
  const { user } = useAuth()
  
  if (!user) {
    return null // Redirecionar para login pelo ProtectedRoute
  }
  
  return <AccessDenied userRole={user.role} />
} 