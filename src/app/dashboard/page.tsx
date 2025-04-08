"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Bed,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Stethoscope
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Pacientes Ativos",
      value: "248",
      icon: Users,
      description: "+5% em relação ao mês anterior",
      color: "text-blue-600",
      trend: "up"
    },
    {
      title: "Ocupação de Leitos",
      value: "85%",
      icon: Bed,
      description: "32 de 40 leitos ocupados",
      color: "text-green-600",
      trend: "up"
    },
    {
      title: "Tempo Médio de Espera",
      value: "24min",
      icon: Clock,
      description: "-12% em relação ao mês anterior",
      color: "text-yellow-600",
      trend: "down"
    },
    {
      title: "Consultas Hoje",
      value: "45",
      icon: Calendar,
      description: "12 em espera",
      color: "text-purple-600",
      trend: "up"
    }
  ]

  const alerts = [
    {
      title: "Alta Ocupação UTI",
      description: "UTI está com 90% de ocupação",
      type: "warning"
    },
    {
      title: "Medicamentos em Baixa",
      description: "3 itens precisam de reposição",
      type: "alert"
    }
  ]

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo(a), {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
          <Stethoscope className="h-5 w-5 text-blue-500" />
          <span className="text-blue-700 font-medium">
            {user?.role === 'administrador' ? 'Administrador' : 'Profissional de Saúde'}
          </span>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alertas e Notificações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <h3 className={`font-medium ${
                    alert.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {alert.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {alert.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Novo paciente registrado
                  </p>
                  <p className="text-xs text-gray-500">
                    Há 5 minutos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Alta médica realizada
                  </p>
                  <p className="text-xs text-gray-500">
                    Há 15 minutos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 