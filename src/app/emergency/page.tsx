'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Clock,
  AlertTriangle,
  Plus,
  FileText,
  Pencil,
  Trash2,
  Share2,
  Activity,
  Stethoscope,
  Timer,
  MessageCircle
} from 'lucide-react'

// Dados simulados
const initialPatients = [
  {
    id: 1,
    name: 'Maria Silva',
    age: 45,
    arrivalTime: '2024-03-15T14:30:00',
    waitingTime: 25,
    riskLevel: 'red',
    mainComplaint: 'Dor no peito intensa',
    status: 'waiting',
    vitals: {
      pressure: '140/90',
      temperature: 37.2,
      heartRate: 95,
      oxygenation: 96
    }
  },
  {
    id: 2,
    name: 'José Santos',
    age: 32,
    arrivalTime: '2024-03-15T14:45:00',
    waitingTime: 10,
    riskLevel: 'yellow',
    mainComplaint: 'Fratura no braço',
    status: 'in_triage',
    vitals: {
      pressure: '120/80',
      temperature: 36.8,
      heartRate: 82,
      oxygenation: 98
    }
  },
  {
    id: 3,
    name: 'Ana Oliveira',
    age: 28,
    arrivalTime: '2024-03-15T15:00:00',
    waitingTime: 5,
    riskLevel: 'green',
    mainComplaint: 'Dor de cabeça',
    status: 'waiting',
    vitals: {
      pressure: '110/70',
      temperature: 36.5,
      heartRate: 75,
      oxygenation: 99
    }
  }
]

const riskLevels = {
  red: {
    name: 'Emergência',
    color: 'text-red-600 bg-red-100',
    maxWaitTime: 0
  },
  orange: {
    name: 'Muito Urgente',
    color: 'text-orange-600 bg-orange-100',
    maxWaitTime: 10
  },
  yellow: {
    name: 'Urgente',
    color: 'text-yellow-600 bg-yellow-100',
    maxWaitTime: 60
  },
  green: {
    name: 'Pouco Urgente',
    color: 'text-green-600 bg-green-100',
    maxWaitTime: 120
  },
  blue: {
    name: 'Não Urgente',
    color: 'text-blue-600 bg-blue-100',
    maxWaitTime: 240
  }
}

