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
  Building2,
  Download, 
  FileText, 
  Plus, 
  Search,
  AlertTriangle,
  LineChart,
  CheckCircle2,
  Pencil,
  Trash2
} from 'lucide-react'

// Dados simulados
const billings = [
  {
    id: 1,
    type: 'SUS',
    competence: '03/2024',
    value: 125000.00,
    status: 'pending',
    procedures: 850,
    glosas: 1200.00
  },
  {
    id: 2,
    type: 'Unimed',
    competence: '03/2024',
    value: 85000.00,
    status: 'approved',
    procedures: 420,
    glosas: 0
  },
  {
    id: 3,
    type: 'Bradesco Saúde',
    competence: '02/2024',
    value: 45000.00,
    status: 'processing',
    procedures: 280,
    glosas: 800.00
  }
]

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [billingsList, setBillingsList] = useState(billings)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingBilling, setEditingBilling] = useState({
    id: 0,
    type: '',
    competence: '',
    value: 0,
    procedures: 0,
    glosas: 0,
    status: ''
  })
  
  // Cálculo dos indicadores financeiros baseado nos lançamentos
  const indicators = {
    monthlyBilling: billingsList.reduce((total, item) => {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const itemMonth = item.competence.replace('/', '-')
      return itemMonth === currentMonth ? total + item.value : total
    }, 0),
    
    pendingApproval: billingsList.reduce((total, item) => 
      item.status === 'pending' ? total + item.value : total, 0),
    
    totalGlosas: billingsList.reduce((total, item) => total + item.glosas, 0),
    
    approvedBilling: billingsList.reduce((total, item) => 
      item.status === 'approved' ? total + item.value : total, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado'
      case 'pending':
        return 'Pendente'
      case 'processing':
        return 'Em Análise'
      default:
        return status
    }
  }

  const handleDownload = (id: number) => {
    // Implementar download do faturamento em PDF
    console.log(`Baixando faturamento ${id}`)
    // Aqui você pode implementar a lógica para gerar e baixar o PDF
    const data = billingsList.find(item => item.id === id)
    if (data) {
      // Exemplo de estrutura do PDF
      const pdfContent = {
        title: 'Relatório de Faturamento',
        data: {
          type: data.type,
          competence: data.competence,
          value: data.value,
          procedures: data.procedures,
          glosas: data.glosas,
          status: data.status
        }
      }
      console.log('Gerando PDF:', pdfContent)
    }
  }

  const handleView = (id: number) => {
    const data = billingsList.find(item => item.id === id)
    if (data) {
      setSelectedItem(id)
      setEditingBilling(data)
      setIsViewOpen(true)
    }
  }

  const handleEdit = (id: number) => {
    const data = billingsList.find(item => item.id === id)
    if (data) {
      setSelectedItem(id)
      setEditingBilling(data)
      setIsEditOpen(true)
    }
  }

  const handleNewBilling = () => {
    setEditingBilling({
      id: Math.max(...billingsList.map(item => item.id)) + 1,
      type: '',
      competence: new Date().toISOString().split('T')[0].substring(0, 7),
      value: 0,
      procedures: 0,
      glosas: 0,
      status: 'pending'
    })
    setIsNewOpen(true)
  }

  const handleSaveEdit = () => {
    setBillingsList(prevList => 
      prevList.map(item => 
        item.id === editingBilling.id ? editingBilling : item
      )
    )
    setIsEditOpen(false)
  }

  const handleSaveNew = () => {
    setBillingsList(prevList => [...prevList, editingBilling])
    setIsNewOpen(false)
  }

  const handleExport = () => {
    // Implementar exportação dos dados
    console.log('Exportando dados')
    // Aqui você pode implementar a lógica para exportar para Excel/CSV
    const exportData = billingsList.map(item => ({
      'Convênio/SUS': item.type,
      Competência: item.competence,
      Valor: item.value,
      Procedimentos: item.procedures,
      Glosas: item.glosas,
      Status: getStatusText(item.status)
    }))
    console.log('Dados para exportação:', exportData)
  }

  const handleDelete = (id: number) => {
    // Implementar exclusão do faturamento
    console.log(`Excluindo faturamento ${id}`)
    if (confirm('Tem certeza que deseja excluir este faturamento?')) {
      setBillingsList(prevList => prevList.filter(item => item.id !== id))
      console.log('Faturamento excluído com sucesso')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Faturamento</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
            <LineChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {indicators.monthlyBilling.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendente Aprovação</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {indicators.pendingApproval.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Glosas</CardTitle>
            <Building2 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {indicators.totalGlosas.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Aprovado</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {indicators.approvedBilling.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por convênio, competência ou status..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewBilling}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Faturamento
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabela de faturamento */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Convênio/SUS</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Procedimentos</TableHead>
                <TableHead>Glosas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingsList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.competence}</TableCell>
                  <TableCell>R$ {item.value.toLocaleString()}</TableCell>
                  <TableCell>{item.procedures}</TableCell>
                  <TableCell>R$ {item.glosas.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleView(item.id)}
                        title="Visualizar"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(item.id)}
                        title="Baixar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        title="Excluir"
                        className="hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Faturamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Convênio/SUS</Label>
              <div className="col-span-3">{editingBilling.type}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Competência</Label>
              <div className="col-span-3">{editingBilling.competence}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Valor</Label>
              <div className="col-span-3">R$ {editingBilling.value.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Procedimentos</Label>
              <div className="col-span-3">{editingBilling.procedures}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Glosas</Label>
              <div className="col-span-3">R$ {editingBilling.glosas.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Status</Label>
              <div className="col-span-3">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(editingBilling.status)}`}>
                  {getStatusText(editingBilling.status)}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Faturamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Convênio/SUS</Label>
              <Input
                id="type"
                className="col-span-3"
                value={editingBilling.type}
                onChange={(e) => setEditingBilling({...editingBilling, type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="competence">Competência</Label>
              <Input
                id="competence"
                type="month"
                className="col-span-3"
                value={editingBilling.competence}
                onChange={(e) => setEditingBilling({...editingBilling, competence: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={editingBilling.value}
                onChange={(e) => setEditingBilling({...editingBilling, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="procedures">Procedimentos</Label>
              <Input
                id="procedures"
                type="number"
                className="col-span-3"
                value={editingBilling.procedures}
                onChange={(e) => setEditingBilling({...editingBilling, procedures: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="glosas">Glosas</Label>
              <Input
                id="glosas"
                type="number"
                className="col-span-3"
                value={editingBilling.glosas}
                onChange={(e) => setEditingBilling({...editingBilling, glosas: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingBilling.status}
                onChange={(e) => setEditingBilling({...editingBilling, status: e.target.value})}
              >
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="processing">Em Análise</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Faturamento */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Faturamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type">Convênio/SUS</Label>
              <Input
                id="new-type"
                className="col-span-3"
                value={editingBilling.type}
                onChange={(e) => setEditingBilling({...editingBilling, type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-competence">Competência</Label>
              <Input
                id="new-competence"
                type="month"
                className="col-span-3"
                value={editingBilling.competence}
                onChange={(e) => setEditingBilling({...editingBilling, competence: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-value">Valor</Label>
              <Input
                id="new-value"
                type="number"
                className="col-span-3"
                value={editingBilling.value}
                onChange={(e) => setEditingBilling({...editingBilling, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-procedures">Procedimentos</Label>
              <Input
                id="new-procedures"
                type="number"
                className="col-span-3"
                value={editingBilling.procedures}
                onChange={(e) => setEditingBilling({...editingBilling, procedures: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-glosas">Glosas</Label>
              <Input
                id="new-glosas"
                type="number"
                className="col-span-3"
                value={editingBilling.glosas}
                onChange={(e) => setEditingBilling({...editingBilling, glosas: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNew}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 