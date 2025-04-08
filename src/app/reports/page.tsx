"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
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
  FileText,
  Download,
  Mail,
  Calendar,
  Brain,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  BarChart,
  FileSpreadsheet,
  Send,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import PrivateRoute from '@/components/PrivateRoute'

// Dados simulados
const initialReports = [
  {
    id: 1,
    name: 'Relatório de Movimentação - UTI',
    type: 'patient_flow',
    sector: 'UTI',
    period: 'Último mês',
    format: 'pdf',
    status: 'ready',
    generatedAt: '2024-03-15T10:00:00',
  },
  {
    id: 2,
    name: 'Consumo de Medicamentos - Emergência',
    type: 'supplies',
    sector: 'Emergência',
    period: 'Março 2024',
    format: 'excel',
    status: 'scheduled',
    generatedAt: null,
    scheduledFor: '2024-03-20T08:00:00'
  },
  {
    id: 3,
    name: 'Produtividade da Equipe - Pediatria',
    type: 'productivity',
    sector: 'Pediatria',
    period: 'Fevereiro 2024',
    format: 'pdf',
    status: 'generating',
    generatedAt: null,
    scheduledFor: null
  }
]

const initialMetrics = {
  totalReports: 150,
  scheduledReports: 12,
  averageGenerationTime: '45s',
  errorRate: 0.5
}

const initialAnomalies = [
  {
    id: 1,
    type: 'ocupação',
    description: 'Aumento significativo na taxa de ocupação da UTI',
    severity: 'high',
    date: '2024-03-15T08:00:00'
  },
  {
    id: 2,
    type: 'supplies',
    description: 'Consumo atípico de antibióticos na Emergência',
    severity: 'medium',
    date: '2024-03-14T16:45:00'
  }
]

export default function Reports() {
  const [reports, setReports] = useState(initialReports)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [anomalies, setAnomalies] = useState(initialAnomalies)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [isNewReportOpen, setIsNewReportOpen] = useState(false)
  const [isAnomaliesOpen, setIsAnomaliesOpen] = useState(false)

  // Função para filtrar relatórios
  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedType || report.type === selectedType)
  )

  // Função para criar novo relatório
  const handleNewReport = () => {
    setIsNewReportOpen(true)
  }

  // Função para ver anomalias
  const handleViewAnomalies = () => {
    setIsAnomaliesOpen(true)
  }

  // Função para baixar relatório
  const handleDownloadReport = (report: any) => {
    console.log('Downloading report:', report.id)
    // Aqui seria implementada a lógica de download
  }

  return (
    <PrivateRoute allowedRoles={['medico', 'enfermeiro', 'administrador', 'gerente_financeiro']}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={handleNewReport}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
            <Button variant="outline" onClick={handleViewAnomalies}>
              <Brain className="w-4 h-4 mr-2" />
              Ver Anomalias
            </Button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agendados</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.scheduledReports}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio de Geração</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.averageGenerationTime}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {metrics.errorRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar relatório..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Todos os Tipos</option>
            <option value="patient_flow">Movimentação</option>
            <option value="supplies">Insumos</option>
            <option value="productivity">Produtividade</option>
          </select>
        </div>

        {/* Lista de Relatórios */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.type === 'patient_flow' ? 'bg-blue-100 text-blue-600' :
                        report.type === 'supplies' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {report.type === 'patient_flow' ? 'Movimentação' :
                         report.type === 'supplies' ? 'Insumos' : 'Produtividade'}
                      </span>
                    </TableCell>
                    <TableCell>{report.sector}</TableCell>
                    <TableCell>{report.period}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.format === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {report.format.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'ready' ? 'bg-green-100 text-green-600' :
                        report.status === 'scheduled' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {report.status === 'ready' ? 'Pronto' :
                         report.status === 'scheduled' ? 'Agendado' : 'Gerando'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {report.generatedAt ? new Date(report.generatedAt).toLocaleString() :
                       report.scheduledFor ? `Agendado para ${new Date(report.scheduledFor).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          disabled={report.status !== 'ready'}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Novo Relatório */}
        <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerar Novo Relatório</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="report-type">Tipo</Label>
                <select
                  id="report-type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="patient_flow">Movimentação de Pacientes</option>
                  <option value="supplies">Uso de Insumos</option>
                  <option value="productivity">Produtividade da Equipe</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sector">Setor</Label>
                <select
                  id="sector"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="all">Todos</option>
                  <option value="emergency">Emergência</option>
                  <option value="icu">UTI</option>
                  <option value="pediatrics">Pediatria</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period">Período</Label>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    id="start-date"
                  />
                  <Input
                    type="date"
                    id="end-date"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Formato</Label>
                <div className="col-span-3 flex gap-4">
                  <div className="flex items-center gap-2">
                    <input type="radio" id="pdf" name="format" value="pdf" />
                    <label htmlFor="pdf">PDF</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="excel" name="format" value="excel" />
                    <label htmlFor="excel">Excel</label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Agendamento</Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="schedule" />
                    <label htmlFor="schedule">Agendar envio</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="datetime-local"
                      disabled
                    />
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      disabled
                    >
                      <option value="once">Uma vez</option>
                      <option value="daily">Diariamente</option>
                      <option value="weekly">Semanalmente</option>
                      <option value="monthly">Mensalmente</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Destinatários</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="email" />
                    <label htmlFor="email">Email</label>
                    <Input
                      placeholder="email@hospital.com"
                      className="flex-1 ml-2"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="whatsapp" />
                    <label htmlFor="whatsapp">WhatsApp</label>
                    <Input
                      placeholder="+55 (11) 99999-9999"
                      className="flex-1 ml-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewReportOpen(false)}>
                Cancelar
              </Button>
              <Button>Gerar Relatório</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Anomalias */}
        <Dialog open={isAnomaliesOpen} onOpenChange={setIsAnomaliesOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Anomalias Detectadas</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700">Análise da IA</div>
                    <div className="text-sm text-blue-600 mt-1">
                      Baseado na análise dos dados dos últimos 30 dias:
                      <ul className="mt-2 list-disc list-inside">
                        <li>Aumento de 25% na taxa de ocupação da UTI</li>
                        <li>Consumo de antibióticos 30% acima da média</li>
                        <li>Tempo médio de permanência aumentou em 2 dias</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Lista de Anomalias</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anomalies.map((anomaly) => (
                      <TableRow key={anomaly.id}>
                        <TableCell>
                          <span className="capitalize">{anomaly.type}</span>
                        </TableCell>
                        <TableCell>{anomaly.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            anomaly.severity === 'high' ? 'bg-red-100 text-red-600' :
                            anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {anomaly.severity}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(anomaly.date).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PrivateRoute>
  )
} 