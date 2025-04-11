'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseConfig'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Patient {
  id: string
  name: string
  status: string
  created_at: string
}

const QueueManagement = () => {
  const [queue, setQueue] = useState<Patient[]>([])

  useEffect(() => {
    loadQueue()
  }, [])

  const loadQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setQueue(data || [])
    } catch (error) {
      console.error('Erro ao carregar fila:', error)
      toast.error('Erro ao carregar a fila de atendimento')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Fila</h1>
      <div className="grid gap-4">
        {queue.map((patient) => (
          <div key={patient.id} className="p-4 border rounded">
            <h2 className="font-bold">{patient.name}</h2>
            <p className="text-gray-600">
              Status: {patient.status}
            </p>
            <p className="text-sm text-gray-500">
              Entrada: {format(new Date(patient.created_at), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QueueManagement 