export default function Emergency() {
  const [patients, setPatients] = useState(initialPatients)
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  const [isTriageOpen, setIsTriageOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Indicadores
  const indicators = {
    totalPatients: patients.length,
    inEmergency: patients.filter(p => p.riskLevel === 'red').length,
    waitingTriage: patients.filter(p => p.status === 'waiting').length,
    avgWaitingTime: Math.round(
      patients.reduce((acc, p) => acc + p.waitingTime, 0) / patients.length
    )
  }

  const handleNewPatient = () => {
    setSelectedPatient({
      id: Math.max(...patients.map(p => p.id)) + 1,
      name: '',
      age: '',
      arrivalTime: new Date().toISOString(),
      waitingTime: 0,
      riskLevel: '',
      mainComplaint: '',
      status: 'waiting',
      vitals: {
        pressure: '',
        temperature: '',
        heartRate: '',
        oxygenation: ''
      }
    })
    setIsNewPatientOpen(true)
  }

  const handleTriage = (patient: any) => {
    setSelectedPatient(patient)
    setIsTriageOpen(true)
  }

  const handleShare = (patient: any) => {
    setSelectedPatient(patient)
    setIsShareOpen(true)
  }

  const handleSaveTriage = () => {
    setPatients(prev => 
      prev.map(p => 
        p.id === selectedPatient.id ? {
          ...selectedPatient,
          status: 'triaged'
        } : p
      )
    )
    setIsTriageOpen(false)
  }

  const handleShareAccess = () => {
    // Implementar compartilhamento via WhatsApp
    const message = `Acompanhamento do paciente ${selectedPatient.name}:\nNível de Risco: ${riskLevels[selectedPatient.riskLevel as keyof typeof riskLevels].name}\nTempo de Espera: ${selectedPatient.waitingTime} minutos`
    console.log('Compartilhando acesso:', message)
    setIsShareOpen(false)
  }

  const getRiskLevelStyle = (level: string) => {
    return riskLevels[level as keyof typeof riskLevels]?.color || 'text-gray-600 bg-gray-100'
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando'
      case 'in_triage':
        return 'Em Triagem'
      case 'triaged':
        return 'Triado'
      case 'in_service':
        return 'Em Atendimento'
      default:
        return status
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pronto Socorro</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.totalPatients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emergências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {indicators.inEmergency}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Triagem</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.waitingTriage}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Espera</CardTitle>
            <Timer className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {indicators.avgWaitingTime} min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar paciente..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewPatient}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Tabela de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Chegada</TableHead>
                <TableHead>Espera</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age} anos</TableCell>
                  <TableCell>{new Date(patient.arrivalTime).toLocaleTimeString()}</TableCell>
                  <TableCell>{patient.waitingTime} min</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelStyle(patient.riskLevel)}`}>
                      {riskLevels[patient.riskLevel as keyof typeof riskLevels]?.name}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusText(patient.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTriage(patient)}
                        title="Triagem"
                      >
                        <Stethoscope className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleShare(patient)}
                        title="Compartilhar"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Novo Paciente */}
      <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="col-span-3"
                value={selectedPatient?.name}
                onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                className="col-span-3"
                value={selectedPatient?.age}
                onChange={(e) => setSelectedPatient({...selectedPatient, age: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mainComplaint">Queixa Principal</Label>
              <Input
                id="mainComplaint"
                className="col-span-3"
                value={selectedPatient?.mainComplaint}
                onChange={(e) => setSelectedPatient({...selectedPatient, mainComplaint: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPatientOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              setPatients(prev => [...prev, selectedPatient])
              setIsNewPatientOpen(false)
            }}>
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Triagem */}
      <Dialog open={isTriageOpen} onOpenChange={setIsTriageOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Triagem - Protocolo Manchester</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Paciente</Label>
              <div className="col-span-3">{selectedPatient?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pressure">Pressão Arterial</Label>
              <Input
                id="pressure"
                className="col-span-3"
                value={selectedPatient?.vitals.pressure}
                onChange={(e) => setSelectedPatient({
                  ...selectedPatient,
                  vitals: {...selectedPatient.vitals, pressure: e.target.value}
                })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temperature">Temperatura</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                className="col-span-3"
                value={selectedPatient?.vitals.temperature}
                onChange={(e) => setSelectedPatient({
                  ...selectedPatient,
                  vitals: {...selectedPatient.vitals, temperature: parseFloat(e.target.value)}
                })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="heartRate">Frequência Cardíaca</Label>
              <Input
                id="heartRate"
                type="number"
                className="col-span-3"
                value={selectedPatient?.vitals.heartRate}
                onChange={(e) => setSelectedPatient({
                  ...selectedPatient,
                  vitals: {...selectedPatient.vitals, heartRate: parseInt(e.target.value)}
                })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="oxygenation">Saturação O2</Label>
              <Input
                id="oxygenation"
                type="number"
                className="col-span-3"
                value={selectedPatient?.vitals.oxygenation}
                onChange={(e) => setSelectedPatient({
                  ...selectedPatient,
                  vitals: {...selectedPatient.vitals, oxygenation: parseInt(e.target.value)}
                })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="riskLevel">Classificação de Risco</Label>
              <select
                id="riskLevel"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedPatient?.riskLevel}
                onChange={(e) => setSelectedPatient({...selectedPatient, riskLevel: e.target.value})}
              >
                <option value="">Selecione o nível de risco</option>
                <option value="red">Vermelho - Emergência</option>
                <option value="orange">Laranja - Muito Urgente</option>
                <option value="yellow">Amarelo - Urgente</option>
                <option value="green">Verde - Pouco Urgente</option>
                <option value="blue">Azul - Não Urgente</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTriageOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveTriage}>Salvar Triagem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Acompanhamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm text-gray-500">
                O familiar receberá atualizações sobre o status do atendimento
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareOpen(false)}>Cancelar</Button>
            <Button onClick={handleShareAccess}>Compartilhar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 