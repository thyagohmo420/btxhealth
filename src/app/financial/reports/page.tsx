'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  FileText,
  Download,
  Filter,
  Calendar,
  BarChart,
  PieChart,
  LineChart,
  FileSpreadsheet,
  Building2,
  Users,
  Clock,
  FileDown,
  FileSearch,
  Settings,
  Stethoscope,
  Heart,
  Database,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'

// Tipos de relatórios disponíveis
const reportTypes = [
  {
    id: 'cash-flow',
    title: 'Fluxo de Caixa',
    description: 'Relatório detalhado de entradas e saídas',
    icon: LineChart
  },
  {
    id: 'revenue',
    title: 'Receitas por Categoria',
    description: 'Análise de receitas por fonte',
    icon: PieChart
  },
  {
    id: 'expenses',
    title: 'Despesas por Categoria',
    description: 'Análise de despesas por tipo',
    icon: BarChart
  },
  {
    id: 'billing',
    title: 'Faturamento por Convênio',
    description: 'Análise de faturamento por fonte pagadora',
    icon: FileSpreadsheet
  }
]

// Setores para análise
const sectors = [
  { id: 'all', name: 'Todos os Setores' },
  { id: 'consulting', name: 'Consultório', icon: Stethoscope },
  { id: 'emergency', name: 'Emergência', icon: Heart },
  { id: 'pharmacy', name: 'Farmácia', icon: FileText },
  { id: 'laboratory', name: 'Laboratório', icon: Database },
  { id: 'reception', name: 'Recepção', icon: UserPlus }
]

// Formatos de exportação
const exportFormats = [
  { id: 'pdf', name: 'PDF', icon: FileText },
  { id: 'excel', name: 'Excel', icon: FileSpreadsheet },
  { id: 'csv', name: 'CSV', icon: FileDown }
]

// Relatórios recentes simulados
const recentReports = [
  {
    id: 1,
    type: 'cash-flow',
    title: 'Fluxo de Caixa - Março/2024',
    date: '2024-03-20',
    sector: 'all',
    format: 'PDF'
  },
  {
    id: 2,
    type: 'revenue',
    title: 'Receitas por Categoria - 1º Trimestre 2024',
    date: '2024-03-15',
    sector: 'consulting',
    format: 'XLSX'
  },
  {
    id: 3,
    type: 'expenses',
    title: 'Despesas por Categoria - Fevereiro/2024',
    date: '2024-03-01',
    sector: 'pharmacy',
    format: 'PDF'
  },
  {
    id: 4,
    type: 'billing',
    title: 'Faturamento por Convênio - Diário (01/04/2024)',
    date: '2024-04-01',
    sector: 'emergency',
    format: 'CSV'
  },
  {
    id: 5,
    type: 'attendance',
    title: 'Relatório de Atendimentos - Março/2024',
    date: '2024-04-02',
    sector: 'reception',
    format: 'PDF'
  }
]

