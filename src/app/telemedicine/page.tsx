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
  Video,
  Phone,
  Play,
  Pause,
  FileText,
  MessageCircle,
  Users,
  Brain,
  Clock,
  AlertCircle,
  Bot
} from 'lucide-react'

// Dados simulados
const initialConsultations = [
  {
    id: 1,
    patient: 'João Silva',
    doctor: 'Dr. Carlos Silva',
    date: '2024-03-15T10:00:00',
    status: 'waiting',
    type: 'primeira_consulta'
  },
  {
    id: 2,
    patient: 'Maria Santos',
    doctor: 'Dra. Ana Santos',
    date: '2024-03-15T10:30:00',
    status: 'in_progress',
    type: 'retorno'
  }
]

export default function Telemedicine() {
  const [consultations, setConsultations] = useState(initialConsultations)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false)
  const [isConsultationRoomOpen, setIsConsultationRoomOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)

  // Indicadores
  const indicators = {
    waitingPatients: consultations.filter(c => c.status === 'waiting').length,
    inProgress: consultations.filter(c => c.status === 'in_progress').length,
    totalToday: consultations.filter(c => 
      new Date(c.date).toDateString() === new Date().toDateString()
    ).length,
    averageWaitTime: '12 min'
  }

  const handleStartConsultation = (consultation: any) => {
    setSelectedConsultation(consultation)
    setIsConsultationRoomOpen(true)
  }

  const handleToggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const handleEndConsultation = () => {
    setIsConsultationRoomOpen(false)
    // Implementar finalização da consulta
  }

  const getConsultationStatus = (status: string) => {
    switch (status) {
      case 'waiting':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          text: 'Aguardando'
        }
      case 'in_progress':
        return {
          color: 'text-green-600 bg-green-100',
          text: 'Em Andamento'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          text: status
        }
    }
  }

  const filteredConsultations = consultations.filter(consultation =>
    consultation.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Telemedicina</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Aguardando</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.waitingPatients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Atendimento</CardTitle>
            <Video className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {indicators.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {indicators.totalToday}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Espera</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {indicators.averageWaitTime}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar consulta..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsNewConsultationOpen(true)}>
            <Video className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Lista de Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => {
                const status = getConsultationStatus(consultation.status)
                return (
                  <TableRow key={consultation.id}>
                    <TableCell>{consultation.patient}</TableCell>
                    <TableCell>{consultation.doctor}</TableCell>
                    <TableCell>
                      {new Date(consultation.date).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      {consultation.type === 'primeira_consulta' ? 'Primeira Consulta' : 'Retorno'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                        {status.text}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartConsultation(consultation)}
                          disabled={consultation.status === 'in_progress'}
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Nova Consulta */}
      <Dialog open={isNewConsultationOpen} onOpenChange={setIsNewConsultationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Consulta</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient">Paciente</Label>
              <Input
                id="patient"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor">Médico</Label>
              <Input
                id="doctor"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date">Data/Hora</Label>
              <Input
                id="date"
                type="datetime-local"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="primeira_consulta">Primeira Consulta</option>
                <option value="retorno">Retorno</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewConsultationOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsNewConsultationOpen(false)}>Agendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sala de Consulta */}
      <Dialog open={isConsultationRoomOpen} onOpenChange={setIsConsultationRoomOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Consulta - {selectedConsultation?.patient}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Área de Vídeo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            {/* Controles */}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleToggleRecording}>
                {isRecording ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar Gravação
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Gravação
                  </>
                )}
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                Transcrição IA
              </Button>
            </div>

            {/* Histórico e Notas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Histórico do Paciente</h4>
                <div className="bg-gray-50 p-4 rounded-lg h-48 overflow-y-auto">
                  <ul className="space-y-2">
                    <li className="text-sm">Última consulta: 15/02/2024</li>
                    <li className="text-sm">Pressão: 120/80</li>
                    <li className="text-sm">Medicações: Losartana 50mg</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Notas da Consulta</h4>
                <textarea
                  className="w-full h-48 p-4 rounded-lg border border-input bg-background resize-none"
                  placeholder="Digite suas anotações..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEndConsultation}>
              Encerrar Consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 