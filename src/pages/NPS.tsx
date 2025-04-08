import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  MessageSquare,
  BarChart2,
  Users,
  Star,
  Search,
  Filter,
  Download,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Feedback {
  id: string;
  patientName: string;
  score: number;
  comment: string;
  sector: string;
  professional: string;
  date: string;
  status: 'new' | 'reviewed' | 'addressed';
}

export default function NPS() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const mockFeedback: Feedback[] = [
    {
      id: '1',
      patientName: 'Maria Silva',
      score: 9,
      comment: 'Excelente atendimento, equipe muito atenciosa.',
      sector: 'Clínica Geral',
      professional: 'Dr. João Santos',
      date: '2024-03-20T10:00:00',
      status: 'new'
    },
    {
      id: '2',
      patientName: 'José Oliveira',
      score: 6,
      comment: 'Tempo de espera muito longo.',
      sector: 'Pediatria',
      professional: 'Dra. Ana Costa',
      date: '2024-03-19T14:30:00',
      status: 'reviewed'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'addressed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateNPS = (feedbacks: Feedback[]) => {
    const total = feedbacks.length;
    if (total === 0) return 0;

    const promoters = feedbacks.filter(f => f.score >= 9).length;
    const detractors = feedbacks.filter(f => f.score <= 6).length;

    return Math.round(((promoters - detractors) / total) * 100);
  };

  const npsScore = calculateNPS(mockFeedback);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Net Promoter Score (NPS)</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Star className="w-5 h-5" />
            <h3 className="font-semibold">NPS Geral</h3>
          </div>
          <p className="text-3xl font-bold">{npsScore}</p>
          <p className="text-sm text-gray-600 mt-1">+5 vs período anterior</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <ThumbsUp className="w-5 h-5" />
            <h3 className="font-semibold">Promotores</h3>
          </div>
          <p className="text-3xl font-bold">65%</p>
          <p className="text-sm text-gray-600 mt-1">Score 9-10</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <ThumbsDown className="w-5 h-5" />
            <h3 className="font-semibold">Detratores</h3>
          </div>
          <p className="text-3xl font-bold">15%</p>
          <p className="text-sm text-gray-600 mt-1">Score 0-6</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-semibold">Feedbacks</h3>
          </div>
          <p className="text-3xl font-bold">128</p>
          <p className="text-sm text-gray-600 mt-1">Últimos 30 dias</p>
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
                <BarChart2 className="w-5 h-5" />
                Visão Geral
              </div>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'feedback'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Feedbacks
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sectors')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'sectors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Setores
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
                placeholder="Buscar feedback..."
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
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-4">Evolução do NPS</h4>
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

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Distribuição de Scores</h4>
                  <div className="space-y-4">
                    {[
                      { range: '9-10', label: 'Promotores', percentage: 65, color: 'bg-green-600' },
                      { range: '7-8', label: 'Neutros', percentage: 20, color: 'bg-yellow-600' },
                      { range: '0-6', label: 'Detratores', percentage: 15, color: 'bg-red-600' }
                    ].map((item) => (
                      <div key={item.range}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label} ({item.range})</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Principais Temas</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Atendimento', count: 45 },
                      { name: 'Tempo de Espera', count: 32 },
                      { name: 'Infraestrutura', count: 28 },
                      { name: 'Equipe Médica', count: 25 },
                      { name: 'Limpeza', count: 20 }
                    ].map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.count} menções</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {mockFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{feedback.patientName}</h4>
                      <p className="text-sm text-gray-600">
                        {feedback.sector} - {feedback.professional}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
                        {feedback.score}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{feedback.comment}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    {new Date(feedback.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sectors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">NPS por Setor</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Clínica Geral', score: 75 },
                      { name: 'Pediatria', score: 82 },
                      { name: 'Ortopedia', score: 68 },
                      { name: 'Cardiologia', score: 85 }
                    ].map((sector) => (
                      <div key={sector.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{sector.name}</span>
                          <span>{sector.score}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${sector.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4">Melhores Avaliações</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Dra. Ana Costa', rating: 4.8 },
                      { name: 'Dr. João Santos', rating: 4.7 },
                      { name: 'Dra. Maria Silva', rating: 4.6 },
                      { name: 'Dr. Carlos Lima', rating: 4.5 }
                    ].map((professional) => (
                      <div key={professional.name} className="flex justify-between items-center">
                        <span>{professional.name}</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{professional.rating}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  index < Math.floor(professional.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill={index < Math.floor(professional.rating) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                        </div>
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