// Análises diárias simuladas
const dailyAnalytics = [
  { date: '2024-04-01', revenue: 8500, expenses: 5200, attendance: 42 },
  { date: '2024-04-02', revenue: 7800, expenses: 4900, attendance: 38 },
  { date: '2024-04-03', revenue: 9200, expenses: 5400, attendance: 45 },
  { date: '2024-04-04', revenue: 8300, expenses: 5100, attendance: 40 },
  { date: '2024-04-05', revenue: 10500, expenses: 6200, attendance: 52 }
]

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('')
  const [activeTab, setActiveTab] = useState('reports')

  const handleGenerateReport = (type: string) => {
    setSelectedReportType(type)
    setIsExportDialogOpen(true)
  }

  const handleExportReport = () => {
    setIsGenerating(true)
    
    // Simulação de geração de relatório
    setTimeout(() => {
      setIsGenerating(false)
      setIsExportDialogOpen(false)
      
      const reportName = `${getReportTitle(selectedReportType)} - ${
        selectedPeriod === 'day' ? 'Diário' :
        selectedPeriod === 'week' ? 'Semanal' :
        selectedPeriod === 'month' ? 'Mensal' :
        selectedPeriod === 'quarter' ? 'Trimestral' :
        'Anual'
      }`
      
      toast.success(`Relatório "${reportName}" gerado com sucesso no formato ${selectedFormat.toUpperCase()}!`)
    }, 2000)
  }

  const handleDownloadReport = (id: number) => {
    const report = recentReports.find(r => r.id === id)
    if (report) {
      toast.success(`Baixando relatório "${report.title}" no formato ${report.format}`)
    }
  }

  const getReportTitle = (type: string) => {
    const report = reportTypes.find(r => r.id === type)
    return report ? report.title : type
  }

  const getSectorName = (id: string) => {
    const sector = sectors.find(s => s.id === id)
    return sector ? sector.name : id
  }

  const filteredReports = recentReports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Relatórios Financeiros</h1>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="daily">
            <Calendar className="w-4 h-4 mr-2" />
            Análise Diária
          </TabsTrigger>
          <TabsTrigger value="sectors">
            <Building2 className="w-4 h-4 mr-2" />
            Análise por Setor
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="mt-6">
          {/* Filtros de período */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Período</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="day">Diário</option>
                    <option value="week">Semanal</option>
                    <option value="month">Mensal</option>
                    <option value="quarter">Trimestral</option>
                    <option value="year">Anual</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Data Inicial</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Data Final</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Setor</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tipos de Relatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {reportTypes.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                  <report.icon className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <Button 
                    className="w-full"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Relatórios adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="cursor-pointer hover:bg-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Relatório de atendimentos por período</p>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('attendance')}
                >
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Espera</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Análise de tempo de espera por setor</p>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('waiting-time')}
                >
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Procedimentos</CardTitle>
                <Stethoscope className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Análise de procedimentos realizados</p>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('procedures')}
                >
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Configurar</CardTitle>
                <Settings className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Personalizar relatórios e análises</p>
                <Button 
                  className="w-full"
                  variant="outline"
                >
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Relatórios Recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Relatórios Recentes</CardTitle>
                <div className="relative w-64">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Filtrar relatórios..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>{getSectorName(report.sector)}</TableCell>
                      <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          report.format === 'PDF' ? 'border-red-200 text-red-700 bg-red-50' :
                          report.format === 'XLSX' ? 'border-green-200 text-green-700 bg-green-50' :
                          'border-blue-200 text-blue-700 bg-blue-50'
                        }>
                          {report.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            <FileSearch className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="daily" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise Diária</CardTitle>
              <CardDescription>
                Visão detalhada das operações diárias dos últimos 5 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Despesas</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Atendimentos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyAnalytics.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-green-600">
                        R$ {day.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-red-600">
                        R$ {day.expenses.toLocaleString()}
                      </TableCell>
                      <TableCell className={day.revenue - day.expenses > 0 ? 'text-blue-600 font-medium' : 'text-red-600 font-medium'}>
                        R$ {(day.revenue - day.expenses).toLocaleString()}
                      </TableCell>
                      <TableCell>{day.attendance}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            toast.success(`Exportando relatório do dia ${new Date(day.date).toLocaleDateString()} para PDF`)
                          }}>
                            <FileText className="w-4 h-4 text-red-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            toast.success(`Exportando relatório do dia ${new Date(day.date).toLocaleDateString()} para Excel`)
                          }}>
                            <FileSpreadsheet className="w-4 h-4 text-green-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sectors" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectors.filter(s => s.id !== 'all').map((sector) => (
              <Card key={sector.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {sector.icon && <sector.icon className="w-5 h-5 mr-2 text-blue-500" />}
                    {sector.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Receita</p>
                        <p className="text-lg font-medium text-green-600">
                          R$ {(Math.random() * 10000 + 5000).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Despesas</p>
                        <p className="text-lg font-medium text-red-600">
                          R$ {(Math.random() * 6000 + 2000).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Atendimentos</p>
                        <p className="text-lg font-medium text-blue-600">
                          {Math.floor(Math.random() * 50 + 20)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Tempo Médio</p>
                        <p className="text-lg font-medium text-orange-600">
                          {Math.floor(Math.random() * 30 + 10)} min
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.success(`Exportando relatório do setor ${sector.name} para PDF`)
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1 text-red-500" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.success(`Exportando relatório do setor ${sector.name} para Excel`)
                        }}
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-1 text-green-500" />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedSector(sector.id)
                          setActiveTab('reports')
                          handleGenerateReport('sector-analysis')
                        }}
                      >
                        Relatório Detalhado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de exportação */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Relatório</DialogTitle>
            <DialogDescription>
              Escolha o formato de exportação para o relatório "{getReportTitle(selectedReportType)}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 py-4">
            {exportFormats.map(format => (
              <div 
                key={format.id}
                className={`
                  border rounded-lg p-4 cursor-pointer
                  ${selectedFormat === format.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                `}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div className="flex flex-col items-center">
                  <format.icon className={`w-12 h-12 mb-2 ${
                    format.id === 'pdf' ? 'text-red-500' :
                    format.id === 'excel' ? 'text-green-500' :
                    'text-blue-500'
                  }`} />
                  <p className="font-medium">{format.name}</p>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExportReport} disabled={isGenerating}>
              {isGenerating ? 'Gerando...' : 'Exportar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 