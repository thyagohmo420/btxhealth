'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download, 
  Pencil,
  Trash2,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { TransactionForm, TransactionData } from '@/components/financial/TransactionForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Dados simulados
const initialTransactions: TransactionData[] = [
  {
    id: '1',
    type: 'income',
    description: 'Consulta Dr. Silva',
    category: 'Consulta',
    amount: 150,
    date: new Date('2024-04-01'),
    dueDate: new Date('2024-04-05'),
    paidDate: new Date('2024-04-03'),
    status: 'paid',
    paymentMethod: 'PIX',
    account: 'Itaú',
    entity: 'João Santos',
    notes: 'Primeira consulta',
    attachmentUrl: null
  },
  {
    id: '2',
    type: 'expense',
    description: 'Compra de material',
    category: 'Material Médico',
    amount: 520,
    date: new Date('2024-04-02'),
    dueDate: new Date('2024-04-10'),
    paidDate: null,
    status: 'pending',
    paymentMethod: 'Boleto',
    account: 'Banco do Brasil',
    entity: 'MedSupplies LTDA',
    notes: 'Materiais para setor de emergência',
    attachmentUrl: null
  },
  {
    id: '3',
    type: 'income',
    description: 'Pagamento convênio',
    category: 'Convênio',
    amount: 3200,
    date: new Date('2024-03-28'),
    dueDate: new Date('2024-03-28'),
    paidDate: new Date('2024-03-28'),
    status: 'paid',
    paymentMethod: 'Transferência Bancária',
    account: 'Bradesco',
    entity: 'Convênio Saúde Total',
    notes: 'Referente atendimentos de março',
    attachmentUrl: null
  },
  {
    id: '4',
    type: 'expense',
    description: 'Pagamento de energia',
    category: 'Energia',
    amount: 950,
    date: new Date('2024-03-15'),
    dueDate: new Date('2024-03-25'),
    paidDate: null,
    status: 'overdue',
    paymentMethod: 'Boleto',
    account: 'Caixa',
    entity: 'Companhia Elétrica',
    notes: '',
    attachmentUrl: null
  },
  {
    id: '5',
    type: 'expense',
    description: 'Compra de medicamentos',
    category: 'Medicamentos',
    amount: 1800,
    date: new Date('2024-04-03'),
    dueDate: new Date('2024-04-13'),
    paidDate: null,
    status: 'pending',
    paymentMethod: 'Boleto',
    account: 'Itaú',
    entity: 'Distribuidora Farma',
    notes: 'Reposição mensal',
    attachmentUrl: null
  }
]

