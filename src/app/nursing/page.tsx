'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePatients } from '@/contexts/PatientsContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Activity, Syringe, ClipboardList, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { MedicalRecord, Patient } from '@/types/patient'

interface Procedure {
  id: string
  name: string
  description: string
  status: 'pending' | 'completed'
  time?: string
}

export default function Nursing() {
  const { user } = useAuth()
  const { 
    getMedicalRecordsForNursing, 
    getPatient, 
    updatePatient,
    addMedicalRecord,
    loading: patientsLoading 
  } = usePatients()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [nursingForm, setNursingForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    observations: '',
    newProcedure: '',
    newMedication: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchMedicalRecordsForNursing = async () => {
      try {
        setLoading(true)
        const records = await getMedicalRecordsForNursing()
        setMedicalRecords(records)
      } catch (error) {
        console.error('Erro ao buscar prontuários médicos:', error)
        toast.error('Erro ao buscar prontuários médicos')
      } finally {
        setLoading(false)
      }
    }

    fetchMedicalRecordsForNursing()
  }, [user, router, getMedicalRecordsForNursing])

  const handlePatientSelect = async (record: MedicalRecord) => {
    setSelectedRecord(record)
    
    // Buscar paciente usando o patientId do registro médico
    const patient = getPatient(record.patientId)
    if (patient) {
      setSelectedPatient(patient)
    }
    
    // Gera procedimentos baseados nas prescrições médicas
    if (record.prescriptions && record.prescriptions.length > 0) {
      const medications = record.prescriptions.map((prescription, index) => ({
        id: `med-${index}`,
        name: `${prescription.medication} - ${prescription.dosage} - ${prescription.frequency} - ${prescription.duration}`,
        description: prescription.notes || 'Administrar medicação conforme prescrição',
        status: 'pending' as const
      }))

      setProcedures(medications)
    }

    setNursingForm({
      bloodPressure: patient?.vital_signs?.bloodPressure ? `${patient.vital_signs.bloodPressure.systolic}/${patient.vital_signs.bloodPressure.diastolic}` : '',
      heartRate: patient?.vital_signs?.heartRate ? `${patient.vital_signs.heartRate}` : '',
      temperature: patient?.vital_signs?.temperature ? `${patient.vital_signs.temperature}` : '',
      observations: '',
      newProcedure: '',
      newMedication: ''
    })
  }

  const handleAddProcedure = () => {
    if (!nursingForm.newProcedure.trim()) return

    setProcedures(prev => [
      ...prev,
      {
        id: `proc-${Date.now()}`,
        name: nursingForm.newProcedure,
        description: 'Procedimento adicional',
        status: 'pending'
      }
    ])

    setNursingForm(prev => ({ ...prev, newProcedure: '' }))
  }

  const handleCompleteProcedure = (procedureId: string) => {
    setProcedures(prev =>
      prev.map(p =>
        p.id === procedureId
          ? { ...p, status: 'completed', time: new Date().toLocaleTimeString() }
          : p
      )
    )
    toast.success('Procedimento registrado com sucesso!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !selectedRecord) return

    try {
      setLoading(true)
      
      // Atualizar o registro médico como atendido pela enfermagem
      await addMedicalRecord(selectedPatient.id, {
        ...selectedRecord,
        sentToNursing: false, // Marcar como já atendido
        nursingNotes: nursingForm.observations,
        nursingCompletedAt: new Date().toISOString(),
        nursingProcedures: procedures.map(p => ({
          name: p.name,
          status: p.status,
          completedAt: p.time
        }))
      })
      
      // Atualizar os sinais vitais do paciente
      await updatePatient(selectedPatient.id, {
        vital_signs: {
          ...selectedPatient.vital_signs,
          bloodPressure: {
            systolic: parseInt(nursingForm.bloodPressure.split('/')[0] || '0'),
            diastolic: parseInt(nursingForm.bloodPressure.split('/')[1] || '0'),
          },
          heartRate: parseInt(nursingForm.heartRate || '0'),
          temperature: parseFloat(nursingForm.temperature || '0'),
          measuredAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      
      toast.success('Atendimento de enfermagem registrado com sucesso!')
      
      // Atualizar a lista de registros médicos
      const updatedRecords = medicalRecords.filter(
        record => record.id !== selectedRecord.id
      )
      setMedicalRecords(updatedRecords)
      
      // Limpar o formulário
      setSelectedRecord(null)
      setSelectedPatient(null)
      setProcedures([])
      setNursingForm({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        observations: '',
        newProcedure: '',
        newMedication: ''
      })
    } catch (error) {
      console.error('Erro ao finalizar atendimento de enfermagem:', error)
      toast.error('Erro ao finalizar atendimento')
    } finally {
      setLoading(false)
    }
  }

  if (loading || patientsLoading) {
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

  const filteredRecords = medicalRecords.filter(record => {
    const patient = getPatient(record.patientId)
    return patient && patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enfermagem</h1>
          <p className="text-gray-600">Gerenciamento de cuidados de enfermagem</p>
        </div>

        <div className="flex items-center mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar paciente..."
              className="pl-10 pr-4 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center text-blue-700">
              <Activity className="mr-2" /> Medicações Pendentes
            </CardTitle>
            <CardDescription>
              Pacientes com medicações a serem administradas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold">{medicalRecords.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center text-green-700">
              <Syringe className="mr-2" /> Medicações Realizadas
            </CardTitle>
            <CardDescription>
              Total de medicações administradas hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold">
              {procedures.filter(p => p.status === 'completed').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center text-purple-700">
              <ClipboardList className="mr-2" /> Procedimentos
            </CardTitle>
            <CardDescription>
              Procedimentos realizados hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold">
              {procedures.filter(p => p.status === 'completed' && !p.id.startsWith('med-')).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Prontuários Pendentes</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredRecords.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prescrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => {
                    const patient = getPatient(record.patientId)
                    return (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {patient?.full_name || 'Paciente não encontrado'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(record.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.doctor}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {record.prescriptions && record.prescriptions.length > 0 ? (
                              <div className="max-h-20 overflow-y-auto">
                                {record.prescriptions.map((prescription, i) => (
                                  <div key={i}>
                                    {prescription.medication} - {prescription.dosage}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">Sem prescrição</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            size="sm" 
                            onClick={() => handlePatientSelect(record)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Atender
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Nenhum paciente encontrado com prescrições médicas pendentes
              </div>
            )}
          </div>
        </div>

        {selectedPatient && selectedRecord && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Administração de Medicações</h2>
            <Card>
              <CardHeader className="border-b">
                <CardTitle>{selectedPatient.full_name}</CardTitle>
                <CardDescription>
                  Diagnóstico: {selectedRecord.diagnosis}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Informações Clínicas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Sintomas</h4>
                          <p className="text-gray-600">{selectedRecord.symptoms || 'Não informado'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Observações</h4>
                          <p className="text-gray-600">{selectedRecord.notes || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Sinais Vitais</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="form-control">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pressão Arterial</label>
                          <div className="flex items-center">
                            <Heart className="mr-2 text-red-500" size={18} />
                            <Input 
                              type="text" 
                              placeholder="Ex: 120/80"
                              value={nursingForm.bloodPressure}
                              onChange={(e) => setNursingForm({...nursingForm, bloodPressure: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="form-control">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Frequência Cardíaca</label>
                          <Input 
                            type="text" 
                            placeholder="Ex: 80"
                            value={nursingForm.heartRate}
                            onChange={(e) => setNursingForm({...nursingForm, heartRate: e.target.value})}
                          />
                        </div>
                        <div className="form-control">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
                          <Input 
                            type="text" 
                            placeholder="Ex: 36.5"
                            value={nursingForm.temperature}
                            onChange={(e) => setNursingForm({...nursingForm, temperature: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Medicações e Procedimentos</h3>
                      
                      <div className="mb-4 overflow-x-auto">
                        <table className="w-full min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left py-2 px-4 border">Procedimento</th>
                              <th className="text-left py-2 px-4 border">Status</th>
                              <th className="text-left py-2 px-4 border">Ação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {procedures.map((proc) => (
                              <tr key={proc.id} className="border-t">
                                <td className="py-2 px-4 border">{proc.name}</td>
                                <td className="py-2 px-4 border">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${proc.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {proc.status === 'completed' ? `Concluído ${proc.time}` : 'Pendente'}
                                  </span>
                                </td>
                                <td className="py-2 px-4 border">
                                  {proc.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleCompleteProcedure(proc.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Registrar
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {procedures.length === 0 && (
                              <tr>
                                <td colSpan={3} className="py-4 px-4 text-center text-gray-500 border">
                                  Nenhum procedimento ou medicação prescrita
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <Input 
                          type="text" 
                          placeholder="Adicionar novo procedimento"
                          value={nursingForm.newProcedure}
                          onChange={(e) => setNursingForm({...nursingForm, newProcedure: e.target.value})}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddProcedure}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações de Enfermagem</label>
                      <textarea 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none"
                        rows={4}
                        placeholder="Registre suas observações aqui..."
                        value={nursingForm.observations}
                        onChange={(e) => setNursingForm({...nursingForm, observations: e.target.value})}
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setSelectedRecord(null)
                          setSelectedPatient(null)
                          setProcedures([])
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={procedures.some(p => p.status === 'pending') || loading}
                      >
                        {loading ? 'Processando...' : 'Finalizar Atendimento'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 