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
  CreditCard, 
  Download, 
  FileText, 
  Plus, 
  Search,
  AlertTriangle,
  Pencil,
  Trash2
} from 'lucide-react'

// Dados simulados
const receivables = [
  {
    id: 1,
    patient: 'João Silva',
    type: 'Particular',
    value: 150.00,
    dueDate: '2024-03-20',
    status: 'pending',
    paymentMethod: 'PIX'
  },
  {
    id: 2,
    patient: 'Maria Santos',
    type: 'Convênio',
    value: 280.00,
    dueDate: '2024-03-18',
    status: 'paid',
    paymentMethod: 'Cartão'
  },
  {
    id: 3,
    patient: 'Pedro Oliveira',
    type: 'SUS',
    value: 90.00,
    dueDate: '2024-03-15',
    status: 'overdue',
    paymentMethod: 'Boleto'
  }
]

export default function Receivables() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [receivablesList, setReceivablesList] = useState(receivables)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingReceivable, setEditingReceivable] = useState({
    id: 0,
    patient: '',
    type: '',
    value: 0,
    dueDate: '',
    status: '',
    paymentMethod: ''
  })
  
  // Cálculo dos indicadores financeiros baseado nos lançamentos
  const indicators = {
    totalReceivable: receivablesList.reduce((total, item) => 
      item.status !== 'paid' ? total + item.value : total, 0),
    
    overdueAmount: receivablesList.reduce((total, item) => 
      item.status === 'overdue' ? total + item.value : total, 0),
    
    receivedToday: receivablesList.reduce((total, item) => {
      if (item.status === 'paid' && 
          new Date(item.dueDate).toLocaleDateString() === new Date().toLocaleDateString()) {
        return total + item.value
      }
      return total
    }, 0),
    
    predictedDefault: (() => {
      const totalValue = receivablesList.reduce((total, item) => total + item.value, 0)
      const overdueValue = receivablesList.reduce((total, item) => 
        item.status === 'overdue' ? total + item.value : total, 0)
      return totalValue > 0 ? ((overdueValue / totalValue) * 100).toFixed(1) : 0
    })()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'overdue':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'pending':
        return 'Pendente'
      case 'overdue':
        return 'Vencido'
      default:
        return status
    }
  }

  const handleDownload = (id: number) => {
    // Implementar download do recebimento em PDF
    console.log(`Baixando recebimento ${id}`)
    // Aqui você pode implementar a lógica para gerar e baixar o PDF
    const data = receivablesList.find(item => item.id === id)
    if (data) {
      // Exemplo de estrutura do PDF
      const pdfContent = {
        title: 'Comprovante de Recebimento',
        data: {
          patient: data.patient,
          type: data.type,
          value: data.value,
          dueDate: data.dueDate,
          status: data.status,
          paymentMethod: data.paymentMethod
        }
      }
      console.log('Gerando PDF:', pdfContent)
    }
  }

  const handleView = (id: number) => {
    const data = receivablesList.find(item => item.id === id)
    if (data) {
      setSelectedItem(id)
      setEditingReceivable(data)
      setIsViewOpen(true)
    }
  }

  const handleEdit = (id: number) => {
    const data = receivablesList.find(item => item.id === id)
    if (data) {
      setSelectedItem(id)
      setEditingReceivable(data)
      setIsEditOpen(true)
    }
  }

  const handleNewReceivable = () => {
    setEditingReceivable({
      id: Math.max(...receivablesList.map(item => item.id)) + 1,
      patient: '',
      type: '',
      value: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      paymentMethod: ''
    })
    setIsNewOpen(true)
  }

  const handleSaveEdit = () => {
    setReceivablesList(prevList => 
      prevList.map(item => 
        item.id === editingReceivable.id ? editingReceivable : item
      )
    )
    setIsEditOpen(false)
  }

  const handleSaveNew = () => {
    setReceivablesList(prevList => [...prevList, editingReceivable])
    setIsNewOpen(false)
  }

  const handleExport = () => {
    // Implementar exportação dos dados
    console.log('Exportando dados')
    // Aqui você pode implementar a lógica para exportar para Excel/CSV
    const exportData = receivablesList.map(item => ({
      Paciente: item.patient,
      Tipo: item.type,
      Valor: item.value,
      Vencimento: new Date(item.dueDate).toLocaleDateString(),
      Status: getStatusText(item.status),
      'Forma de Pagamento': item.paymentMethod
    }))
    console.log('Dados para exportação:', exportData)
  }

  const handleDelete = (id: number) => {
    // Implementar exclusão do recebimento
    console.log(`Excluindo recebimento ${id}`)
    if (confirm('Tem certeza que deseja excluir este recebimento?')) {
      setReceivablesList(prevList => prevList.filter(item => item.id !== id))
      console.log('Recebimento excluído com sucesso')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contas a Receber</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {indicators.totalReceivable.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {indicators.overdueAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recebido Hoje</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {indicators.receivedToday.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Previsão Inadimplência</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {indicators.predictedDefault}%
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
              placeholder="Buscar por paciente, tipo ou status..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewReceivable}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Recebimento
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabela de recebimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivablesList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.patient}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>R$ {item.value.toLocaleString()}</TableCell>
                  <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </TableCell>
                  <TableCell>{item.paymentMethod}</TableCell>
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
            <DialogTitle>Detalhes do Recebimento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Paciente</Label>
              <div className="col-span-3">{editingReceivable.patient}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Tipo</Label>
              <div className="col-span-3">{editingReceivable.type}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Valor</Label>
              <div className="col-span-3">R$ {editingReceivable.value.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Vencimento</Label>
              <div className="col-span-3">{new Date(editingReceivable.dueDate).toLocaleDateString()}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Status</Label>
              <div className="col-span-3">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(editingReceivable.status)}`}>
                  {getStatusText(editingReceivable.status)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Forma de Pagamento</Label>
              <div className="col-span-3">{editingReceivable.paymentMethod}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Recebimento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient">Paciente</Label>
              <Input
                id="patient"
                className="col-span-3"
                value={editingReceivable.patient}
                onChange={(e) => setEditingReceivable({...editingReceivable, patient: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Tipo</Label>
              <Input
                id="type"
                className="col-span-3"
                value={editingReceivable.type}
                onChange={(e) => setEditingReceivable({...editingReceivable, type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={editingReceivable.value}
                onChange={(e) => setEditingReceivable({...editingReceivable, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={editingReceivable.dueDate}
                onChange={(e) => setEditingReceivable({...editingReceivable, dueDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingReceivable.status}
                onChange={(e) => setEditingReceivable({...editingReceivable, status: e.target.value})}
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
              <Input
                id="paymentMethod"
                className="col-span-3"
                value={editingReceivable.paymentMethod}
                onChange={(e) => setEditingReceivable({...editingReceivable, paymentMethod: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Recebimento */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Recebimento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-patient">Paciente</Label>
              <Input
                id="new-patient"
                className="col-span-3"
                value={editingReceivable.patient}
                onChange={(e) => setEditingReceivable({...editingReceivable, patient: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type">Tipo</Label>
              <Input
                id="new-type"
                className="col-span-3"
                value={editingReceivable.type}
                onChange={(e) => setEditingReceivable({...editingReceivable, type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-value">Valor</Label>
              <Input
                id="new-value"
                type="number"
                className="col-span-3"
                value={editingReceivable.value}
                onChange={(e) => setEditingReceivable({...editingReceivable, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-dueDate">Vencimento</Label>
              <Input
                id="new-dueDate"
                type="date"
                className="col-span-3"
                value={editingReceivable.dueDate}
                onChange={(e) => setEditingReceivable({...editingReceivable, dueDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-paymentMethod">Forma de Pagamento</Label>
              <Input
                id="new-paymentMethod"
                className="col-span-3"
                value={editingReceivable.paymentMethod}
                onChange={(e) => setEditingReceivable({...editingReceivable, paymentMethod: e.target.value})}
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