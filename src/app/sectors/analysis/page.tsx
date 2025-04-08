'use client'

import { useState, useEffect } from 'react'
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
  Building,
  Users,
  Bed,
  Map,
  Activity,
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  Star,
  MessageCircle,
  Clock,
  Bot,
  Pencil,
  Trash2,
  Brain,
  ArrowRight,
  Upload,
  Camera,
  BarChart2,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react'

// Dados simulados
const analysisData = {
  occupationPrediction: {
    current: 75,
    nextWeek: 85,
    nextMonth: 70,
    trend: 'up'
  },
  staffingAnalysis: {
    current: 20,
    recommended: 25,
    gap: 5,
    criticalAreas: ['Enfermagem', 'Técnicos']
  },
  equipmentUsage: {
    overused: ['Monitor Multiparâmetros', 'Ventilador Mecânico'],
    underused: ['Bomba de Infusão'],
    maintenance: ['Desfibrilador']
  },
  patientFlow: {
    averageStay: 3.2,
    bottlenecks: ['Pronto Socorro -> Enfermaria', 'Triagem -> Consultório'],
    recommendations: [
      'Aumentar equipe de triagem no período da manhã',
      'Otimizar processo de transferência entre setores'
    ]
  }
}

export default function SectorAnalysis() {
  const [analysis, setAnalysis] = useState(analysisData)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    // Aqui seria a chamada para API para atualizar os dados baseado no período
    console.log('Atualizando dados para período:', selectedPeriod)
    
    // Simulando atualização dos dados
    const updatedData = {
      ...analysisData,
      occupationPrediction: {
        ...analysisData.occupationPrediction,
        nextWeek: selectedPeriod === 'week' ? 85 : 75,
        nextMonth: selectedPeriod === 'month' ? 70 : 80
      }
    }
    setAnalysis(updatedData)
  }, [selectedPeriod])

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    
    try {
      // Aqui seria a chamada para API para gerar o relatório
      console.log('Gerando relatório de análise...')
      
      // Simulando tempo de geração
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulando download do relatório
      const blob = new Blob(['Relatório de Análise'], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analise-setores-${selectedPeriod}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleViewRecommendations = () => {
    setIsRecommendationsOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Análise de Setores - IA</h1>
        <div className="flex gap-2">
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">Próxima Semana</option>
            <option value="month">Próximo Mês</option>
            <option value="quarter">Próximo Trimestre</option>
          </select>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <>
                <span className="animate-spin mr-2">⌛</span>
                Gerando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Previsão de Ocupação */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Previsão de Ocupação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Ocupação Atual</div>
              <div className="text-2xl font-bold">{analysis.occupationPrediction.current}%</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Próxima Semana</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{analysis.occupationPrediction.nextWeek}%</div>
                {analysis.occupationPrediction.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Próximo Mês</div>
              <div className="text-2xl font-bold">{analysis.occupationPrediction.nextMonth}%</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <div className="font-medium text-blue-700">Análise da IA</div>
                <div className="text-sm text-blue-600 mt-1">
                  Prevemos um aumento na ocupação na próxima semana devido ao início do período de inverno.
                  Recomendamos preparar equipes adicionais e recursos para atender à demanda.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Pessoal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Análise de Pessoal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Quadro Atual vs. Recomendado</div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">{analysis.staffingAnalysis.current}</div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <div className="text-2xl font-bold text-green-600">{analysis.staffingAnalysis.recommended}</div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-700">Áreas Críticas</div>
                <div className="mt-2 space-y-1">
                  {analysis.staffingAnalysis.criticalAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium mb-2">Recomendações de Contratação</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4 text-green-500" />
                  <span>3 Enfermeiros para o turno da noite</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4 text-green-500" />
                  <span>2 Técnicos para o turno da manhã</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Equipamentos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Análise de Equipamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="font-medium text-red-700 mb-2">Superutilizados</div>
              <div className="space-y-2">
                {analysis.equipmentUsage.overused.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="font-medium text-yellow-700 mb-2">Subutilizados</div>
              <div className="space-y-2">
                {analysis.equipmentUsage.underused.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-700 mb-2">Manutenção Preventiva</div>
              <div className="space-y-2">
                {analysis.equipmentUsage.maintenance.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Fluxo de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Análise de Fluxo de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Tempo Médio de Permanência</div>
                <div className="text-2xl font-bold">{analysis.patientFlow.averageStay} dias</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="font-medium text-red-700 mb-2">Gargalos Identificados</div>
                <div className="space-y-2">
                  {analysis.patientFlow.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{bottleneck}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-700 mb-2">Recomendações de Otimização</div>
              <div className="space-y-2">
                {analysis.patientFlow.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                    <Brain className="w-4 h-4" />
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão para ver recomendações detalhadas */}
      <div className="mt-6">
        <Button onClick={handleViewRecommendations}>
          <Brain className="w-4 h-4 mr-2" />
          Ver Recomendações Detalhadas
        </Button>
      </div>

      {/* Modal de Recomendações Detalhadas */}
      <Dialog open={isRecommendationsOpen} onOpenChange={setIsRecommendationsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recomendações Detalhadas da IA</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Ocupação e Capacidade</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  Baseado na análise de tendências sazonais e histórico de ocupação,
                  recomendamos aumentar a capacidade em 20% nos próximos 3 meses.
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Gestão de Pessoal</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  A análise de produtividade indica necessidade de reforço nas equipes
                  de enfermagem durante os períodos de pico (8h-11h e 14h-17h).
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Equipamentos</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  Identificamos padrões de uso que sugerem necessidade de aquisição
                  de 2 monitores multiparâmetros adicionais nos próximos 30 dias.
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fluxo de Pacientes</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  Sugerimos implementar um sistema de fast-track na triagem para
                  reduzir o tempo de espera em 40% nos casos de baixa complexidade.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecommendationsOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handleGenerateReport}>
              Gerar Relatório Detalhado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 