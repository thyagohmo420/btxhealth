'use client'

import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarIcon, DollarSign, Info } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileUploader } from './FileUploader'
import { toast } from 'sonner'

export interface TransactionData {
  id?: string
  type: 'income' | 'expense' // receita ou despesa
  description: string
  category: string
  amount: number
  date: Date
  dueDate?: Date
  paidDate?: Date | null
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paymentMethod?: string
  account?: string
  entity?: string // fornecedor ou cliente
  notes?: string
  attachment?: File | null
  attachmentUrl?: string | null
}

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TransactionData) => void
  transaction?: TransactionData | null
  type: 'income' | 'expense'
}

export function TransactionForm({
  isOpen,
  onClose,
  onSave,
  transaction = null,
  type
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionData>(
    transaction || {
      type,
      description: '',
      category: '',
      amount: 0,
      date: new Date(),
      dueDate: new Date(),
      paidDate: null,
      status: 'pending',
      paymentMethod: '',
      account: '',
      entity: '',
      notes: '',
      attachment: null,
      attachmentUrl: null
    }
  )
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Opções para categorias
  const categoryOptions = type === 'income' 
    ? [
        'Consulta',
        'Procedimento',
        'Exame',
        'Convênio',
        'Venda de Medicamentos',
        'Outros'
      ]
    : [
        'Material Médico',
        'Medicamentos',
        'Folha de Pagamento',
        'Serviços',
        'Aluguel',
        'Energia',
        'Água',
        'Internet',
        'Manutenção',
        'Impostos',
        'Outros'
      ]
  
  // Opções para métodos de pagamento
  const paymentMethods = [
    'Dinheiro',
    'PIX',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Transferência Bancária',
    'Boleto',
    'Cheque',
  ]
  
  // Opções para contas
  const accountOptions = [
    'Caixa',
    'Banco do Brasil',
    'Itaú',
    'Bradesco',
    'Caixa Econômica',
    'Santander',
    'Nubank',
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'amount') {
      // Remove caracteres não numéricos e converte para número
      const numericValue = parseFloat(value.replace(/[^\d.]/g, ''))
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numericValue) ? 0 : numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleDateChange = (date: Date | undefined, field: 'date' | 'dueDate' | 'paidDate') => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date
      }))
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TransactionData['status']
    
    // Se o status mudar para pago, define a data de pagamento como hoje
    if (newStatus === 'paid' && formData.status !== 'paid') {
      setFormData(prev => ({
        ...prev,
        status: newStatus,
        paidDate: new Date()
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        status: newStatus
      }))
    }
  }

  const handleFileUpload = (file: File) => {
    setFormData(prev => ({
      ...prev,
      attachment: file,
      attachmentUrl: URL.createObjectURL(file)
    }))
  }

  const handleFileClear = () => {
    setFormData(prev => ({
      ...prev,
      attachment: null,
      attachmentUrl: null
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (!formData.description) {
      toast.error('Descrição é obrigatória')
      return
    }
    
    if (!formData.category) {
      toast.error('Categoria é obrigatória')
      return
    }
    
    if (formData.amount <= 0) {
      toast.error('Valor deve ser maior que zero')
      return
    }
    
    // Submeter o formulário
    setIsSubmitting(true)
    
    try {
      // Simulação de envio para API
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSave(formData)
      toast.success(
        type === 'income' 
          ? 'Receita cadastrada com sucesso!' 
          : 'Despesa cadastrada com sucesso!'
      )
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const dialogTitle = transaction 
    ? (type === 'income' ? 'Editar Receita' : 'Editar Despesa')
    : (type === 'income' ? 'Nova Receita' : 'Nova Despesa')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {type === 'income' 
              ? 'Preencha os dados da receita' 
              : 'Preencha os dados da despesa'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descrição */}
            <div className="col-span-full">
              <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva a transação"
                required
              />
            </div>
            
            {/* Categoria */}
            <div>
              <Label htmlFor="category">Categoria <span className="text-red-500">*</span></Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Entidade (Cliente ou Fornecedor) */}
            <div>
              <Label htmlFor="entity">
                {type === 'income' ? 'Cliente' : 'Fornecedor'}
              </Label>
              <Input
                id="entity"
                name="entity"
                value={formData.entity || ''}
                onChange={handleInputChange}
                placeholder={type === 'income' ? 'Nome do cliente' : 'Nome do fornecedor'}
              />
            </div>
            
            {/* Valor */}
            <div>
              <Label htmlFor="amount">Valor <span className="text-red-500">*</span></Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="amount"
                  name="amount"
                  type="text"
                  value={formData.amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {/* Data da Transação */}
            <div>
              <Label htmlFor="date">Data <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleDateChange(date, 'date')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Data de Vencimento */}
            <div>
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleDateChange(date, 'dueDate')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Status */}
            <div>
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                required
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            
            {/* Data de Pagamento - só mostra se status for "paid" */}
            {formData.status === 'paid' && (
              <div>
                <Label htmlFor="paidDate">Data de Pagamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.paidDate ? (
                        format(formData.paidDate, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.paidDate || undefined}
                      onSelect={(date) => handleDateChange(date, 'paidDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {/* Método de Pagamento */}
            <div>
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod || ''}
                onChange={handleInputChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            
            {/* Conta */}
            <div>
              <Label htmlFor="account">Conta</Label>
              <select
                id="account"
                name="account"
                value={formData.account || ''}
                onChange={handleInputChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione</option>
                {accountOptions.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>
            
            {/* Observações */}
            <div className="col-span-full">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                placeholder="Informações adicionais"
                rows={3}
              />
            </div>
            
            {/* Upload de Comprovante */}
            <div className="col-span-full">
              <Label className="block mb-2">Comprovante</Label>
              <FileUploader
                onFileUpload={handleFileUpload}
                onFileClear={handleFileClear}
                currentFile={formData.attachmentUrl}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className={type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 