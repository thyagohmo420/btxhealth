import { useState } from 'react';
import {
  Activity,
  Heart,
  Stethoscope,
  BarChart2,
  TrendingUp,
  Search,
  Filter,
  Star,
  Clock
} from 'lucide-react';

interface HealthIndicator {
  id: string;
  name: string;
  category: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

interface ServiceMetric {
  id: string;
  name: string;
  current: number;
  previous: number;
  target: number;
  status: 'improved' | 'declined' | 'stable';
}

interface QualityMetric {
  id: string;
  indicator: string;
  value: number;
  target: number;
  trend: 'improving' | 'declining' | 'stable';
  status: 'on_track' | 'at_risk' | 'off_track';
}

const mockHealthIndicators: HealthIndicator[] = [
  {
    id: '1',
    name: 'Taxa de Ocupação',
    category: 'Operacional',
    value: 85,
    target: 90,
    trend: 'up'
  },
  {
    id: '2',
    name: 'Tempo Médio de Espera',
    category: 'Atendimento',
    value: 75,
    target: 80,
    trend: 'down'
  }
];

const mockServiceMetrics: ServiceMetric[] = [
  {
    id: '1',
    name: 'Satisfação do Paciente',
    current: 92,
    previous: 88,
    target: 95,
    status: 'improved'
  },
  {
    id: '2',
    name: 'Tempo de Atendimento',
    current: 85,
    previous: 82,
    target: 90,
    status: 'improved'
  }
];

const mockQualityMetrics: QualityMetric[] = [
  {
    id: '1',
    indicator: 'Segurança do Paciente',
    value: 95,
    target: 98,
    trend: 'improving',
    status: 'on_track'
  },
  {
    id: '2',
    indicator: 'Efetividade Clínica',
    value: 88,
    target: 90,
    trend: 'stable',
    status: 'at_risk'
  }
];

export default function HealthManagement() {
  const [activeTab, setActiveTab] = useState('indicators');

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return 'text-green-600';
      case 'down':
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improved':
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
      case 'off_track':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Gestão de Saúde</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold">Consultas Realizadas</h3>
          </div>
          <p className="text-3xl font-bold">2.845</p>
          <p className="text-sm text-gray-600 mt-1">+12% vs período anterior</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Heart className="w-5 h-5" />
            <h3 className="font-semibold">Taxa de Cobertura</h3>
          </div>
          <p className="text-3xl font-bold">85%</p>
          <p className="text-sm text-gray-600 mt-1">+3% vs período anterior</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Stethoscope className="w-5 h-5" />
            <h3 className="font-semibold">Efetividade</h3>
          </div>
          <p className="text-3xl font-bold">92%</p>
          <p className="text-sm text-gray-600 mt-1">+2% vs período anterior</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('indicators')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'indicators'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Indicadores de Saúde
              </div>
            </button>
            <button
              onClick={() => setActiveTab('efficiency')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'efficiency'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Eficiência Operacional
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'quality'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Qualidade do Serviço
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
                placeholder="Buscar indicadores..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {activeTab === 'indicators' && (
            <div className="space-y-6">
              {mockHealthIndicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">{indicator.name}</h4>
                      <p className="text-sm text-gray-600">{indicator.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getTrendColor(indicator.trend)}`}>
                        {indicator.trend === 'up' ? '↑' : indicator.trend === 'down' ? '↓' : '→'}
                        {indicator.value}%
                      </span>
                      <span className="text-sm text-gray-600">
                        Meta: {indicator.target}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getProgressColor(indicator.value, indicator.target)} h-2 rounded-full`}
                      style={{ width: `${(indicator.value / indicator.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Distribuição por Faixa Etária</h4>
                  <div className="space-y-2">
                    {['0-12', '13-18', '19-29', '30-45', '46-59', '60+'].map((range) => (
                      <div key={range} className="flex justify-between items-center">
                        <span>{range} anos</span>
                        <span className="font-medium">{Math.floor(Math.random() * 30 + 10)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Principais Condições de Saúde</h4>
                  <div className="space-y-2">
                    {[
                      'Hipertensão',
                      'Diabetes',
                      'Obesidade',
                      'Doenças Respiratórias',
                      'Saúde Mental'
                    ].map((condition) => (
                      <div key={condition} className="flex justify-between items-center">
                        <span>{condition}</span>
                        <span className="font-medium">{Math.floor(Math.random() * 30 + 10)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'efficiency' && (
            <div className="space-y-6">
              {mockServiceMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">{metric.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Atual: {metric.current} | Anterior: {metric.previous}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getProgressColor(metric.current, metric.target)} h-2 rounded-full`}
                      style={{ width: `${(metric.current / metric.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Meta: {metric.target}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Distribuição de Atendimentos</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Consultas Agendadas', value: 65 },
                      { name: 'Atendimentos de Urgência', value: 25 },
                      { name: 'Retornos', value: 10 }
                    ].map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Tempo Médio por Etapa</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Triagem', value: 10 },
                      { name: 'Espera por Atendimento', value: 25 },
                      { name: 'Consulta', value: 20 },
                      { name: 'Pós-consulta', value: 15 }
                    ].map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.value} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              {mockQualityMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">{metric.indicator}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm ${getTrendColor(metric.trend)}`}>
                          {metric.trend === 'improving' ? '↑' : metric.trend === 'declining' ? '↓' : '→'}
                          {metric.value}%
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getProgressColor(metric.value, metric.target)} h-2 rounded-full`}
                      style={{ width: `${(metric.value / metric.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Meta: {metric.target}%
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Avaliação por Setor</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Recepção', rating: 4.5 },
                      { name: 'Enfermagem', rating: 4.8 },
                      { name: 'Médicos', rating: 4.7 },
                      { name: 'Laboratório', rating: 4.6 }
                    ].map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{item.rating}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  index < Math.floor(item.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill={index < Math.floor(item.rating) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Indicadores de Segurança</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Eventos Adversos', value: '0.5%' },
                      { name: 'Conformidade Protocolos', value: '98%' },
                      { name: 'Identificação Correta', value: '99.9%' },
                      { name: 'Higienização', value: '97%' }
                    ].map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}