export default function FinancialTransactions() {
  const [activeTab, setActiveTab] = useState('all')
  const [transactions, setTransactions] = useState<TransactionData[]>(initialTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null)
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')

  // Indicadores financeiros
  const calculateSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
      
    const pendingIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)
      
    const pendingExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)
      
    const overdueExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0)
      
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pendingIncome,
      pendingExpense,
      overdueExpense
    }
  }
  
  const summary = calculateSummary()

  // Filtrar transações conforme as tabs e filtros
  const filteredTransactions = transactions.filter(transaction => {
    // Filtro por tipo (tab)
    if (activeTab !== 'all' && transaction.type !== activeTab) {
      return false
    }
    
    // Filtro por texto (busca)
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.entity?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Filtro por status
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false
    }
    
    // Filtro por data
    if (dateFilter !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const transactionDate = new Date(transaction.date)
      transactionDate.setHours(0, 0, 0, 0)
      
      if (dateFilter === 'today' && transactionDate.getTime() !== today.getTime()) {
        return false
      }
      
      if (dateFilter === 'week') {
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        
        if (transactionDate < weekAgo) {
          return false
        }
      }
      
      if (dateFilter === 'month') {
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        
        if (transactionDate < monthAgo) {
          return false
        }
      }
    }
    
    return true
  })

  // Funções para manipular transações
  const handleSaveTransaction = (data: TransactionData) => {
    // Verificar se é uma transação nova ou atualização
    if (data.id) {
      // Atualizar transação existente
      setTransactions(prev => 
        prev.map(t => t.id === data.id ? data : t)
      )
    } else {
      // Adicionar nova transação com ID aleatório
      const newTransaction = {
        ...data,
        id: Math.random().toString(36).substring(2, 9)
      }
      setTransactions(prev => [...prev, newTransaction])
    }
  }

  const handleViewTransaction = (transaction: TransactionData) => {
    setSelectedTransaction(transaction)
    setIsViewOpen(true)
  }

  const handleEditTransaction = (transaction: TransactionData) => {
    setSelectedTransaction(transaction)
    if (transaction.type === 'income') {
      setIsAddIncomeOpen(true)
    } else {
      setIsAddExpenseOpen(true)
    }
  }

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast.success('Transação excluída com sucesso')
    }
  }

  // Renderizar status com cor
  const renderStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>
      default:
        return status
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento Financeiro</h1>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowUpCircle className="w-5 h-5 mr-2 text-green-500" />
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">R$ {summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-gray-500">A receber: R$ {summary.pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowDownCircle className="w-5 h-5 mr-2 text-red-500" />
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">R$ {summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-gray-500">
              A pagar: R$ {summary.pendingExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              {summary.overdueExpense > 0 && 
                <span className="text-red-500 ml-2">
                  (Vencido: R$ {summary.overdueExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                </span>
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500">
              Saldo atual
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Botões de Nova Receita e Nova Despesa */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            setSelectedTransaction(null)
            setIsAddIncomeOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Receita
        </Button>
        
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setSelectedTransaction(null)
            setIsAddExpenseOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por descrição ou entidade..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="overdue">Vencidos</option>
          </select>
          
          <select
            className="h-10 rounded-md border border-input bg-background px-3"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="all">Todas as datas</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Últimos 30 dias</option>
          </select>
        </div>
      </div>
      
      {/* Tabs e Tabela */}
      <Card>
        <CardHeader className="pb-1">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="income">
                <ArrowUpCircle className="w-4 h-4 mr-1" />
                Receitas
              </TabsTrigger>
              <TabsTrigger value="expense">
                <ArrowDownCircle className="w-4 h-4 mr-1" />
                Despesas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 mr-2 text-red-500" />
                        )}
                        {transaction.description}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell
                      className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
                    >
                      R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{transaction.dueDate ? format(new Date(transaction.dueDate), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>{renderStatus(transaction.status)}</TableCell>
                    <TableCell>{transaction.entity || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma transação encontrada. 
                    {activeTab !== 'all' && 
                      <span> Tente mudar os filtros ou adicionar uma nova {activeTab === 'income' ? 'receita' : 'despesa'}.</span>
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog de Visualização de Transação */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedTransaction?.type === 'income' ? (
                <><ArrowUpCircle className="w-5 h-5 mr-2 text-green-500" /> Receita</>
              ) : (
                <><ArrowDownCircle className="w-5 h-5 mr-2 text-red-500" /> Despesa</>
              )}
            </DialogTitle>
            <DialogDescription>
              Detalhes da transação
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                <p>{selectedTransaction.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Categoria</h3>
                  <p>{selectedTransaction.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Valor</h3>
                  <p className={selectedTransaction.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    R$ {selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Data</h3>
                  <p>{format(new Date(selectedTransaction.date), 'dd/MM/yyyy')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Vencimento</h3>
                  <p>{selectedTransaction.dueDate ? format(new Date(selectedTransaction.dueDate), 'dd/MM/yyyy') : '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p>{renderStatus(selectedTransaction.status)}</p>
                </div>
                
                {selectedTransaction.paidDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Data de Pagamento</h3>
                    <p>{format(new Date(selectedTransaction.paidDate), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {selectedTransaction.type === 'income' ? 'Cliente' : 'Fornecedor'}
                  </h3>
                  <p>{selectedTransaction.entity || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Método de Pagamento</h3>
                  <p>{selectedTransaction.paymentMethod || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Conta</h3>
                  <p>{selectedTransaction.account || '-'}</p>
                </div>
              </div>
              
              {selectedTransaction.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Observações</h3>
                  <p className="text-sm">{selectedTransaction.notes}</p>
                </div>
              )}
              
              {selectedTransaction.attachmentUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Comprovante</h3>
                  <Button variant="outline" size="sm" className="mt-1">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                </div>
              )}
              
              <div className="flex justify-end pt-4 space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewOpen(false)}
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewOpen(false)
                    handleEditTransaction(selectedTransaction)
                  }}
                >
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Formulários de Transação */}
      <TransactionForm
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction?.type === 'income' ? selectedTransaction : null}
        type="income"
      />
      
      <TransactionForm
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction?.type === 'expense' ? selectedTransaction : null}
        type="expense"
      />
    </div>
  )
} 