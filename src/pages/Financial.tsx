import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  Building2,
  Users,
  Star
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: string;
  reference?: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingPayments: number;
  reimbursementsPending: number;
}

export default function Financial() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { register, handleSubmit, reset } = useForm();

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      category: 'Consultas',
      description: 'Atendimento Clínica Geral',
      amount: 150.00,
      date: '2024-03-20',
      status: 'completed',
      paymentMethod: 'Convênio',
      reference: 'CONS-2024-001'
    },
    {
      id: '2',
      type: 'expense',
      category: 'Insumos',
      description: 'Material Hospitalar',
      amount: 500.00,
      date: '2024-03-19',
      status: 'pending',
      reference: 'PED-2024-015'
    }
  ];

  const mockSummary: FinancialSummary = {
    totalRevenue: 25000.00,
    totalExpenses: 15000.00,
    netIncome: 10000.00,
    pendingPayments: 3500.00,
    reimbursementsPending: 2800.00
  };

  const onSubmit = (data: any) => {
    console.log(data);
    setShowNewTransaction(false);
    reset();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Controle Financeiro</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Relatórios
          </button>
          <button
            onClick={() => setShowNewTransaction(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-semibold">Receita Total</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(mockSummary.totalRevenue)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Despesas</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(mockSummary.totalExpenses)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <PieChart className="w-5 h-5" />
            <h3 className="font-semibold">Resultado</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(mockSummary.netIncome)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">A Receber</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(mockSummary.pendingPayments)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Building2 className="w-5 h-5" />
            <h3 className="font-semibold">Reembolsos</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(mockSummary.reimbursementsPending)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Visão Geral
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transações
              </div>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'billing'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Faturamento
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Ano</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Receitas por Categoria</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Consultas</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Exames</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Procedimentos</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Despesas por Categoria</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Pessoal</span>
                      <span className="font-medium">50%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Insumos</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Operacional</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-4">Evolução Financeira</h4>
                <div className="h-64 flex items-end justify-between gap-2">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="flex-1">
                      <div
                        className="bg-blue-600 rounded-t"
                        style={{
                          height: `${Math.random() * 100}%`,
                          minHeight: '20%'
                        }}
                      ></div>
                      <div className="text-xs text-center mt-2">
                        {new Date(2024, index).toLocaleString('pt-BR', { month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {transaction.category} - Ref: {transaction.reference}
                      </p>
                    </div>
                    <p className={`font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                    {transaction.paymentMethod && (
                      <div>{transaction.paymentMethod}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Faturamento por Convênio</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">Unimed</p>
                        <p className="text-sm text-gray-600">150 atendimentos</p>
                      </div>
                      <p className="font-medium text-green-600">{formatCurrency(12500)}</p>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">SUS</p>
                        <p className="text-sm text-gray-600">280 atendimentos</p>
                      </div>
                      <p className="font-medium text-green-600">{formatCurrency(8500)}</p>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">Particular</p>
                        <p className="text-sm text-gray-600">45 atendimentos</p>
                      </div>
                      <p className="font-medium text-green-600">{formatCurrency(4000)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Status de Faturamento</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">Faturado</p>
                        <p className="text-sm text-gray-600">Últimos 30 dias</p>
                      </div>
                      <p className="font-medium text-green-600">{formatCurrency(25000)}</p>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">Em Processamento</p>
                        <p className="text-sm text-gray-600">75 guias</p>
                      </div>
                      <p className="font-medium text-yellow-600">{formatCurrency(12000)}</p>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">Glosas</p>
                        <p className="text-sm text-gray-600">15 guias</p>
                      </div>
                      <p className="font-medium text-red-600">{formatCurrency(3500)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-4">Procedimentos mais Faturados</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 p-2 bg-gray-100 rounded text-sm font-medium">
                    <div>Procedimento</div>
                    <div>Quantidade</div>
                    <div>Valor Unitário</div>
                    <div>Total</div>
                  </div>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-2 bg-white rounded">
                      <div>Consulta em Consultório</div>
                      <div>{Math.floor(Math.random() * 100 + 50)}</div>
                      <div>{formatCurrency(150)}</div>
                      <div className="font-medium">{formatCurrency(Math.random() * 10000 + 5000)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Nova Transação</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    {...register('type')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    {...register('category')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="consultas">Consultas</option>
                    <option value="exames">Exames</option>
                    <option value="procedimentos">Procedimentos</option>
                    <option value="insumos">Insumos</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    {...register('description')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    {...register('paymentMethod')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cash">Dinheiro</option>
                    <option value="credit">Cartão de Crédito</option>
                    <option value="debit">Cartão de Débito</option>
                    <option value="transfer">Transferência</option>
                    <option value="insurance">Convênio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referência
                  </label>
                  <input
                    type="text"
                    {...register('reference')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewTransaction(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}