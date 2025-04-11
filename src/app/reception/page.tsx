'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePatients } from '@/contexts/PatientsContext'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Search,
  Calendar,
  Clock,
  Users,
  Activity,
  UserPlus,
  Tv
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { NewPatientForm } from '@/components/NewPatientForm'
import { supabase } from '@/lib/supabase'
import { ReceptionPatient } from '@/types/reception'
import { PatientStatus, Severity } from '@/types/patient'

interface Patient {
  id: string
  full_name: string
  birth_date: string
  cpf: string
  sus_card?: string
  phone: string
  address?: string
  priority: 'emergency' | 'urgent' | 'high' | 'normal' | 'low'
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  queue_number?: string
}

interface FormData {
  full_name: string
  birth_date: string
  cpf: string
  sus_card?: string
  phone: string
  address?: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  active?: boolean
  rg?: string
  gender: string
  marital_status?: string
  email?: string
}

export default function Reception() {
  const { user, loading: authLoading } = useAuth()
  const { patients, loading: patientsLoading, updatePatient, createPatient, refreshPatients } = usePatients()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDate] = useState(new Date().toLocaleDateString())
  const [currentTime] = useState(new Date().toLocaleTimeString())
  const [isNewPatientFormOpen, setIsNewPatientFormOpen] = useState(false)
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Verificar se há um paciente selecionado no localStorage
  useEffect(() => {
    const checkForSelectedPatient = () => {
      const params = new URLSearchParams(window.location.search);
      const openForm = params.get('openForm');
      
      try {
        const storedPatient = localStorage.getItem('selectedPatient');
        if (storedPatient && openForm === 'true') {
          const patientData = JSON.parse(storedPatient);
          setSelectedPatientData(patientData);
          setIsNewPatientFormOpen(true);
          // Limpar o localStorage após uso
          localStorage.removeItem('selectedPatient');
        }
      } catch (error) {
        console.error('Erro ao recuperar paciente do localStorage:', error);
      }
    };

    if (typeof window !== 'undefined') {
      checkForSelectedPatient();
    }
  }, []);

  // Adicionar log para verificar os pacientes carregados
  useEffect(() => {
    if (patients.length > 0) {
      console.log('Pacientes carregados:', patients);
      console.log('Pacientes na recepção:', patients.filter(p => p.status === 'waiting'));
    }
  }, [patients]);

  const handleSendToTriage = async (patientId: string) => {
    try {
      await updatePatient(patientId, { 
        status: 'waiting' as PatientStatus,
        notes: (patients.find(p => p.id === patientId)?.notes || '') + '\nSENT_TO_TRIAGE:true'
      })
      toast.success('Paciente enviado para triagem')
      // Atualizar lista de pacientes
      await refreshPatients();
    } catch (error) {
      console.error('Erro ao enviar paciente para triagem:', error);
      toast.error('Erro ao enviar paciente para triagem')
    }
  }

  const handleCreatePatient = async (formData: FormData) => {
    try {
      // Formatar CPF - deve ter 11 dígitos
      const formattedCpf = formData.cpf.replace(/\D/g, '');
      if (formattedCpf.length !== 11) {
        toast.error('O CPF deve ter 11 dígitos');
        throw new Error('O CPF deve ter 11 dígitos');
      }

      // Formatar telefone - deve ter 11 dígitos (sem formatação)
      const formattedPhone = formData.phone.replace(/\D/g, '');
      if (formattedPhone.length !== 11) {
        toast.error('O telefone deve ter 11 dígitos');
        throw new Error('O telefone deve ter 11 dígitos');
      }

      // Formatar cartão SUS - deve ser NULL ou ter exatamente 15 dígitos
      let formattedSusCard = null;
      if (formData.sus_card && formData.sus_card.trim() !== '') {
        const cleanSusCard = formData.sus_card.replace(/\D/g, '');
        if (cleanSusCard.length === 15) {
          formattedSusCard = cleanSusCard;
        } else {
          // Se não tiver 15 dígitos, mantém como null
          console.log('Cartão SUS inválido, será salvo como NULL');
        }
      }

      // Obter o último número de senha usado hoje
      const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
      const { data: lastPatients, error: queryError } = await supabase
        .from('patients')
        .select('queue_number')
        .like('created_at', `${today}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextQueueNumber = 1;
      
      if (!queryError && lastPatients && lastPatients.length > 0 && lastPatients[0].queue_number) {
        // Extrair o número da senha (assumindo formato A001, A002, etc.)
        const match = lastPatients[0].queue_number.match(/A(\d+)/);
        if (match && match[1]) {
          // Incrementar o número
          nextQueueNumber = parseInt(match[1], 10) + 1;
        }
      }
      
      // Formatar o número com zeros à esquerda (A001, A002, etc.)
      const queueNumber = `A${nextQueueNumber.toString().padStart(3, '0')}`;

      // Criar objeto com os dados mínimos necessários para o cadastro
      const patientData = {
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        cpf: formattedCpf,
        phone: formattedPhone,
        address: formData.address || '',
        gender: formData.gender,
        sus_card: formattedSusCard,
        emergency_contact: '',
        status: 'reception',
        priority: formData.priority || 'low',
        queue_number: queueNumber
      }

      console.log('Tentando cadastrar paciente com dados:', patientData);

      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single()

      if (error) throw error

      console.log('Paciente cadastrado com sucesso:', newPatient);

      // Forçar atualização da lista de pacientes após o cadastro
      await refreshPatients();
      
      toast.success('Paciente cadastrado com sucesso!')
      return newPatient
    } catch (error) {
      console.error('Erro ao criar paciente:', error)
      toast.error('Erro ao cadastrar paciente: ' + JSON.stringify(error))
      throw error
    }
  }

  if (authLoading || patientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando...</h2>
          <p className="text-gray-600">Por favor, aguarde</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Filtrar pacientes que podem estar na recepção usando uma abordagem segura
  const receptionPatients = patients.filter(p => 
    p.status === 'waiting' && 
    !p.notes?.includes('SENT_TO_TRIAGE:true')
  );
  
  const filteredPatients = receptionPatients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800'
      case 'urgent':
        return 'bg-orange-100 text-orange-800'
      case 'high':
        return 'bg-yellow-100 text-yellow-800'
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recepção</h1>
          <p className="text-gray-600 mt-1">Cadastro e gerenciamento de pacientes</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 space-x-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {currentDate}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {currentTime}
          </div>
          <Button
            onClick={() => router.push('/tv')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Tv className="w-4 h-4 mr-2" />
            Painel TV
          </Button>
          <Button
            onClick={() => setIsNewPatientFormOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
        <NewPatientForm
          open={isNewPatientFormOpen}
          onOpenChange={setIsNewPatientFormOpen}
          onSubmit={async (data) => {
            try {
              await handleCreatePatient({
                ...data,
                active: true
              })
              setIsNewPatientFormOpen(false)
            } catch (error) {
              console.error('Erro ao cadastrar paciente:', error)
              toast.error('Erro ao cadastrar paciente')
            }
          }}
          initialData={selectedPatientData}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pacientes na Recepção</CardTitle>
            <CardDescription>Total de pacientes aguardando</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {patients.filter(p => p.status === 'waiting').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pacientes na Triagem</CardTitle>
            <CardDescription>Total de pacientes em triagem</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {patients.filter(p => 
                p.status === 'waiting' && 
                p.notes?.includes('SENT_TO_TRIAGE:true') && 
                !p.notes?.includes('TRIAGE_COMPLETED:true')
              ).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pacientes no Consultório</CardTitle>
            <CardDescription>Total de pacientes em atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {patients.filter(p => 
                p.status === 'completed' && 
                p.notes?.includes('TRIAGE_COMPLETED:true') &&
                !p.notes?.includes('CONSULT_DATA:')
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pacientes na Recepção</CardTitle>
          <CardDescription>
            Lista de pacientes aguardando atendimento
          </CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-4 rounded-lg border bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{patient.full_name}</h3>
                      <span className="px-2 py-1 text-sm font-semibold rounded-md bg-blue-100 text-blue-800">
                        {patient.queue_number || "Sem senha"}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${getPriorityColor(patient.priority)}`}>
                        {patient.priority === 'emergency' ? 'Emergência' :
                          patient.priority === 'high' ? 'Alta' :
                          patient.priority === 'medium' ? 'Média' :
                          patient.priority === 'low' ? 'Baixa' : 'Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Nascimento: {new Date(patient.birth_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      CPF: {patient.cpf}
                    </p>
                    {patient.sus_card && (
                      <p className="text-sm text-gray-600">
                        Cartão SUS: {patient.sus_card}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-xl font-bold text-blue-600">{patient.queue_number || "Sem senha"}</span>
                    <Button
                      onClick={() => handleSendToTriage(patient.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Enviar para Triagem
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredPatients.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum paciente encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 