'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Activity, Brain, AlertCircle, Lightbulb, BarChart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts'

// Dados simulados para os gráficos
const monthlyData = [
  { name: 'Jan', receita: 40000, despesa: 35000 },
  { name: 'Fev', receita: 45000, despesa: 32000 },
  { name: 'Mar', receita: 48000, despesa: 37000 },
  { name: 'Abr', receita: 52000, despesa: 39000 },
  { name: 'Mai', receita: 55000, despesa: 40000 },
  { name: 'Jun', receita: 58000, despesa: 42000 },
]

const setorData = [
  { name: 'Consultório', valor: 35000 },
  { name: 'Farmácia', valor: 15000 },
  { name: 'Vacinas', valor: 8000 },
  { name: 'Exames', valor: 12000 },
]

// Dados simulados para IA - NOVO
const aiUsageData = [
  { name: 'Diagnóstico', value: 4500 },
  { name: 'Telefonista', value: 3200 },
  { name: 'WhatsApp', value: 2800 },
  { name: 'Triagem', value: 1500 },
  { name: 'Prescrição', value: 1200 },
]

// Comparativo de gastos com IA vs economia gerada - NOVO
const aiEconomyData = [
  { name: 'Jan', gasto: 5000, economia: 9500 },
  { name: 'Fev', gasto: 6200, economia: 11500 },
  { name: 'Mar', gasto: 7500, economia: 14200 },
  { name: 'Abr', gasto: 8600, economia: 16800 },
  { name: 'Mai', gasto: 9200, economia: 18500 },
  { name: 'Jun', gasto: 10000, economia: 21000 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function FinancialDashboard() {
  const [period, setPeriod] = useState('month')
  const [showAiDetails, setShowAiDetails] = useState(false)

  // Indicadores financeiros simulados
  const indicators = {
    receita: 58000,
    despesa: 42000,
    saldo: 16000,
    lucro: 27.6,
    gastoIA: 10000,
    economiaIA: 21000
  }

  // Sugestões de IA simuladas - APRIMORADAS
  const aiSuggestions = [
    {
      title: 'Otimização de custos operacionais',
      description: 'Redução de 15% nos custos operacionais possível através de otimização de escala de pessoal nos horários de menor movimento.',
      impacto: 'Alto',
      economia: 'R$ 6.300/mês'
    },
    {
      title: 'Ampliação de horário de atendimento',
      description: 'Análise de picos de demanda sugere oportunidade de aumento de receita com ampliação do horário de atendimento aos sábados.',
      impacto: 'Médio',
      economia: 'R$ 4.800/mês'
    },
    {
      title: 'Renegociação de contratos',
      description: 'Possível economia em contratos de fornecedores com renegociação baseada em análise comparativa de mercado.',
      impacto: 'Médio',
      economia: 'R$ 3.500/mês'
    },
    {
      title: 'Economia em energia',
      description: 'Implementação de sistema automatizado de iluminação e refrigeração pode reduzir custos de energia elétrica.',
      impacto: 'Baixo',
      economia: 'R$ 1.200/mês'
    }
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPeriod('month')}
            className={period === 'month' ? 'bg-blue-50' : ''}
          >
            Mensal
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPeriod('quarter')}
            className={period === 'quarter' ? 'bg-blue-50' : ''}
          >
            Trimestral
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPeriod('year')}
            className={period === 'year' ? 'bg-blue-50' : ''}
          >
            Anual
          </Button>
        </div>
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {indicators.receita.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {indicators.despesa.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+5% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {indicators.saldo.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Saldo atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Operacional</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indicators.lucro}%</div>
            <p className="text-xs text-gray-500">Margem de lucro</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas x Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#0088FE" name="Receita" />
                  <Line type="monotone" dataKey="despesa" stroke="#FF8042" name="Despesa" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={setorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {setorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de IA - NOVO */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Análise de Inteligência Artificial</CardTitle>
            <CardDescription>
              Gastos e retorno sobre investimento em IA
            </CardDescription>
          </div>
          <Brain className="h-6 w-6 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gasto com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">R$ {indicators.gastoIA.toLocaleString()}</div>
                <p className="text-xs text-gray-600">No mês atual</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Economia Gerada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">R$ {indicators.economiaIA.toLocaleString()}</div>
                <p className="text-xs text-gray-600">No mês atual</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{((indicators.economiaIA / indicators.gastoIA - 1) * 100).toFixed(0)}%</div>
                <p className="text-xs text-gray-600">Retorno sobre investimento</p>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAiDetails(!showAiDetails)}
            className="mb-4"
          >
            {showAiDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          </Button>
          
          {showAiDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Distribuição de Gastos por Módulo de IA</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aiUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {aiUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-3">Gastos vs Economia Gerada pela IA</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={aiEconomyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="gasto" fill="#FF8042" name="Gasto com IA" />
                      <Bar dataKey="economia" fill="#00C49F" name="Economia Gerada" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sugestões da IA - APRIMORADO */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Sugestões de Otimização (IA)
            </CardTitle>
            <CardDescription>Recomendações baseadas em análise de dados</CardDescription>
          </div>
          <Button>Implementar Sugestões</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <Card key={index} className="bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      suggestion.impacto === 'Alto' ? 'bg-red-500' :
                      suggestion.impacto === 'Médio' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    {suggestion.title}
                    <span className="ml-auto text-sm font-normal text-green-600">{suggestion.economia}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 