'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePatients } from '@/contexts/PatientsContext'
import { PatientStatus, PriorityType } from '@/types/patient'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ClipboardList, Thermometer, Scale, Activity, AlertCircle, Tv } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Patient {
  id: string;
  full_name: string;
  birth_date: string;
  cpf: string;
  sus_card?: string;
  phone: string;
  address?: string;
  priority: 'emergency' | 'urgent' | 'high' | 'normal' | 'low';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  queue_number?: string;
  triageData?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
    symptoms: string;
    observations: string;
    riskClassification?: 'blue' | 'green' | 'yellow' | 'orange' | 'red';
    riskClassificationDescription?: string;
    triageStatus?: string;
  };
}

// Classificação de risco
const riskColors = {
  blue: {
    label: 'Azul',
    description: 'Não urgente - Atendimento por ordem de chegada',
    color: 'bg-blue-500 text-white',
    borderColor: 'border-blue-500',
    waitTime: 'Até 4 horas'
  },
  green: {
    label: 'Verde',
    description: 'Pouco urgente - Atendimento prioritário sobre os azuis',
    color: 'bg-green-500 text-white',
    borderColor: 'border-green-500',
    waitTime: 'Até 120 minutos'
  },
  yellow: {
    label: 'Amarelo',
    description: 'Urgente - Atendimento rápido',
    color: 'bg-yellow-500 text-white',
    borderColor: 'border-yellow-500',
    waitTime: 'Até 60 minutos'
  },
  orange: {
    label: 'Laranja',
    description: 'Muito urgente - Atendimento muito rápido',
    color: 'bg-orange-500 text-white',
    borderColor: 'border-orange-500',
    waitTime: 'Até 10 minutos'
  },
  red: {
    label: 'Vermelho',
    description: 'Emergência - Atendimento imediato',
    color: 'bg-red-500 text-white',
    borderColor: 'border-red-500',
    waitTime: 'Imediato'
  }
};

