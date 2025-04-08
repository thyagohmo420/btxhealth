'use client'

import { useState } from 'react'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Download,
  Share2,
  Printer,
  Plus,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Report {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  period: string
  status: 'pending' | 'generated' | 'scheduled'
  format: 'pdf' | 'excel' | 'csv'
  createdBy: string
  createdAt: string
}

export default function LaboratoryReports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  // Dados mockados para exemplo
  const reports: Report[] = [
    {
      id: '1',
      title: 'Relatório Diário de Exames',
      type: 'daily',
      period: '15/03/2024',
      status: 'generated',
      format: 'pdf',
      createdBy: 'Dr. Carlos Santos',
      createdAt: '2024-03-15T10:00:00'
    },
    {
      id: '2',
      title: 'Relatório Semanal de Produtividade',
      type: 'weekly',
      period: '11/03/2024 - 15/03/2024',
      status: 'scheduled',
      format: 'excel',
      createdBy: 'Dra. Ana Beatriz',
      createdAt: '2024-03-15T11:30:00'
    }
  ]

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || report.type === filterType
    
    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'generated':
        return 'text-green-600 bg-green-100'
      case 'scheduled':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleDownload = async (report: Report) => {
    try {
      // Simulando download do relatório
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Relatório baixado com sucesso!')
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
      alert('Erro ao baixar relatório')
    }
  }

  const handleShare = async (report: Report) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: report.title,
          text: `Relatório: ${report.title}\nPeríodo: ${report.period}`,
          url: `https://example.com/reports/${report.id}`
        })
      } else {
        await navigator.clipboard.writeText(`https://example.com/reports/${report.id}`)
        alert('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const handlePrint = (report: Report) => {
    // Simulando impressão do relatório
    alert('Enviando relatório para impressão...')
  }

  const handleCreateReport = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      // Simulando criação do relatório
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Relatório criado com sucesso!')
      setIsCreateOpen(false)
    } catch (error) {
      console.error('Erro ao criar relatório:', error)
      alert('Erro ao criar relatório')
    }
  }

  const handleScheduleReport = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      // Simulando agendamento do relatório
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Relatório agendado com sucesso!')
      setIsScheduleOpen(false)
    } catch (error) {
      console.error('Erro ao agendar relatório:', error)
      alert('Erro ao agendar relatório')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Gerencie os relatórios do laboratório</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Relatório</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Título do relatório" required />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Criar Relatório
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Agendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Relatório</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleScheduleReport} className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Tipo de Relatório</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Todos os dias</SelectItem>
                      <SelectItem value="weekly">Toda semana</SelectItem>
                      <SelectItem value="monthly">Todo mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input type="time" id="time" required />
                </div>
                <Button type="submit" className="w-full">
                  Agendar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(report => report.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(report => report.status === 'generated').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(report => report.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Relatórios</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Buscar por título ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="daily">Diários</SelectItem>
                  <SelectItem value="weekly">Semanais</SelectItem>
                  <SelectItem value="monthly">Mensais</SelectItem>
                  <SelectItem value="custom">Personalizados</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tipo: {report.type.charAt(0).toUpperCase() + report.type.slice(1)} | 
                      Período: {report.period} | 
                      Formato: {report.format.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Criado por: {report.createdBy} | 
                      Data: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShare(report)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrint(report)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 