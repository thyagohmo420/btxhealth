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
  AlertCircle,
  ChevronDown
} from 'lucide-react'

// Dados simulados
const reportTypes = [
  {
    id: 1,
    name: 'Movimentação de Pacientes',
    description: 'Relatório detalhado de transferências entre setores',
    icon: Users
  },
  {
    id: 2,
    name: 'Uso de Insumos',
    description: 'Consumo de medicamentos e materiais por setor',
    icon: Activity
  },
  {
    id: 3,
    name: 'Produtividade da Equipe',
    description: 'Indicadores de performance por profissional',
    icon: Star
  },
  {
    id: 4,
    name: 'Ocupação e Rotatividade',
    description: 'Análise de ocupação e tempo médio de permanência',
    icon: Bed
  }
]

const recentReports = [
  {
    id: 1,
    type: 'Movimentação de Pacientes',
    sector: 'Pronto Socorro',
    period: '01/03/2024 - 15/03/2024',
    generatedAt: '2024-03-15T14:30:00',
    format: 'PDF'
  },
  {
    id: 2,
    type: 'Uso de Insumos',
    sector: 'Enfermaria',
    period: '01/03/2024 - 15/03/2024',
    generatedAt: '2024-03-15T10:00:00',
    format: 'Excel'
  }
]

export default function SectorReports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<any>(null)
  const [reports, setReports] = useState(recentReports)
  const [selectedFormat, setSelectedFormat] = useState('pdf')

  useEffect(() => {
    // Aqui seria a chamada para API para carregar os relatórios
    console.log('Carregando relatórios...')
  }, [])

  const handleGenerateReport = async () => {
    if (!selectedSector || !selectedPeriod) {
      alert('Por favor, selecione o setor e o período')
      return
    }

    setIsGeneratingReport(true)
    
    try {
      // Aqui seria a chamada para API para gerar o relatório
      console.log('Gerando relatório...', {
        type: selectedReportType?.name,
        sector: selectedSector,
        period: selectedPeriod,
        format: selectedFormat
      })
      
      // Simulando tempo de geração
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Adiciona o novo relatório à lista
      const newReport = {
        id: Math.max(...reports.map(r => r.id)) + 1,
        type: selectedReportType?.name,
        sector: selectedSector,
        period: '15/03/2024 - 30/03/2024',
        generatedAt: new Date().toISOString(),
        format: selectedFormat.toUpperCase()
      }
      
      setReports(prev => [newReport, ...prev])
      setSelectedReportType(null)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleDownloadReport = async (report: any) => {
    try {
      // Aqui seria a chamada para API para baixar o relatório
      console.log('Baixando relatório:', report)
      
      // Simulando download
      const blob = new Blob(['Conteúdo do Relatório'], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${report.type.toLowerCase()}-${report.id}.${report.format.toLowerCase()}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
    }
  }

  const filteredReports = reports.filter(report =>
    report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.sector.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relatórios dos Setores</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar relatório..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => setSelectedReportType(reportTypes[0])}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Tipos de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card 
              key={type.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedReportType(type)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{type.name}</CardTitle>
                <Icon className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{type.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Gerado em</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.sector}</TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{new Date(report.generatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.format === 'PDF' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
                    }`}>
                      {report.format}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Geração de Relatório */}
      <Dialog open={!!selectedReportType} onOpenChange={() => setSelectedReportType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Relatório - {selectedReportType?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector">Setor</Label>
              <select
                id="sector"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                <option value="">Selecione o setor</option>
                <option value="ps">Pronto Socorro</option>
                <option value="enfermaria">Enfermaria</option>
                <option value="uti">UTI</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period">Período</Label>
              <select
                id="period"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">Selecione o período</option>
                <option value="today">Hoje</option>
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Intervalo</Label>
                <div className="col-span-3 flex gap-2">
                  <Input type="date" className="flex-1" />
                  <Input type="date" className="flex-1" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format">Formato</Label>
              <select
                id="format"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <div className="col-span-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700">Insights da IA</div>
                    <div className="text-sm text-blue-600 mt-1">
                      Com base nos dados selecionados, a IA identificou padrões relevantes
                      que serão destacados no relatório, incluindo tendências de ocupação
                      e sugestões de otimização.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReportType(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || !selectedSector || !selectedPeriod}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 