'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePatients } from '@/contexts/PatientsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  UserPlus, 
  Search, 
  UploadCloud, 
  Calendar, 
  User, 
  FileText, 
  Phone, 
  MapPin, 
  List, 
  Clock, 
  Stethoscope, 
  Activity, 
  Pill, 
  TestTube,
  Thermometer
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Patient, MedicalRecord } from '@/types/patient'

export default function Patients() {
  const { user } = useAuth()
  const { 
    patients, 
    loading: patientsLoading, 
    getPatientHistory,
    getMedicalRecords 
  } = usePatients()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'cpf' | 'birth_date'>('cpf')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientHistory, setPatientHistory] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Função para carregar pacientes
  useEffect(() => {
    setIsLoading(patientsLoading)
    
    if (!patientsLoading) {
      setFilteredPatients(patients)
    }
  }, [patients, patientsLoading])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Função para buscar pacientes
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients)
      return
    }
    
    const filtered = patients.filter(patient => {
      if (searchType === 'cpf') {
        return patient.cpf.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))
      } else if (searchType === 'birth_date') {
        return patient.birth_date.includes(searchTerm)
      }
      return false
    })
    
    setFilteredPatients(filtered)
    if (filtered.length === 0) {
      toast.info('Nenhum paciente encontrado com os critérios informados')
    }
  }

  // Função para carregar histórico do paciente
  const loadPatientHistory = async (patient: Patient) => {
    try {
      setHistoryLoading(true)
      setSelectedPatient(patient)
      const records = await getMedicalRecords(patient.id)
      setPatientHistory(records)
    } catch (error) {
      console.error('Erro ao buscar histórico do paciente:', error)
      toast.error('Erro ao carregar histórico médico')
    } finally {
      setHistoryLoading(false)
    }
  }

  // Função para lidar com o upload de PDF
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF')
      return
    }
    
    // Aqui seria implementado o upload real para o servidor
    toast.success('Arquivo enviado com sucesso')
    setIsUploadDialogOpen(false)
  }

  // Função para navegar para a página de cadastro de novo paciente
  const handleNewPatient = () => {
    router.push('/reception')
  }

  const calculateAge = (birthDate: string) => {
    try {
      const birthDateObj = new Date(birthDate)
      const ageDifMs = Date.now() - birthDateObj.getTime()
      const ageDate = new Date(ageDifMs)
      return Math.abs(ageDate.getUTCFullYear() - 1970)
    } catch (error) {
      return 'N/A'
    }
  }

  const formatDate = (date: string) => {
    try {
      const dateObj = parseISO(date)
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
    } catch (error) {
      return date || 'Data desconhecida'
    }
  }

  if (isLoading) {
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">Gerencie seus pacientes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                Importar PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Importar Documentos</DialogTitle>
                <DialogDescription>
                  Faça upload de documentos PDF para o prontuário do paciente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patient" className="text-right">
                    Paciente
                  </Label>
                  <Input
                    id="patient"
                    placeholder="Digite o nome do paciente"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="document-type" className="text-right">
                    Tipo
                  </Label>
                  <Input
                    id="document-type"
                    placeholder="Tipo de documento"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file" className="text-right">
                    Arquivo
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enviar documento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button className="flex items-center gap-2" onClick={handleNewPatient}>
            <UserPlus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Busca de pacientes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
          <CardDescription>
            Encontre pacientes por CPF ou data de nascimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Tabs defaultValue="cpf" className="w-full" onValueChange={(value) => setSearchType(value as 'cpf' | 'birth_date')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cpf">CPF</TabsTrigger>
                  <TabsTrigger value="birth_date">Data de Nascimento</TabsTrigger>
                </TabsList>
                <TabsContent value="cpf">
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="text"
                      placeholder="Digite o CPF"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="birth_date">
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="date"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de pacientes */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Lista de Pacientes</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            {filteredPatients.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id ? 'bg-blue-100' : 'bg-white'
                    }`}
                    onClick={() => loadPatientHistory(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">{patient.full_name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                            {patient.birth_date} ({calculateAge(patient.birth_date)} anos)
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-1 text-blue-500" />
                            {patient.phone}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.status === 'completed' ? 'bg-green-100 text-green-800' :
                          patient.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          patient.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.status === 'completed' ? 'Concluído' :
                          patient.status === 'waiting' ? 'Aguardando' :
                          patient.status === 'in_progress' ? 'Em Atendimento' :
                          patient.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-xs text-gray-600">
                        Última atualização: {formatDate(patient.updated_at)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar que o clique propague para o div pai
                          localStorage.setItem('selectedPatient', JSON.stringify(patient));
                          router.push('/reception?openForm=true');
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Abrir Ficha
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Nenhum paciente encontrado
              </div>
            )}
          </div>
        </div>

        {/* Detalhes do paciente e histórico */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Informações do Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nome Completo</h3>
                      <p className="mt-1">{selectedPatient.full_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">CPF</h3>
                      <p className="mt-1">{selectedPatient.cpf}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Data de Nascimento</h3>
                      <p className="mt-1">{selectedPatient.birth_date} ({calculateAge(selectedPatient.birth_date)} anos)</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Gênero</h3>
                      <p className="mt-1">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                      <p className="mt-1">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cartão SUS</h3>
                      <p className="mt-1">{selectedPatient.sus_card || 'Não informado'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Estado Civil</h3>
                      <p className="mt-1">{selectedPatient.marital_status}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
                      <p className="mt-1">{selectedPatient.address || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Armazenar o paciente selecionado no localStorage para recuperá-lo na recepção
                        localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
                        router.push('/reception?openForm=true');
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Abrir Ficha
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="text-xl font-semibold mb-4">Histórico Médico</h2>
                
                {historyLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando histórico...</p>
                  </div>
                ) : patientHistory.length > 0 ? (
                  <div className="space-y-4">
                    {patientHistory.map((record, index) => (
                      <Card key={record.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              Consulta {patientHistory.length - index}
                            </CardTitle>
                            <span className="text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                          <CardDescription>
                            Médico: {record.doctor}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium flex items-center">
                                <Stethoscope className="w-4 h-4 mr-1" /> Diagnóstico
                              </h4>
                              <p className="mt-1 text-sm">{record.diagnosis}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium flex items-center">
                                <Activity className="w-4 h-4 mr-1" /> Sintomas
                              </h4>
                              <p className="mt-1 text-sm">{record.symptoms}</p>
                            </div>
                            
                            {record.prescriptions && record.prescriptions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium flex items-center">
                                  <Pill className="w-4 h-4 mr-1" /> Medicamentos
                                </h4>
                                <div className="mt-1 space-y-1">
                                  {record.prescriptions.map((prescription, idx) => (
                                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                      <span className="font-medium">{prescription.medication}</span> - {prescription.dosage}, {prescription.frequency}, {prescription.duration}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {record.exams && record.exams.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium flex items-center">
                                  <TestTube className="w-4 h-4 mr-1" /> Exames
                                </h4>
                                <div className="mt-1 space-y-1">
                                  {record.exams.map((exam, idx) => (
                                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                      <span className="font-medium">{exam.name}</span> - {exam.type === 'laboratory' ? 'Laboratório' : 'Imagem'}
                                      <div className="text-xs text-gray-500 mt-1">
                                        {exam.status === 'requested' ? 'Solicitado' : 
                                         exam.status === 'scheduled' ? 'Agendado' : 
                                         exam.status === 'performed' ? 'Realizado' : 'Cancelado'}
                                         {exam.requestDate && ` em ${new Date(exam.requestDate).toLocaleDateString()}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {record.notes && (
                              <div>
                                <h4 className="text-sm font-medium flex items-center">
                                  <FileText className="w-4 h-4 mr-1" /> Observações
                                </h4>
                                <p className="mt-1 text-sm">{record.notes}</p>
                              </div>
                            )}
                            
                            {record.nursingNotes && (
                              <div>
                                <h4 className="text-sm font-medium flex items-center text-blue-600">
                                  <Thermometer className="w-4 h-4 mr-1" /> Enfermagem
                                </h4>
                                <p className="mt-1 text-sm">{record.nursingNotes}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {record.nursingCompletedAt && `Atendido em ${new Date(record.nursingCompletedAt).toLocaleDateString()}`}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>Nenhum histórico médico encontrado para este paciente</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum paciente selecionado</h3>
                <p>Selecione um paciente da lista para visualizar seus detalhes e histórico médico</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 