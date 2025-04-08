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
  Wallet,
  Download, 
  FileText, 
  Plus, 
  Search,
  AlertTriangle,
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react'

// Dados simulados
const payables = [
  {
    id: 1,
    supplier: 'Fornecedor de Materiais Médicos',
    category: 'Materiais',
    value: 2500.00,
    dueDate: '2024-03-25',
    status: 'pending',
    paymentMethod: 'Boleto'
  },
  {
    id: 2,
    supplier: 'Empresa de Limpeza',
    category: 'Serviços',
    value: 1800.00,
    dueDate: '2024-03-20',
    status: 'paid',
    paymentMethod: 'Transferência'
  },
  {
    id: 3,
    supplier: 'Distribuidora de Medicamentos',
    category: 'Medicamentos',
    value: 5200.00,
    dueDate: '2024-03-18',
    status: 'overdue',
    paymentMethod: 'Boleto'
  }
]

export default function Payables() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [payablesList, setPayablesList] = useState(payables)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingPayable, setEditingPayable] = useState({
    id: 0,
    supplier: '',
    category: '',
    value: 0,
    dueDate: '',
    status: '',
    paymentMethod: ''
  })
  
  // Cálculo dos indicadores financeiros baseado nos lançamentos
  const indicators = {
    totalPayable: payablesList.reduce((total, item) => 
      item.status !== 'paid' ? total + item.value : total, 0),
    
    overdueAmount: payablesList.reduce((total, item) => 
      item.status === 'overdue' ? total + item.value : total, 0),
    
    nextWeekDue: payablesList.reduce((total, item) => {
      const dueDate = new Date(item.dueDate)
      const today = new Date()
      const nextWeek = new Date(today.setDate(today.getDate() + 7))
      
      if (item.status === 'pending' && dueDate <= nextWeek) {
        return total + item.value
      }
      return total
    }, 0),
    
    paidToday: payablesList.reduce((total, item) => {
      if (item.status === 'paid' && 
          new Date(item.dueDate).toLocaleDateString() === new Date().toLocaleDateString()) {
        return total + item.value
      }
      return total
    }, 0)
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
    // Implementar download do pagamento em PDF
    console.log(`Baixando pagamento ${id}`)
    // Aqui você pode implementar a lógica para gerar e baixar o PDF
    const data = payablesList.find(item => item.id === id)
    if (data) {
      // Exemplo de estrutura do PDF
      const pdfContent = {
        title: 'Comprovante de Pagamento',
        data: {
          supplier: data.supplier,
          category: data.category,
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
    const data = payablesList.find(item => item.id === id)
    if (data) {
      setSelectedItem(id)
      setEditingPayable(data)
      setIsViewOpen(true)
    }
  }

  const handleEdit = (id: number) => {
    const data = payablesList.find(item => item.id === id)
    if (data) {
      setSelectedItem(id)
      setEditingPayable(data)
      setIsEditOpen(true)
    }
  }

  const handleNewPayable = () => {
    setEditingPayable({
      id: Math.max(...payablesList.map(item => item.id)) + 1,
      supplier: '',
      category: '',
      value: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      paymentMethod: ''
    })
    setIsNewOpen(true)
  }

  const handleSaveEdit = () => {
    setPayablesList(prevList => 
      prevList.map(item => 
        item.id === editingPayable.id ? editingPayable : item
      )
    )
    setIsEditOpen(false)
  }

  const handleSaveNew = () => {
    setPayablesList(prevList => [...prevList, editingPayable])
    setIsNewOpen(false)
  }

  const handleExport = () => {
    // Implementar exportação dos dados
    console.log('Exportando dados')
    // Aqui você pode implementar a lógica para exportar para Excel/CSV
    const exportData = payablesList.map(item => ({
      Fornecedor: item.supplier,
      Categoria: item.category,
      Valor: item.value,
      Vencimento: new Date(item.dueDate).toLocaleDateString(),
      Status: getStatusText(item.status),
      'Forma de Pagamento': item.paymentMethod
    }))
    console.log('Dados para exportação:', exportData)
  }

  const handleDelete = (id: number) => {
    // Implementar exclusão do pagamento
    console.log(`Excluindo pagamento ${id}`)
    if (confirm('Tem certeza que deseja excluir este pagamento?')) {
      setPayablesList(prevList => prevList.filter(item => item.id !== id))
      console.log('Pagamento excluído com sucesso')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contas a Pagar</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {indicators.totalPayable.toLocaleString()}
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
            <CardTitle className="text-sm font-medium">Vence Próxima Semana</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {indicators.nextWeekDue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pago Hoje</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {indicators.paidToday.toLocaleString()}
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
              placeholder="Buscar por fornecedor, categoria ou status..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewPayable}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabela de pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payablesList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.category}</TableCell>
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
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Fornecedor</Label>
              <div className="col-span-3">{editingPayable.supplier}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Categoria</Label>
              <div className="col-span-3">{editingPayable.category}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Valor</Label>
              <div className="col-span-3">R$ {editingPayable.value.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Vencimento</Label>
              <div className="col-span-3">{new Date(editingPayable.dueDate).toLocaleDateString()}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Status</Label>
              <div className="col-span-3">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(editingPayable.status)}`}>
                  {getStatusText(editingPayable.status)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Forma de Pagamento</Label>
              <div className="col-span-3">{editingPayable.paymentMethod}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                className="col-span-3"
                value={editingPayable.supplier}
                onChange={(e) => setEditingPayable({...editingPayable, supplier: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                className="col-span-3"
                value={editingPayable.category}
                onChange={(e) => setEditingPayable({...editingPayable, category: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={editingPayable.value}
                onChange={(e) => setEditingPayable({...editingPayable, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={editingPayable.dueDate}
                onChange={(e) => setEditingPayable({...editingPayable, dueDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingPayable.status}
                onChange={(e) => setEditingPayable({...editingPayable, status: e.target.value})}
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
                value={editingPayable.paymentMethod}
                onChange={(e) => setEditingPayable({...editingPayable, paymentMethod: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Pagamento */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-supplier">Fornecedor</Label>
              <Input
                id="new-supplier"
                className="col-span-3"
                value={editingPayable.supplier}
                onChange={(e) => setEditingPayable({...editingPayable, supplier: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category">Categoria</Label>
              <Input
                id="new-category"
                className="col-span-3"
                value={editingPayable.category}
                onChange={(e) => setEditingPayable({...editingPayable, category: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-value">Valor</Label>
              <Input
                id="new-value"
                type="number"
                className="col-span-3"
                value={editingPayable.value}
                onChange={(e) => setEditingPayable({...editingPayable, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-dueDate">Vencimento</Label>
              <Input
                id="new-dueDate"
                type="date"
                className="col-span-3"
                value={editingPayable.dueDate}
                onChange={(e) => setEditingPayable({...editingPayable, dueDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-paymentMethod">Forma de Pagamento</Label>
              <Input
                id="new-paymentMethod"
                className="col-span-3"
                value={editingPayable.paymentMethod}
                onChange={(e) => setEditingPayable({...editingPayable, paymentMethod: e.target.value})}
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