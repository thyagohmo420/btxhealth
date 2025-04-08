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
  ArrowDownUp,
  Download, 
  FileText, 
  Plus, 
  Search,
  TrendingUp,
  TrendingDown,
  Wallet,
  Pencil,
  Trash2
} from 'lucide-react'

// Dados simulados
const initialTransactions = [
  {
    id: 1,
    date: '2024-03-20',
    description: 'Recebimento Convênio Unimed',
    type: 'income',
    category: 'Convênios',
    value: 85000.00
  },
  {
    id: 2,
    date: '2024-03-19',
    description: 'Pagamento Fornecedores',
    type: 'expense',
    category: 'Fornecedores',
    value: 25000.00
  },
  {
    id: 3,
    date: '2024-03-18',
    description: 'Recebimento Particular',
    type: 'income',
    category: 'Particular',
    value: 12000.00
  }
]

export default function CashFlow() {
  const [searchTerm, setSearchTerm] = useState('')
  const [transactions, setTransactions] = useState(initialTransactions)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState({
    id: 0,
    date: '',
    description: '',
    type: 'income',
    category: '',
    value: 0
  })
  
  // Cálculo dos indicadores financeiros baseado nos lançamentos
  const indicators = {
    currentBalance: transactions.reduce((total, item) => 
      item.type === 'income' ? total + item.value : total - item.value, 0),
    
    totalIncome: transactions.reduce((total, item) => 
      item.type === 'income' ? total + item.value : total, 0),
    
    totalExpense: transactions.reduce((total, item) => 
      item.type === 'expense' ? total + item.value : total, 0),
    
    projectedBalance: transactions.reduce((total, item) => 
      item.type === 'income' ? total + item.value : total - item.value, 0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'income':
        return 'Entrada'
      case 'expense':
        return 'Saída'
      default:
        return type
    }
  }

  const handleView = (id: number) => {
    const data = transactions.find(item => item.id === id)
    if (data) {
      setEditingTransaction(data)
      setIsViewOpen(true)
    }
  }

  const handleEdit = (id: number) => {
    const data = transactions.find(item => item.id === id)
    if (data) {
      setEditingTransaction(data)
      setIsEditOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      setTransactions(prevList => prevList.filter(item => item.id !== id))
    }
  }

  const handleNewTransaction = () => {
    setEditingTransaction({
      id: Math.max(...transactions.map(item => item.id)) + 1,
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'income',
      category: '',
      value: 0
    })
    setIsNewOpen(true)
  }

  const handleSaveEdit = () => {
    setTransactions(prevList => 
      prevList.map(item => 
        item.id === editingTransaction.id ? editingTransaction : item
      )
    )
    setIsEditOpen(false)
  }

  const handleSaveNew = () => {
    setTransactions(prevList => [...prevList, editingTransaction])
    setIsNewOpen(false)
  }

  const handleExport = () => {
    const exportData = transactions.map(item => ({
      Data: new Date(item.date).toLocaleDateString(),
      Descrição: item.description,
      Categoria: item.category,
      Tipo: getTypeText(item.type),
      Valor: `R$ ${item.value.toLocaleString()}`
    }))
    console.log('Exportando dados:', exportData)
    // Aqui você pode implementar a lógica para exportar para Excel/CSV
  }

  const filteredTransactions = transactions.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTypeText(item.type).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fluxo de Caixa</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {indicators.currentBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {indicators.totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {indicators.totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {indicators.projectedBalance.toLocaleString()}
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
              placeholder="Buscar por descrição, categoria ou tipo..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewTransaction}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabela de movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <span className={getTypeColor(item.type)}>
                      {getTypeText(item.type)}
                    </span>
                  </TableCell>
                  <TableCell className={getTypeColor(item.type)}>
                    R$ {item.value.toLocaleString()}
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
            <DialogTitle>Detalhes da Movimentação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Data</Label>
              <div className="col-span-3">
                {new Date(editingTransaction.date).toLocaleDateString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Descrição</Label>
              <div className="col-span-3">{editingTransaction.description}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Categoria</Label>
              <div className="col-span-3">{editingTransaction.category}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Tipo</Label>
              <div className="col-span-3">
                <span className={getTypeColor(editingTransaction.type)}>
                  {getTypeText(editingTransaction.type)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Valor</Label>
              <div className="col-span-3">
                R$ {editingTransaction.value.toLocaleString()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Movimentação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={editingTransaction.date}
                onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                className="col-span-3"
                value={editingTransaction.description}
                onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                className="col-span-3"
                value={editingTransaction.category}
                onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingTransaction.type}
                onChange={(e) => setEditingTransaction({...editingTransaction, type: e.target.value})}
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={editingTransaction.value}
                onChange={(e) => setEditingTransaction({...editingTransaction, value: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Movimentação */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-date">Data</Label>
              <Input
                id="new-date"
                type="date"
                className="col-span-3"
                value={editingTransaction.date}
                onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-description">Descrição</Label>
              <Input
                id="new-description"
                className="col-span-3"
                value={editingTransaction.description}
                onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category">Categoria</Label>
              <Input
                id="new-category"
                className="col-span-3"
                value={editingTransaction.category}
                onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type">Tipo</Label>
              <select
                id="new-type"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={editingTransaction.type}
                onChange={(e) => setEditingTransaction({...editingTransaction, type: e.target.value})}
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-value">Valor</Label>
              <Input
                id="new-value"
                type="number"
                className="col-span-3"
                value={editingTransaction.value}
                onChange={(e) => setEditingTransaction({...editingTransaction, value: parseFloat(e.target.value)})}
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