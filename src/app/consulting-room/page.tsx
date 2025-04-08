'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePatients } from '@/contexts/PatientsContext'
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
import { Search, Stethoscope, ClipboardList, Pill, FileText, Upload, TestTube, CheckSquare, Tv } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Patient as BasePatient, PatientStatus } from '@/types/patient'

// Adicionar interface para Documento
interface Document {
  id: string;
  type: string;
  fileName: string;
  path: string;
  uploadDate: string;
  doctorName: string;
}

// Estender a interface Patient para adicionar documents
interface Patient extends BasePatient {
  documents?: Document[];
}

// Definir tipo para atualização do paciente que inclui documento
interface PatientUpdateWithDocuments {
  status?: PatientStatus;
  notes?: string;
  documents?: Document[];
}

export default function ConsultingRoom() {
  const { user, loading: authLoading } = useAuth()
  const { patients: basePatients, loading: patientsLoading, updatePatient } = usePatients()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState('consulta')
  const [loading, setLoading] = useState(false)
  
  // Converter os pacientes do context para o tipo estendido
  const patients = basePatients as Patient[]
  
  // Referências para arquivos
  const prescriptionFileRef = useRef<HTMLInputElement>(null)
  const medicalCertificateRef = useRef<HTMLInputElement>(null)
  const examReferralRef = useRef<HTMLInputElement>(null)
  
  const [consultForm, setConsultForm] = useState({
    diagnosis: '',
    prescription: '',
    observations: '',
    nextSteps: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const getTriageData = (patient: Patient | null, field: string): string => {
    if (!patient || !patient.notes || !patient.notes.includes('TRIAGE_DATA:')) {
      return '';
    }
    
    try {
      const triageDataJson = patient.notes.split('TRIAGE_DATA:')[1].split('\n\n')[0];
      const triageData = JSON.parse(triageDataJson);
      return triageData[field] || '';
    } catch (error) {
      console.error('Erro ao extrair dados da triagem:', error);
      return '';
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    
    // Extrair dados de triagem do campo notes
    let triageData: Record<string, any> = {}
    
    if (patient.notes && patient.notes.includes('TRIAGE_DATA:')) {
      try {
        const triageDataJson = patient.notes.split('TRIAGE_DATA:')[1].split('\n\n')[0]
        triageData = JSON.parse(triageDataJson)
      } catch (error) {
        console.error('Erro ao parsear dados da triagem:', error)
      }
    }
    
    setConsultForm({
      diagnosis: '',
      prescription: '',
      observations: triageData?.observations || '',
      nextSteps: ''
    })
    setActiveTab('consulta')
  }

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    try {
      setLoading(true)
      await updatePatient(selectedPatient.id, {
        status: 'completed' as PatientStatus,
        notes: selectedPatient.notes + `\n\nCONSULT_DATA:${JSON.stringify({
          diagnosis: consultForm.diagnosis,
          prescription: consultForm.prescription,
          observations: consultForm.observations,
          nextSteps: consultForm.nextSteps,
          consultationDate: new Date().toISOString()
        })}`
      })
      toast.success('Consulta finalizada com sucesso!')
      setSelectedPatient(null)
      setConsultForm({
        diagnosis: '',
        prescription: '',
        observations: '',
        nextSteps: ''
      })
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast.error('Erro ao finalizar consulta')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUploadFile = async (fileRef: React.RefObject<HTMLInputElement>, fileType: string) => {
    if (!fileRef.current?.files?.length) {
      toast.error(`Selecione um arquivo para upload`)
      return
    }
    
    const file = fileRef.current.files[0]
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser um PDF ou uma imagem')
      return
    }
    
    try {
      setLoading(true)
      
      if (!selectedPatient) return
      
      const fileExtension = file.name.split('.').pop()
      const fileName = `${fileType}_${selectedPatient.id}_${Date.now()}.${fileExtension}`
      
      // Verificar se o bucket existe e criar se necessário
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === 'medical_documents')
      
      if (!bucketExists) {
        await supabase.storage.createBucket('medical_documents', {
          public: false
        })
      }
      
      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from('medical_documents')
        .upload(`patients/${selectedPatient.id}/${fileName}`, file)
        
      if (error) throw error
      
      // Atualizar os dados do paciente com o registro do documento
      const documentType = 
        fileType === 'prescription' ? 'Receita médica' : 
        fileType === 'certificate' ? 'Atestado médico' : 'Encaminhamento para exame'
      
      const documents = selectedPatient?.documents || []
      const newDocument: Document = {
        id: Date.now().toString(),
        type: documentType,
        fileName,
        path: `patients/${selectedPatient.id}/${fileName}`,
        uploadDate: new Date().toISOString(),
        doctorName: user?.name || 'Médico'
      }
      
      await updatePatient(selectedPatient.id, {
        documents: [...documents, newDocument]
      } as PatientUpdateWithDocuments)
      
      toast.success(`${documentType} enviado(a) com sucesso`)
      
      // Limpar o input de arquivo
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    } catch (error) {
      console.error(`Erro ao enviar ${fileType}:`, error)
      toast.error(`Erro ao enviar arquivo`)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar pacientes em espera ou em atendimento
  const consultingRoomPatients = patients.filter(p => 
    // Pacientes que completaram a triagem e estão prontos para consulta
    (p.status === 'completed' && p.notes && p.notes.includes('TRIAGE_COMPLETED:true')) ||
    // Pacientes que já estão em consulta
    (p.status === 'in_progress' && p.notes && p.notes.includes('IN_CONSULTATION:true'))
  )
  
  const filteredPatients = consultingRoomPatients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStartConsultation = async (patientId: string) => {
    try {
      setLoading(true)
      const patient = patients.find(p => p.id === patientId)
      if (!patient) return
      
      // Adicionar marcador de consulta em andamento
      await updatePatient(patientId, { 
        status: 'in_progress' as PatientStatus,
        notes: (patient.notes || '') + '\nIN_CONSULTATION:true'
      })
      
      // Atualizar o paciente selecionado se ele já estiver selecionado
      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient({
          ...selectedPatient, 
          status: 'in_progress' as PatientStatus,
          notes: (selectedPatient.notes || '') + '\nIN_CONSULTATION:true'
        })
      }
      
      toast.success('Consulta iniciada')
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error)
      toast.error('Erro ao iniciar consulta')
    } finally {
      setLoading(false)
    }
  }

  const handleEndConsultation = async () => {
    if (!selectedPatient) return

    try {
      setLoading(true)
      await updatePatient(selectedPatient.id, {
        status: 'completed' as PatientStatus,
        notes: selectedPatient.notes + `\n\nCONSULT_DATA:${JSON.stringify({
          diagnosis: consultForm.diagnosis,
          prescription: consultForm.prescription,
          observations: consultForm.observations,
          nextSteps: consultForm.nextSteps,
          consultationDate: new Date().toISOString()
        })}`
      })
      toast.success('Consulta finalizada com sucesso!')
      setSelectedPatient(null)
      setConsultForm({
        diagnosis: '',
        prescription: '',
        observations: '',
        nextSteps: ''
      })
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast.error('Erro ao finalizar consulta')
    } finally {
      setLoading(false)
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultório Médico</h1>
          <p className="text-gray-600 mt-1">Atendimento médico e condutas</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/tv')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Tv className="w-4 h-4 mr-2" />
            Painel TV
          </Button>
          {selectedPatient && (
            <Button
              onClick={() => handleEndConsultation()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Finalizar Consulta
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Pacientes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Pacientes em Espera</CardTitle>
            <CardDescription>
              Pacientes que já passaram pela triagem
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
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <h3 className="font-medium">{patient.full_name}</h3>
                  <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600">
                      {new Date(patient.birth_date).toLocaleDateString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      patient.status === 'in_progress' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {patient.status === 'in_progress' ? 'Em consulta' : 'Aguardando'}
                    </span>
                  </div>
                  {(patient.status === 'completed' && patient.notes && patient.notes.includes('TRIAGE_COMPLETED:true') && !patient.notes.includes('IN_CONSULTATION:true')) && (
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700 text-xs" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConsultation(patient.id);
                        }}
                      >
                        Iniciar Consulta
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Nenhum paciente aguardando consulta
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Consulta */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Consulta Médica</CardTitle>
            <CardDescription>
              {selectedPatient
                ? `Atendendo ${selectedPatient.full_name}`
                : 'Selecione um paciente para iniciar a consulta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="consulta">Consulta</TabsTrigger>
                  <TabsTrigger value="receita">Receitas</TabsTrigger>
                  <TabsTrigger value="atestado">Atestados</TabsTrigger>
                  <TabsTrigger value="exames">Exames</TabsTrigger>
                </TabsList>
                
                <TabsContent value="consulta">
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                    {/* Dados da Triagem - Versão aprimorada */}
                    <Card className="border-blue-200 bg-blue-50 shadow-sm">
                      <CardHeader className="pb-2 border-b border-blue-200">
                        <CardTitle className="text-md font-medium text-blue-800">
                      Dados da Triagem
                    </CardTitle>
                  </CardHeader>
                      <CardContent className="pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Sinais Vitais */}
                          <div className="space-y-2 rounded-lg bg-white p-3 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900">Sinais Vitais</h3>
                            <div className="grid grid-cols-2 gap-1">
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">Pressão:</span> <span className="text-gray-900 font-semibold">{getTriageData(selectedPatient, 'bloodPressure')}</span>
                              </p>
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">FC:</span> <span className="text-gray-900 font-semibold">{getTriageData(selectedPatient, 'heartRate')} bpm</span>
                              </p>
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">Temp:</span> <span className="text-gray-900 font-semibold">{getTriageData(selectedPatient, 'temperature')}°C</span>
                              </p>
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">SpO2:</span> <span className="text-gray-900 font-semibold">{getTriageData(selectedPatient, 'oxygenSaturation') || "-"}%</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Medidas Antropométricas */}
                          <div className="space-y-2 rounded-lg bg-white p-3 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900">Antropometria</h3>
                            <div className="grid grid-cols-2 gap-1">
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">Peso:</span> <span className="text-gray-900 font-semibold">{getTriageData(selectedPatient, 'weight')} kg</span>
                              </p>
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">Altura:</span> <span className="text-gray-900 font-semibold">{getTriageData(selectedPatient, 'height')} m</span>
                              </p>
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">IMC:</span> <span className="text-gray-900 font-semibold">
                                  {(() => {
                                    const weight = parseFloat(getTriageData(selectedPatient, 'weight') || "0");
                                    const height = parseFloat(getTriageData(selectedPatient, 'height') || "0");
                                    return weight && height ? (weight / (height * height)).toFixed(1) : "-";
                                  })()}
                                </span>
                              </p>
                              <p className="text-sm border-b pb-1">
                                <span className="font-medium text-gray-700">Dor:</span> <span className="text-gray-900 font-semibold">{getTriageData(selectedPatient, 'painLevel') || "0"}/10</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Queixa e Sintomas */}
                          <div className="space-y-2 rounded-lg bg-white p-3 shadow-sm md:col-span-1">
                            <h3 className="text-sm font-semibold text-gray-900">Queixa/Sintomas</h3>
                            <p className="text-sm min-h-[60px] bg-yellow-50 p-2 rounded text-gray-900">
                              {getTriageData(selectedPatient, 'symptoms') || "Sem registro de sintomas"}
                            </p>
                          </div>
                        </div>

                        {/* Observações de triagem */}
                        <div className="mt-3 rounded-lg bg-white p-3 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">Observações da Triagem</h3>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {getTriageData(selectedPatient, 'observations') || "Sem observações registradas"}
                          </p>
                        </div>
                  </CardContent>
                </Card>

                {/* Formulário da Consulta */}
                <div>
                      <label className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-700" />
                    Diagnóstico
                  </label>
                  <textarea
                        className="w-full mt-1 rounded-md border border-blue-200 px-3 py-2 text-sm min-h-[80px] focus:border-blue-400 focus:ring-blue-400 text-gray-900"
                    placeholder="Digite o diagnóstico do paciente"
                    value={consultForm.diagnosis}
                    onChange={(e) =>
                      setConsultForm(prev => ({
                        ...prev,
                        diagnosis: e.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div>
                      <label className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-green-700" />
                    Prescrição
                  </label>
                  <textarea
                        className="w-full mt-1 rounded-md border border-green-200 px-3 py-2 text-sm min-h-[120px] focus:border-green-400 focus:ring-green-400 text-gray-900"
                    placeholder="Digite a prescrição médica"
                    value={consultForm.prescription}
                    onChange={(e) =>
                      setConsultForm(prev => ({
                        ...prev,
                        prescription: e.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div>
                      <label className="text-sm font-medium text-purple-800 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-purple-700" />
                    Observações e Recomendações
                  </label>
                  <textarea
                        className="w-full mt-1 rounded-md border border-purple-200 px-3 py-2 text-sm min-h-[80px] focus:border-purple-400 focus:ring-purple-400 text-gray-900"
                    placeholder="Observações adicionais e recomendações"
                    value={consultForm.observations}
                    onChange={(e) =>
                      setConsultForm(prev => ({
                        ...prev,
                        observations: e.target.value
                      }))
                    }
                  />
                </div>

                <div>
                      <label className="text-sm font-medium text-orange-800 flex items-center gap-2">
                        <TestTube className="w-4 h-4 text-orange-700" />
                    Próximos Passos
                  </label>
                  <textarea
                        className="w-full mt-1 rounded-md border border-orange-200 px-3 py-2 text-sm min-h-[80px] focus:border-orange-400 focus:ring-orange-400 text-gray-900"
                    placeholder="Encaminhamentos, exames ou retorno"
                    value={consultForm.nextSteps}
                    onChange={(e) =>
                      setConsultForm(prev => ({
                        ...prev,
                        nextSteps: e.target.value
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Processando...' : 'Finalizar Consulta'}
                  </Button>
                </div>
              </form>
                </TabsContent>
                
                <TabsContent value="receita">
                  <div className="space-y-6">
                    <Card className="border-green-200 bg-green-50 shadow-sm">
                      <CardHeader className="pb-2 border-b border-green-200">
                        <CardTitle className="text-lg text-green-800">Receitas Médicas</CardTitle>
                        <CardDescription className="text-green-700">
                          Envie um PDF com a receita médica para o paciente
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-3">
                        <div className="rounded-lg bg-white p-3 shadow-sm">
                          <label className="text-sm font-medium text-green-800 flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-green-700" />
                            Receita Médica (PDF ou Imagem)
                          </label>
                          <Input
                            ref={prescriptionFileRef}
                            type="file"
                            accept=".pdf,image/*"
                            className="mb-2 border-green-200 focus:border-green-400 focus:ring-green-400 text-gray-900"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUploadFile(prescriptionFileRef, 'prescription')}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {loading ? 'Enviando...' : 'Enviar Receita'}
                          </Button>
                        </div>
                        
                        {/* Lista de receitas já enviadas */}
                        {selectedPatient?.documents && selectedPatient.documents.filter((doc: Document) => doc.type === 'Receita médica').length > 0 ? (
                          <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                            <h3 className="text-sm font-semibold text-green-700 mb-2">Receitas anteriores:</h3>
                            <div className="space-y-2">
                              {selectedPatient.documents
                                .filter((doc: Document) => doc.type === 'Receita médica')
                                .map((doc: Document, index: number) => (
                                  <div key={index} className="text-xs p-2 border border-green-100 rounded flex justify-between items-center bg-green-50">
                                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    <Button variant="outline" size="sm" className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-100">
                                      Visualizar
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2 p-3 bg-white rounded-lg shadow-sm italic">Nenhuma receita anterior registrada</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="atestado">
                  <div className="space-y-6">
                    <Card className="border-purple-200 bg-purple-50 shadow-sm">
                      <CardHeader className="pb-2 border-b border-purple-200">
                        <CardTitle className="text-lg text-purple-800">Atestados Médicos</CardTitle>
                        <CardDescription className="text-purple-700">
                          Envie um PDF com o atestado médico para o paciente
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-3">
                        <div className="rounded-lg bg-white p-3 shadow-sm">
                          <label className="text-sm font-medium text-purple-800 flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-purple-700" />
                            Atestado Médico (PDF ou Imagem)
                          </label>
                          <Input
                            ref={medicalCertificateRef}
                            type="file"
                            accept=".pdf,image/*"
                            className="mb-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 text-gray-900"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUploadFile(medicalCertificateRef, 'certificate')}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {loading ? 'Enviando...' : 'Enviar Atestado'}
                          </Button>
                        </div>
                        
                        {/* Lista de atestados já enviados */}
                        {selectedPatient?.documents && selectedPatient.documents.filter((doc: Document) => doc.type === 'Atestado médico').length > 0 ? (
                          <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                            <h3 className="text-sm font-semibold text-purple-700 mb-2">Atestados anteriores:</h3>
                            <div className="space-y-2">
                              {selectedPatient.documents
                                .filter((doc: Document) => doc.type === 'Atestado médico')
                                .map((doc: Document, index: number) => (
                                  <div key={index} className="text-xs p-2 border border-purple-100 rounded flex justify-between items-center bg-purple-50">
                                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    <Button variant="outline" size="sm" className="h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-100">
                                      Visualizar
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2 p-3 bg-white rounded-lg shadow-sm italic">Nenhum atestado anterior registrado</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="exames">
                  <div className="space-y-6">
                    <Card className="border-orange-200 bg-orange-50 shadow-sm">
                      <CardHeader className="pb-2 border-b border-orange-200">
                        <CardTitle className="text-lg text-orange-800">Encaminhamento para Exames</CardTitle>
                        <CardDescription className="text-orange-700">
                          Envie um PDF com o encaminhamento para exames
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-3">
                        <div className="rounded-lg bg-white p-3 shadow-sm">
                          <label className="text-sm font-medium text-orange-800 flex items-center gap-2 mb-2">
                            <TestTube className="w-4 h-4 text-orange-700" />
                            Solicitação de Exame (PDF ou Imagem)
                          </label>
                          <Input
                            ref={examReferralRef}
                            type="file"
                            accept=".pdf,image/*"
                            className="mb-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 text-gray-900"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUploadFile(examReferralRef, 'exam')}
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {loading ? 'Enviando...' : 'Enviar Pedido de Exame'}
                          </Button>
                        </div>
                        
                        {/* Lista de encaminhamentos já enviados */}
                        {selectedPatient?.documents && selectedPatient.documents.filter((doc: Document) => doc.type === 'Encaminhamento para exame').length > 0 ? (
                          <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                            <h3 className="text-sm font-semibold text-orange-700 mb-2">Exames anteriores:</h3>
                            <div className="space-y-2">
                              {selectedPatient.documents
                                .filter((doc: Document) => doc.type === 'Encaminhamento para exame')
                                .map((doc: Document, index: number) => (
                                  <div key={index} className="text-xs p-2 border border-orange-100 rounded flex justify-between items-center bg-orange-50">
                                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    <Button variant="outline" size="sm" className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-100">
                                      Visualizar
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2 p-3 bg-white rounded-lg shadow-sm italic">Nenhuma solicitação de exame anterior registrada</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Stethoscope className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum paciente selecionado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione um paciente da lista ao lado para iniciar a consulta médica.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 