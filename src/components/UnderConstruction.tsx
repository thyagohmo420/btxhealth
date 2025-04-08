'use client'

import { Construction } from 'lucide-react'

interface UnderConstructionProps {
  title: string
  description?: string
}

export function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </header>

      <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100">
        <div className="flex flex-col items-center justify-center text-center">
          <Construction className="w-16 h-16 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Página em Construção
          </h2>
          <p className="text-gray-600 max-w-md">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            Estamos trabalhando para trazer a melhor experiência possível.
          </p>
        </div>
      </div>
    </div>
  )
} 