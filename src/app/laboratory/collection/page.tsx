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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  QrCode,
  Printer,
  TestTube,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Sample {
  id: string
  patientName: string
  patientId: string
  collectionTime: string
  examType: string
  sampleType: string
  status: 'waiting' | 'collected' | 'processing' | 'completed'
  priority: 'normal' | 'urgent' | 'emergency'
  tubeColor: string
  tubeType: string
  preparation: string
}

export default function LaboratoryCollection() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)

  // Dados mockados para exemplo
  const samples: Sample[] = [
    {
      id: '1',
      patientName: 'Maria Silva',
      patientId: '123456',
      collectionTime: '2024-03-15T10:30:00',
      examType: 'Hemograma Completo',
      sampleType: 'Sangue',
      status: 'waiting',
      priority: 'urgent',
      tubeColor: 'Roxo',
      tubeType: 'EDTA',
      preparation: 'Jejum de 8 horas'
    },
    {
      id: '2',
      patientName: 'José Oliveira',
      patientId: '789012',
      collectionTime: '2024-03-15T09:15:00',
      examType: 'Glicemia',
      sampleType: 'Sangue',
      status: 'collected',
      priority: 'normal',
      tubeColor: 'Cinza',
      tubeType: 'Fluoreto',
      preparation: 'Jejum de 8 horas'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'collected':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  const filteredSamples = samples.filter(sample =>
    sample.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.patientId.includes(searchTerm)
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coleta de Amostras</h1>
          <p className="text-gray-600 mt-1">Gerencie as coletas e amostras laboratoriais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Ler QR Code
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Etiquetas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Aguardando</CardTitle>
            <CardDescription>Coletas pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-3xl font-bold text-yellow-600">
                {samples.filter(s => s.status === 'waiting').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coletadas</CardTitle>
            <CardDescription>Amostras coletadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TestTube className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-3xl font-bold text-green-600">
                {samples.filter(s => s.status === 'collected').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Em Processamento</CardTitle>
            <CardDescription>Amostras em análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-3xl font-bold text-blue-600">
                {samples.filter(s => s.status === 'processing').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Concluídas</CardTitle>
            <CardDescription>Amostras processadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-purple-500 mr-2" />
              <p className="text-3xl font-bold text-purple-600">
                {samples.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Coletas</CardTitle>
          <CardDescription>
            Gerencie as coletas e amostras pendentes
          </CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Buscar por paciente ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{sample.patientName}</h3>
                      <Badge variant="outline" className={getPriorityColor(sample.priority)}>
                        {sample.priority.charAt(0).toUpperCase() + sample.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(sample.status)}>
                        {sample.status.charAt(0).toUpperCase() + sample.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      ID: {sample.patientId} | Exame: {sample.examType}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tipo: {sample.sampleType} | Tubo: {sample.tubeColor} ({sample.tubeType})
                    </p>
                    <p className="text-sm text-gray-600">
                      Preparo: {sample.preparation}
                    </p>
                    <p className="text-sm text-gray-600">
                      Horário: {new Date(sample.collectionTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Etiqueta
                    </Button>
                    <Button
                      size="sm"
                      className={sample.status === 'waiting' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      {sample.status === 'waiting' ? 'Iniciar Coleta' : 'Ver Detalhes'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSamples.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhuma coleta encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 