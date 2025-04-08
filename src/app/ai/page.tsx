'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AIPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-medium">Redirecionando...</h1>
      </div>
    </div>
  )
} 