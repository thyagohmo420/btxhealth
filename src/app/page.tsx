'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar diretamente para o dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg">Carregando o sistema...</p>
    </div>
  )
} 