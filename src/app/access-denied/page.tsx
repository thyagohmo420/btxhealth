'use client'

import { useAuth } from '@/contexts/AuthContext'
import AccessDenied from '@/components/AccessDenied'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/data/users'

export default function AccessDeniedPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push('/login')
    return null
  }

  // Se não houver role definida, redirecionar para login
  if (!user.role) {
    router.push('/login')
    return null
  }

  return <AccessDenied userRole={user.role as UserRole} />
} 