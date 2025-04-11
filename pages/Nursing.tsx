'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { usePatients } from '@/hooks/usePatients'
import type { Patient, VitalSigns } from '@/types/patient'
import { supabase } from '@/lib/supabaseConfig'

const Nursing = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Área de Enfermagem</h1>
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar paciente..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  )
}

export default Nursing 