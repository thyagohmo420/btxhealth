'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Pill, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  Plus,
  BarChart,
  FlaskConical,
  RefreshCw,
  Brain
} from 'lucide-react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface Patient {
  id: string
  name: string
  age: number
  room?: string
  bed?: string
  healthInsurance: string
  medications: Medication[]
  status: 'active' | 'discharged' | 'transferred'
  avatar?: string
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  route: string
  start: string
  end?: string
  status: 'scheduled' | 'administered' | 'missed' | 'cancelled'
  administeredAt?: string
  administeredBy?: string
  notes?: string
  nextDose?: string
  interactions?: string[]
  needsAttention?: boolean
}

export default function MedicationManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pendentes')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  // Dados mockados
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'João Silva',
      age: 65,
      room: '102',
      bed: 'A',
      healthInsurance: 'SUS',
      status: 'active',
      medications: [
        {
          id: 'm1',
          name: 'Captopril',
          dosage: '25mg',
          frequency: '8/8h',
          route: 'Oral',
          start: '2023-04-01',
          status: 'scheduled',
          nextDose: '08:00',
          interactions: ['Evitar suplementos de potássio', 'Monitorar pressão arterial'],
          needsAttention: true
        },
        {
          id: 'm2',
          name: 'Dipirona',
          dosage: '500mg',
          frequency: '6/6h (se necessário)',
          route: 'Oral',
          start: '2023-04-01',
          status: 'administered',
          administeredAt: '06:30',
          administeredBy: 'Enfermeira Ana',
          notes: 'Paciente relatou dor de cabeça'
        },
        {
          id: 'm3',
          name: 'Enoxaparina',
          dosage: '40mg',
          frequency: '1x ao dia',
          route: 'Subcutânea',
          start: '2023-04-01',
          status: 'scheduled',
          nextDose: '10:00',
          needsAttention: true
        }
      ]
    },
    {
      id: '2',
      name: 'Maria Santos',
      age: 72,
      room: '105',
      bed: 'C',
      healthInsurance: 'Unimed',
      status: 'active',
      medications: [
        {
          id: 'm4',
          name: 'Losartana',
          dosage: '50mg',
          frequency: '12/12h',
          route: 'Oral',
          start: '2023-04-01',
          status: 'scheduled',
          nextDose: '12:00'
        },
        {
          id: 'm5',
          name: 'Atorvastatina',
          dosage: '20mg',
          frequency: '1x ao dia (noite)',
          route: 'Oral',
          start: '2023-04-01',
          status: 'scheduled',
          nextDose: '20:00'
        },
        {
          id: 'm6',
          name: 'AAS',
          dosage: '100mg',
          frequency: '1x ao dia',
          route: 'Oral',
          start: '2023-04-01',
          status: 'administered',
          administeredAt: '08:00',
          administeredBy: 'Enfermeiro Carlos'
        }
      ]
    },
    {
      id: '3',
      name: 'Pedro Almeida',
      age: 45,
      room: '201',
      bed: 'B',
      healthInsurance: 'Bradesco',
      status: 'active',
      medications: [
        {
          id: 'm7',
          name: 'Ceftriaxona',
          dosage: '1g',
          frequency: '12/12h',
          route: 'Intravenosa',
          start: '2023-04-01',
          status: 'scheduled',
          nextDose: '14:00',
          interactions: ['Monitorar função renal', 'Verificar reações alérgicas'],
          needsAttention: true
        },
        {
          id: 'm8',
          name: 'Omeprazol',
          dosage: '40mg',
          frequency: '1x ao dia',
          route: 'Oral',
          start: '2023-04-01',
          status: 'administered',
          administeredAt: '07:30',
          administeredBy: 'Enfermeira Ana'
        }
      ]
    }
  ])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setSelectedMedication(null)
    setAdminNotes('')
    setShowAIAssistant(false)
    setAiSuggestions([])
  }

  const handleMedicationSelect = (medication: Medication) => {
    setSelectedMedication(medication)
    setAdminNotes(medication.notes || '')
  }

  const handleAdministerMedication = () => {
    if (!selectedPatient || !selectedMedication) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Atualiza o status da medicação
    const updatedPatients = patients.map(patient => {
      if (patient.id === selectedPatient.id) {
        const updatedMedications = patient.medications.map(med => {
          if (med.id === selectedMedication.id) {
            return {
              ...med,
              status: 'administered' as const,
              administeredAt: timeString,
              administeredBy: user?.name || 'Enfermeiro(a)',
              notes: adminNotes
            }
          }
          return med
        })
        return { ...patient, medications: updatedMedications }
      }
      return patient
    })

    setPatients(updatedPatients)
    toast.success('Medicação administrada com sucesso!')
    
    // Atualiza o paciente selecionado com as informações atualizadas
    const updatedPatient = updatedPatients.find(p => p.id === selectedPatient.id)
    if (updatedPatient) {
      setSelectedPatient(updatedPatient)
      setSelectedMedication(null)
      setAdminNotes('')
    }
  }

  const requestAIAnalysis = () => {
    if (!selectedPatient) return

    setIsAIAnalyzing(true)
    setShowAIAssistant(true)
    
    // Simula análise de IA (em um sistema real, isso seria uma chamada de API)
    setTimeout(() => {
      setIsAIAnalyzing(false)
      
      // Sugestões simuladas da IA baseadas nas medicações do paciente
      const suggestions = [
        `Paciente ${selectedPatient.name} está recebendo múltiplas medicações que podem afetar a pressão arterial. Recomendo monitoramento frequente dos sinais vitais.`,
        `A idade do paciente (${selectedPatient.age} anos) pode afetar o metabolismo das medicações. Observe atentamente por sinais de efeitos adversos.`,
        `Verificar interação medicamentosa entre Captopril e outros medicamentos que o paciente esteja recebendo.`,
        `Lembrar de posicionar o paciente adequadamente durante a administração da medicação subcutânea para evitar complicações.`
      ]
      
      setAiSuggestions(suggestions)
    }, 2000)
  }

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando...</h2>
          <p className="text-gray-600">Por favor, aguarde</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const pendingMedications = selectedPatient?.medications.filter(
    med => med.status === 'scheduled'
  ) || []
  
  const administeredMedications = selectedPatient?.medications.filter(
    med => med.status === 'administered'
  ) || []

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Administração de Medicações</h1>
          <p className="text-muted-foreground">
            Gerencie e registre a administração de medicamentos
          </p>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar paciente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Agenda
          </Button>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Medicação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Pacientes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
            <CardDescription>
              {filteredPatients.length} pacientes com medicações ativas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredPatients.map((patient) => {
                const pendingMeds = patient.medications.filter(
                  (med) => med.status === 'scheduled'
                )
                const needsAttention = patient.medications.some(
                  (med) => med.needsAttention
                )
                
                return (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`border-b last:border-0 p-4 cursor-pointer hover:bg-muted transition-colors ${
                      selectedPatient?.id === patient.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-primary font-medium">
                          {patient.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium">{patient.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {patient.age} anos • Quarto {patient.room}, Leito {patient.bed}
                          </p>
                        </div>
                      </div>
                      
                      {needsAttention && (
                        <Badge variant="destructive" className="ml-2">
                          Atenção
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm">
                      <Pill className="h-4 w-4 mr-1.5 text-primary" />
                      <span>{pendingMeds.length} medicação(ões) pendente(s)</span>
                    </div>
                  </div>
                )
              })}
              
              {filteredPatients.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum paciente encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medicações do Paciente */}
        <Card className="md:col-span-2">
          {selectedPatient ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedPatient.name}</CardTitle>
                    <CardDescription>
                      {selectedPatient.age} anos • Quarto {selectedPatient.room}, Leito {selectedPatient.bed} • {selectedPatient.healthInsurance}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <span className="text-sm text-muted-foreground mr-2">Assistente IA</span>
                    <Switch 
                      checked={showAIAssistant} 
                      onCheckedChange={() => {
                        const newState = !showAIAssistant
                        setShowAIAssistant(newState)
                        if (newState && aiSuggestions.length === 0) {
                          requestAIAnalysis()
                        }
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showAIAssistant && (
                  <Card className="mb-6 bg-primary/5 border-primary/20">
                    <CardHeader className="py-3">
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-primary" />
                        <CardTitle className="text-base">Assistente de IA - Análise Medicamentosa</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      {isAIAnalyzing ? (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Analisando medicações e condição do paciente...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {aiSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{suggestion}</p>
                            </div>
                          ))}
                          {aiSuggestions.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma sugestão disponível no momento.
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="py-2 flex justify-between">
                      <Button variant="link" className="text-xs p-0" onClick={requestAIAnalysis}>
                        Atualizar análise
                      </Button>
                      <Badge variant="outline" className="font-normal">
                        IA Prescritiva v1.0
                      </Badge>
                    </CardFooter>
                  </Card>
                )}
                
                <Tabs defaultValue="pendentes" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pendentes">
                      Pendentes ({pendingMedications.length})
                    </TabsTrigger>
                    <TabsTrigger value="administradas">
                      Administradas ({administeredMedications.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pendentes" className="mt-4">
                    {pendingMedications.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicação</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Via</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingMedications.map((medication) => (
                            <TableRow 
                              key={medication.id}
                              className={`cursor-pointer ${selectedMedication?.id === medication.id ? 'bg-muted' : ''}`}
                              onClick={() => handleMedicationSelect(medication)}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{medication.name}</p>
                                  <p className="text-sm text-muted-foreground">{medication.dosage} • {medication.frequency}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                  <span>{medication.nextDose || "Não agendado"}</span>
                                </div>
                              </TableCell>
                              <TableCell>{medication.route}</TableCell>
                              <TableCell>
                                {medication.needsAttention ? (
                                  <Badge variant="destructive">Atenção</Badge>
                                ) : (
                                  <Badge variant="outline">Pendente</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  Detalhes
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">Não há medicações pendentes</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="administradas" className="mt-4">
                    {administeredMedications.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicação</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Via</TableHead>
                            <TableHead>Administrado por</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {administeredMedications.map((medication) => (
                            <TableRow 
                              key={medication.id}
                              className="cursor-pointer"
                              onClick={() => handleMedicationSelect(medication)}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{medication.name}</p>
                                  <p className="text-sm text-muted-foreground">{medication.dosage} • {medication.frequency}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                                  <span>{medication.administeredAt}</span>
                                </div>
                              </TableCell>
                              <TableCell>{medication.route}</TableCell>
                              <TableCell>{medication.administeredBy}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  Relatório
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">Não há medicações administradas</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <div className="h-[450px] flex items-center justify-center flex-col p-6">
              <Pill className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum paciente selecionado</h3>
              <p className="text-center text-muted-foreground max-w-md">
                Selecione um paciente da lista para visualizar e gerenciar suas medicações
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Painel de Administração de Medicação */}
      {selectedMedication && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Administrar Medicação</CardTitle>
            <CardDescription>
              Complete o registro de administração da medicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Medicação</Label>
                  <div className="flex items-center mt-1 p-2 border rounded-md bg-muted/50">
                    <Pill className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">{selectedMedication.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMedication.dosage} • {selectedMedication.frequency} • {selectedMedication.route}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Paciente</Label>
                  <div className="flex items-center mt-1 p-2 border rounded-md bg-muted/50">
                    <div>
                      <p className="font-medium">{selectedPatient?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient?.age} anos • Quarto {selectedPatient?.room}, Leito {selectedPatient?.bed}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedMedication.interactions && selectedMedication.interactions.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Atenção</p>
                        <ul className="mt-1 space-y-1 text-sm text-amber-800">
                          {selectedMedication.interactions.map((interaction, index) => (
                            <li key={index}>• {interaction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-notes">Observações</Label>
                  <Textarea 
                    id="admin-notes"
                    placeholder="Registre observações relevantes sobre a administração..."
                    className="h-32"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label>Data e Hora</Label>
                  <div className="text-sm text-muted-foreground">
                    A medicação será registrada com a data e hora atuais
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedMedication(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAdministerMedication}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Administração
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 