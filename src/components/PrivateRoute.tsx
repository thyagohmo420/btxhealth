"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function PrivateRoute({ children, allowedRoles = [] }: PrivateRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !user) {
        router.push('/login')
        return
      }

      if (!isLoading && user && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          router.push('/dashboard')
          return
        }
      }
    }

    checkAuth()
  }, [user, isLoading, router, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
} 