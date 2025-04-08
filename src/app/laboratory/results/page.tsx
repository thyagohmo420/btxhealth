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
  FileText,
  Upload,
  Download,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ExamResult {
  id: string
  patientName: string
  patientId: string
  examType: string
  completionDate: string
  status: 'pending_validation' | 'validated' | 'sent' | 'viewed'
  resultFile?: string
  validatedBy?: string
  abnormalResults?: string[]
  historicalComparison?: {
    date: string
    value: string
    trend: 'up' | 'down' | 'stable'
  }[]
}

export default function LaboratoryResults() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  // Dados mockados para exemplo
  const results: ExamResult[] = [
    {
      id: '1',
      patientName: 'Maria Silva',
      patientId: '123456',
      examType: 'Hemograma Completo',
      completionDate: '2024-03-15T10:30:00',
      status: 'pending_validation',
      resultFile: 'hemograma_123456.pdf',
      abnormalResults: ['Leucócitos: 12.000/mm³ (Alto)', 'Plaquetas: 140.000/mm³ (Baixo)'],
      historicalComparison: [
        { date: '2024-02-15', value: '11.000/mm³', trend: 'up' },
        { date: '2024-01-15', value: '9.000/mm³', trend: 'up' }
      ]
    },
    {
      id: '2',
      patientName: 'José Oliveira',
      patientId: '789012',
      examType: 'PCR',
      completionDate: '2024-03-15T09:15:00',
      status: 'validated',
      resultFile: 'pcr_789012.pdf',
      validatedBy: 'Dr. Carlos Santos',
      abnormalResults: ['PCR: 48 mg/L (Alto)'],
      historicalComparison: [
        { date: '2024-02-15', value: '12 mg/L', trend: 'up' },
        { date: '2024-01-15', value: '3 mg/L', trend: 'up' }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_validation':
        return 'bg-yellow-100 text-yellow-800'
      case 'validated':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'viewed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500 transform rotate-90" />
    }
  }

  const filteredResults = results.filter(result =>
    result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.patientId.includes(searchTerm)
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resultados de Exames</h1>
          <p className="text-gray-600 mt-1">Gerencie os resultados dos exames laboratoriais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Aguardando Validação</CardTitle>
            <CardDescription>Resultados pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-3xl font-bold text-yellow-600">
                {results.filter(r => r.status === 'pending_validation').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validados</CardTitle>
            <CardDescription>Prontos para envio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-3xl font-bold text-green-600">
                {results.filter(r => r.status === 'validated').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enviados</CardTitle>
            <CardDescription>Aguardando visualização</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Send className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-3xl font-bold text-blue-600">
                {results.filter(r => r.status === 'sent').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualizados</CardTitle>
            <CardDescription>Resultados consultados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-purple-500 mr-2" />
              <p className="text-3xl font-bold text-purple-600">
                {results.filter(r => r.status === 'viewed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Resultados</CardTitle>
          <CardDescription>
            Gerencie os resultados dos exames
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
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{result.patientName}</h3>
                      <Badge variant="outline" className={getStatusColor(result.status)}>
                        {result.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      ID: {result.patientId} | Exame: {result.examType}
                    </p>
                    {result.validatedBy && (
                      <p className="text-sm text-gray-600">
                        Validado por: {result.validatedBy}
                      </p>
                    )}
                    {result.abnormalResults && result.abnormalResults.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-800 mb-1">Resultados Alterados:</p>
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {result.abnormalResults.map((abnormal, index) => (
                            <li key={index}>{abnormal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.historicalComparison && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Histórico:</p>
                        <div className="space-y-1">
                          {result.historicalComparison.map((history, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <span className="w-24">{new Date(history.date).toLocaleDateString()}</span>
                              <span className="w-24">{history.value}</span>
                              {getTrendIcon(history.trend)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {result.status === 'pending_validation' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Validar
                      </Button>
                    )}
                    {result.status === 'validated' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Enviar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredResults.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum resultado encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 