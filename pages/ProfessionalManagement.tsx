'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabaseConfig'

interface Professional {
  id: string
  name: string
  specialty: string
}

const ProfessionalManagement = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([])

  useEffect(() => {
    // Carregar profissionais ao montar o componente
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
      
      if (error) throw error
      setProfessionals(data || [])
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Profissionais</h1>
      <div className="grid gap-4">
        {professionals.map((professional) => (
          <div key={professional.id} className="p-4 border rounded">
            <h2 className="font-bold">{professional.name}</h2>
            <p className="text-gray-600">{professional.specialty}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfessionalManagement 