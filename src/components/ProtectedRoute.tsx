'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { UserRole } from '@/data/users'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

const publicRoutes = ['/login', '/register', '/forgot-password']

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const userRole = user?.role as UserRole | undefined

  useEffect(() => {
    if (!loading) {
      if (!user && !publicRoutes.includes(pathname)) {
        router.push('/login')
      } else if (user && publicRoutes.includes(pathname)) {
        router.push('/dashboard')
      } else if (userRole && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        router.push('/access-denied')
      }
    }
  }, [user, loading, pathname, router, allowedRoles, userRole])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user && !publicRoutes.includes(pathname)) {
    return null
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
} 