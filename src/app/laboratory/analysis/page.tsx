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
  Microscope,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Brain
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Analysis {
  id: string
  patientName: string
  patientId: string
  examType: string
  startTime: string
  estimatedCompletion: string
  progress: number
  status: 'waiting' | 'in_progress' | 'review' | 'completed'
  priority: 'normal' | 'urgent' | 'emergency'
  aiAnalysis?: {
    anomalies: string[]
    recommendations: string[]
    confidence: number
  }
  technician?: string
}

export default function LaboratoryAnalysis() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  // Dados mockados para exemplo
  const analyses: Analysis[] = [
    {
      id: '1',
      patientName: 'Maria Silva',
      patientId: '123456',
      examType: 'Hemograma Completo',
      startTime: '2024-03-15T10:30:00',
      estimatedCompletion: '2024-03-15T11:30:00',
      progress: 75,
      status: 'in_progress',
      priority: 'urgent',
      technician: 'Dr. Carlos Santos',
      aiAnalysis: {
        anomalies: ['Leucócitos elevados', 'Plaquetas baixas'],
        recommendations: ['Verificar histórico de infecções', 'Repetir exame em 7 dias'],
        confidence: 0.89
      }
    },
    {
      id: '2',
      patientName: 'José Oliveira',
      patientId: '789012',
      examType: 'PCR',
      startTime: '2024-03-15T09:15:00',
      estimatedCompletion: '2024-03-15T10:15:00',
      progress: 100,
      status: 'review',
      priority: 'emergency',
      technician: 'Dra. Ana Costa',
      aiAnalysis: {
        anomalies: ['Resultado positivo'],
        recommendations: ['Notificar médico imediatamente'],
        confidence: 0.95
      }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'review':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
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

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-600'
    if (progress < 70) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.patientId.includes(searchTerm)
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análises Laboratoriais</h1>
          <p className="text-gray-600 mt-1">Acompanhe as análises em andamento</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Brain className="h-4 w-4 mr-2" />
          Análise por IA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Aguardando</CardTitle>
            <CardDescription>Análises pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-3xl font-bold text-yellow-600">
                {analyses.filter(a => a.status === 'waiting').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Em Análise</CardTitle>
            <CardDescription>Análises em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Microscope className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-3xl font-bold text-blue-600">
                {analyses.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Em Revisão</CardTitle>
            <CardDescription>Aguardando revisão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-purple-500 mr-2" />
              <p className="text-3xl font-bold text-purple-600">
                {analyses.filter(a => a.status === 'review').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Concluídas</CardTitle>
            <CardDescription>Análises finalizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-3xl font-bold text-green-600">
                {analyses.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Análises</CardTitle>
          <CardDescription>
            Acompanhe o progresso das análises laboratoriais
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
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{analysis.patientName}</h3>
                      <Badge variant="outline" className={getPriorityColor(analysis.priority)}>
                        {analysis.priority.charAt(0).toUpperCase() + analysis.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(analysis.status)}>
                        {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      ID: {analysis.patientId} | Exame: {analysis.examType}
                    </p>
                    {analysis.technician && (
                      <p className="text-sm text-gray-600">
                        Responsável: {analysis.technician}
                      </p>
                    )}
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{analysis.progress}%</span>
                      </div>
                      <Progress value={analysis.progress} className={getProgressColor(analysis.progress)} />
                    </div>
                    {analysis.aiAnalysis && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">
                            Análise por IA (Confiança: {(analysis.aiAnalysis.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                        {analysis.aiAnalysis.anomalies.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-purple-900">Anomalias detectadas:</p>
                            <ul className="list-disc list-inside text-sm text-purple-800">
                              {analysis.aiAnalysis.anomalies.map((anomaly, index) => (
                                <li key={index}>{anomaly}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.aiAnalysis.recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-purple-900">Recomendações:</p>
                            <ul className="list-disc list-inside text-sm text-purple-800">
                              {analysis.aiAnalysis.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    {analysis.status === 'review' && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredAnalyses.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhuma análise encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 