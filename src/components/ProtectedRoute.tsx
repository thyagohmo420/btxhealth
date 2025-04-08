'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { toast } from 'sonner'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Se ainda está carregando, não faz nada
    if (loading) return

    // Se não há usuário autenticado, redireciona para login
    if (!user) {
      toast.error('Você precisa estar autenticado para acessar esta página')
      router.push('/login')
      return
    }

    // Se existem papéis permitidos e o usuário não tem um dos papéis necessários
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      toast.error('Você não tem permissão para acessar esta página')
      router.push('/dashboard')
      return
    }
  }, [user, loading, router, allowedRoles])

  // Mostra nada enquanto verifica autenticação
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  // Não mostra nada se o usuário não estiver autenticado ou não tiver permissão
  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return null
  }

  // Se passou por todas as verificações, renderiza os filhos
  return <>{children}</>
} 