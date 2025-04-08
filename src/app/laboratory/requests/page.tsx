"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  Plus,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react'

interface ExamRequest {
  id: string
  patientName: string
  patientId: string
  requestDate: string
  priority: 'normal' | 'urgent' | 'emergency'
  status: 'pending' | 'collected' | 'in_analysis' | 'completed'
  examType: string
  requestedBy: string
  department: string
}

export default function LaboratoryRequests() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dados mockados para exemplo
  const examRequests: ExamRequest[] = [
    {
      id: '1',
      patientName: 'Maria Silva',
      patientId: '123456',
      requestDate: '2024-03-15T10:30:00',
      priority: 'urgent',
      status: 'pending',
      examType: 'Hemograma Completo',
      requestedBy: 'Dr. João Santos',
      department: 'Clínica Geral'
    },
    {
      id: '2',
      patientName: 'José Oliveira',
      patientId: '789012',
      requestDate: '2024-03-15T09:15:00',
      priority: 'emergency',
      status: 'collected',
      examType: 'PCR',
      requestedBy: 'Dra. Ana Costa',
      department: 'Pronto Socorro'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800'
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800'
      case 'normal':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'collected':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'in_analysis':
        return <AlertTriangle className="h-5 w-5 text-purple-500" />
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  const filteredRequests = examRequests.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patientId.includes(searchTerm)
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesPriority && matchesStatus
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitações de Exames</h1>
          <p className="text-gray-600 mt-1">Gerencie as solicitações de exames laboratoriais</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
            <CardDescription>Solicitações aguardando coleta</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {examRequests.filter(r => r.status === 'pending').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Em Análise</CardTitle>
            <CardDescription>Exames em processamento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {examRequests.filter(r => r.status === 'in_analysis').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Concluídos</CardTitle>
            <CardDescription>Exames finalizados hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {examRequests.filter(r => r.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as solicitações de exames
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Buscar por paciente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="emergency">Emergência</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="collected">Coletado</SelectItem>
                <SelectItem value="in_analysis">Em Análise</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{request.patientName}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      ID: {request.patientId} | Exame: {request.examType}
                    </p>
                    <p className="text-sm text-gray-600">
                      Solicitante: {request.requestedBy} - {request.department}
                    </p>
                    <p className="text-sm text-gray-600">
                      Data: {new Date(request.requestDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <Button variant="outline" className="ml-2">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhuma solicitação encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 