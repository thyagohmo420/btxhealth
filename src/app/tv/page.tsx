'use client'

import { useEffect, useState, useRef } from 'react'
import { usePatients } from '@/contexts/PatientsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Volume2, VolumeX } from 'lucide-react'

export default function TVDisplay() {
  const { patients, loading } = usePatients()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMuted, setIsMuted] = useState(false)
  const [lastPatientCalled, setLastPatientCalled] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [patientLists, setPatientLists] = useState({
    waiting: [] as any[],
    triage: [] as any[],
    consultation: [] as any[]
  })

  // Efeito para atualizar o relógio
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Efeito para monitorar mudanças nos pacientes
  useEffect(() => {
    if (!loading && patients) {
      // Filtrar pacientes por status
      const waiting = patients
        .filter(p => 
          p.status === 'waiting' && 
          !p.notes?.includes('SENT_TO_TRIAGE:true')
        )
        .slice(0, 3) // Limitar a 3 pacientes
      
      const triage = patients
        .filter(p => 
          p.status === 'waiting' && 
          p.notes?.includes('SENT_TO_TRIAGE:true') &&
          !p.notes?.includes('TRIAGE_COMPLETED:true')
        )
        .slice(0, 3) // Limitar a 3 pacientes
      
      const consultation = patients
        .filter(p => 
          p.status === 'completed' && 
          p.notes?.includes('TRIAGE_COMPLETED:true') &&
          !p.notes?.includes('CONSULT_DATA:')
        )
        .slice(0, 3) // Limitar a 3 pacientes
      
      // Verificar se um novo paciente foi chamado
      const allCurrentPatients = [...waiting, ...triage, ...consultation]
      const recentlyCalledPatient = allCurrentPatients.find(p => {
        const updatedTime = new Date(p.updated_at || '')
        const tenSecondsAgo = new Date(Date.now() - 10 * 1000) // 10 segundos atrás
        return updatedTime > tenSecondsAgo
      })

      // Se encontrou um paciente chamado recentemente e não é o mesmo que já foi notificado
      if (recentlyCalledPatient && recentlyCalledPatient.id !== lastPatientCalled) {
        setLastPatientCalled(recentlyCalledPatient.id)
        
        // Tocar som de notificação se não estiver mudo
        if (!isMuted) {
          playNotificationSound()
        }
      }

      setPatientLists({ waiting, triage, consultation })
    }
  }, [patients, loading, lastPatientCalled, isMuted])

  // Função para tocar som de notificação usando Web Audio API
  const playNotificationSound = () => {
    try {
      // Criar novo AudioContext se não existir
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      // Configurar oscilador para um som agudo de notificação
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // Lá musical (A5)
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Controle de volume com fade out
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      // Tocar som por 0.5 segundos
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error('Erro ao reproduzir som de notificação:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold text-white">Hospital de Juquitiba</h1>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
            </button>
            <div className="flex items-center gap-3 text-white text-3xl">
              <Clock className="w-8 h-8" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Grid de Status */}
        <div className="grid grid-cols-3 gap-8">
          {/* Recepção */}
          <Card className="bg-green-900 border-green-700 border-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-center py-6">
              <CardTitle className="text-3xl text-white">RECEPÇÃO</CardTitle>
              <span className="bg-green-700 text-white text-lg px-3 py-1 rounded-full">
                {patientLists.waiting.length} paciente(s)
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patientLists.waiting.map(patient => (
                  <div
                    key={patient.id}
                    className="bg-green-800 p-6 rounded-lg text-white shadow-md border-2 border-green-600"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-2xl">{patient.full_name}</h3>
                      <span className="text-xl font-bold bg-green-600 px-4 py-2 rounded-full">
                        {patient.queue_number || '#'}
                      </span>
                    </div>
                    <p className="text-lg opacity-80 mt-3">
                      Horário: {new Date(patient.updated_at || '').toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {patientLists.waiting.length === 0 && (
                  <p className="text-white text-center opacity-50 text-xl py-4">
                    Nenhum paciente na recepção
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Triagem */}
          <Card className="bg-yellow-900 border-yellow-700 border-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-center py-6">
              <CardTitle className="text-3xl text-white">TRIAGEM</CardTitle>
              <span className="bg-yellow-700 text-white text-lg px-3 py-1 rounded-full">
                {patientLists.triage.length} paciente(s)
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patientLists.triage.map(patient => (
                  <div
                    key={patient.id}
                    className="bg-yellow-800 p-6 rounded-lg text-white shadow-md border-2 border-yellow-600"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-2xl">{patient.full_name}</h3>
                      <span className="text-xl font-bold bg-yellow-600 px-4 py-2 rounded-full">
                        {patient.queue_number || '#'}
                      </span>
                    </div>
                    <p className="text-lg opacity-80 mt-3">
                      Horário: {new Date(patient.updated_at || '').toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {patientLists.triage.length === 0 && (
                  <p className="text-white text-center opacity-50 text-xl py-4">
                    Nenhum paciente na triagem
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Consultório */}
          <Card className="bg-blue-900 border-blue-700 border-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-center py-6">
              <CardTitle className="text-3xl text-white">CONSULTÓRIO</CardTitle>
              <span className="bg-blue-700 text-white text-lg px-3 py-1 rounded-full">
                {patientLists.consultation.length} paciente(s)
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patientLists.consultation.map(patient => (
                  <div
                    key={patient.id}
                    className="bg-blue-800 p-6 rounded-lg text-white shadow-md border-2 border-blue-600"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-2xl">{patient.full_name}</h3>
                      <span className="text-xl font-bold bg-blue-600 px-4 py-2 rounded-full">
                        {patient.queue_number || '#'}
                      </span>
                    </div>
                    <p className="text-lg opacity-80 mt-3">
                      Horário: {new Date(patient.updated_at || '').toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {patientLists.consultation.length === 0 && (
                  <p className="text-white text-center opacity-50 text-xl py-4">
                    Nenhum paciente no consultório
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Rodapé */}
        <div className="mt-10 text-center text-white text-lg">
          <p>Total de pacientes: {patientLists.waiting.length + patientLists.triage.length + patientLists.consultation.length}</p>
          <p className="mt-2 opacity-60">Atualizado automaticamente</p>
          <div className="mt-4 text-4xl font-bold text-yellow-500 animate-pulse">
            {lastPatientCalled && patientLists.waiting.concat(patientLists.triage).concat(patientLists.consultation).find(p => p.id === lastPatientCalled) && (
              <div>
                <span>Paciente Chamado: </span>
                <span className="text-white">
                  {patientLists.waiting.concat(patientLists.triage).concat(patientLists.consultation).find(p => p.id === lastPatientCalled)?.full_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 