export default function Triage() {
  const { user, loading: authLoading } = useAuth()
  const { patients, loading: patientsLoading, updatePatient } = usePatients()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [triageForm, setTriageForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    symptoms: '',
    observations: '',
    riskClassification: 'green' as 'blue' | 'green' | 'yellow' | 'orange' | 'red',
    riskClassificationDescription: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
    setTriageForm({
      bloodPressure: patient.triageData?.bloodPressure || '',
      heartRate: patient.triageData?.heartRate || '',
      temperature: patient.triageData?.temperature || '',
      weight: patient.triageData?.weight || '',
      height: patient.triageData?.height || '',
      symptoms: patient.triageData?.symptoms || '',
      observations: patient.triageData?.observations || '',
      riskClassification: patient.triageData?.riskClassification || 'green',
      riskClassificationDescription: patient.triageData?.riskClassificationDescription || ''
    })
  }

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    try {
      // Formatando os dados de triagem em JSON para armazenar no banco
      const triageDataJson = JSON.stringify({
        bloodPressure: triageForm.bloodPressure,
        heartRate: triageForm.heartRate,
        temperature: triageForm.temperature,
        weight: triageForm.weight,
        height: triageForm.height,
        symptoms: triageForm.symptoms,
        observations: triageForm.observations,
        riskClassification: triageForm.riskClassification,
        riskClassificationDescription: triageForm.riskClassificationDescription,
        triageDate: new Date().toISOString(),
        triageStatus: 'completed'
      })

      // Atualizar o paciente com os dados da triagem no campo notes como JSON e texto
      // Usando status 'completed' pois 'waiting_consultation' não é aceito pelo banco
      await updatePatient(selectedPatient.id, {
        status: 'completed',
        height: parseFloat(triageForm.height) || undefined,
        weight: parseFloat(triageForm.weight) || undefined,
        priority: mapRiskToPriority(triageForm.riskClassification),
        notes: `TRIAGE_COMPLETED:true\nTRIAGE_DATA:${triageDataJson}\n\nPressão Arterial: ${triageForm.bloodPressure}
Frequência Cardíaca: ${triageForm.heartRate}
Temperatura: ${triageForm.temperature}
Classificação de Risco: ${riskColors[triageForm.riskClassification].label}
Sintomas: ${triageForm.symptoms}
Observações: ${triageForm.observations}`
      })
      
      toast.success('Triagem concluída com sucesso!')
      setSelectedPatient(null)
      setTriageForm({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        symptoms: '',
        observations: '',
        riskClassification: 'green',
        riskClassificationDescription: ''
      })
    } catch (error) {
      console.error('Erro ao concluir triagem:', error)
      toast.error('Erro ao concluir triagem')
    }
  }

  // Mapear da classificação de risco para a prioridade do paciente
  const mapRiskToPriority = (risk: string): PriorityType => {
    switch (risk) {
      case 'red':
      case 'orange':
        return 'emergency';
      case 'yellow':
        return 'high';
      case 'green':
        return 'medium';
      case 'blue':
        return 'low';
      default:
        return 'medium';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Filtrar apenas pacientes em triagem
  const triagePatients = patients.filter(p => 
    p.status === 'waiting' &&
    p.notes?.includes('SENT_TO_TRIAGE:true') &&
    (!p.notes?.includes('TRIAGE_COMPLETED:true'))
  )
  
  const filteredPatients = triagePatients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Triagem</h1>
          <p className="text-gray-600 mt-1">Avaliação inicial e classificação de risco</p>
        </div>
        <Button
          onClick={() => router.push('/tv')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Tv className="w-4 h-4 mr-2" />
          Painel TV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Aguardando Triagem</CardTitle>
            <CardDescription>
              Pacientes que precisam passar pela triagem
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
              {filteredPatients.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  Nenhum paciente aguardando triagem
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{patient.full_name}</h3>
                        <p className="text-sm text-gray-500">
                          CPF: {patient.cpf}
                        </p>
                        <p className="text-sm text-gray-500">
                          Data de Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                            patient.priority
                          )}`}
                        >
                          {patient.priority === 'emergency'
                            ? 'Emergência'
                            : patient.priority === 'high'
                            ? 'Alta'
                            : patient.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Triagem */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPatient
                ? `Triagem - ${selectedPatient.full_name}`
                : 'Triagem'}
            </CardTitle>
            <CardDescription>
              {selectedPatient
                ? 'Preencha os dados da triagem do paciente'
                : 'Selecione um paciente para iniciar a triagem'}
            </CardDescription>
          </CardHeader>
          {selectedPatient ? (
            <CardContent>
              <form onSubmit={handleTriageSubmit} className="space-y-4">
                <Tabs defaultValue="vitals" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="vitals">Sinais Vitais</TabsTrigger>
                    <TabsTrigger value="symptoms">Sintomas</TabsTrigger>
                    <TabsTrigger value="risk">Classificação de Risco</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="vitals" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bloodPressure" className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Pressão Arterial
                        </Label>
                        <Input
                          id="bloodPressure"
                          placeholder="Ex: 120/80 mmHg"
                          value={triageForm.bloodPressure}
                          onChange={(e) =>
                            setTriageForm({
                              ...triageForm,
                              bloodPressure: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heartRate" className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Frequência Cardíaca
                        </Label>
                        <Input
                          id="heartRate"
                          placeholder="Ex: 80 bpm"
                          value={triageForm.heartRate}
                          onChange={(e) =>
                            setTriageForm({
                              ...triageForm,
                              heartRate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature" className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4" />
                          Temperatura
                        </Label>
                        <Input
                          id="temperature"
                          placeholder="Ex: 36.5 °C"
                          value={triageForm.temperature}
                          onChange={(e) =>
                            setTriageForm({
                              ...triageForm,
                              temperature: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          Peso (kg)
                        </Label>
                        <Input
                          id="weight"
                          placeholder="Ex: 70.5"
                          value={triageForm.weight}
                          onChange={(e) =>
                            setTriageForm({
                              ...triageForm,
                              weight: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="flex items-center gap-2">
                          <Scale className="h-4 w-4" rotate={90} />
                          Altura (cm)
                        </Label>
                        <Input
                          id="height"
                          placeholder="Ex: 175"
                          value={triageForm.height}
                          onChange={(e) =>
                            setTriageForm({
                              ...triageForm,
                              height: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="symptoms" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="symptoms" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Sintomas
                      </Label>
                      <Textarea
                        id="symptoms"
                        placeholder="Descreva os sintomas do paciente"
                        rows={4}
                        value={triageForm.symptoms}
                        onChange={(e) =>
                          setTriageForm({
                            ...triageForm,
                            symptoms: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observations" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Observações
                      </Label>
                      <Textarea
                        id="observations"
                        placeholder="Adicione observações relevantes"
                        rows={4}
                        value={triageForm.observations}
                        onChange={(e) =>
                          setTriageForm({
                            ...triageForm,
                            observations: e.target.value,
                          })
                        }
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="risk" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2 text-lg font-medium">
                        <AlertCircle className="h-5 w-5" />
                        Classificação de Risco
                      </Label>
                      
                      <Select
                        value={triageForm.riskClassification}
                        onValueChange={(value) =>
                          setTriageForm({
                            ...triageForm,
                            riskClassification: value as 'blue' | 'green' | 'yellow' | 'orange' | 'red'
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma classificação" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(riskColors).map(([key, data]) => (
                            <SelectItem key={key} value={key}>
                              {data.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="space-y-2">
                        <Label htmlFor="riskClassificationDescription">
                          Justificativa da Classificação
                        </Label>
                        <Textarea
                          id="riskClassificationDescription"
                          placeholder="Descreva o motivo da classificação de risco"
                          rows={3}
                          value={triageForm.riskClassificationDescription}
                          onChange={(e) =>
                            setTriageForm({
                              ...triageForm,
                              riskClassificationDescription: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <CardFooter className="px-0 pt-6">
                  <Button type="submit" className="w-full">
                    Finalizar Triagem
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          ) : (
            <CardContent>
              <div className="flex flex-col items-center justify-center h-60 text-center text-gray-500">
                <ClipboardList className="h-12 w-12 mb-4" />
                <p>Selecione um paciente na lista ao lado para iniciar a triagem</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
} 