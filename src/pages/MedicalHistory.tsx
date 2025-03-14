import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Activity,
  Pill,
  Clock,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface HistoryEntry {
  id: string;
  type: 'consultation' | 'exam' | 'prescription';
  description: string;
  professional: string;
  specialty: string;
  date: string;
  status: string;
  facility: string;
  attachments?: string[];
}

const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    type: 'consultation',
    description: 'Consulta de Rotina',
    professional: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    date: '2024-03-15T10:00:00',
    status: 'completed',
    facility: 'Unidade Central',
    attachments: ['prontuario_15032024.pdf']
  },
  {
    id: '2',
    type: 'exam',
    description: 'Hemograma Completo',
    professional: 'Dra. Maria Santos',
    specialty: 'Laboratório',
    date: '2024-03-16T14:30:00',
    status: 'completed',
    facility: 'Laboratório Central',
    attachments: ['resultado_exame_16032024.pdf']
  }
];

export default function MedicalHistory() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'text-blue-600';
      case 'exam':
        return 'text-green-600';
      case 'prescription':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <FileText className="w-4 h-4" />;
      case 'exam':
        return <Activity className="w-4 h-4" />;
      case 'prescription':
        return <Pill className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Histórico Médico</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Exportar Histórico
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Total de Registros</h3>
          </div>
          <p className="text-3xl font-bold">248</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Consultas</h3>
          </div>
          <p className="text-3xl font-bold">156</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold">Exames</h3>
          </div>
          <p className="text-3xl font-bold">85</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Pill className="w-5 h-5" />
            <h3 className="font-semibold">Prescrições</h3>
          </div>
          <p className="text-3xl font-bold">124</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'timeline'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Linha do Tempo
              </div>
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'consultations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Consultas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'exams'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Exames
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
                placeholder="Buscar no histórico..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="semester">Último Semestre</option>
              <option value="year">Último Ano</option>
              <option value="all">Todo o Histórico</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {activeTab === 'timeline' && (
            <div className="space-y-8">
              {mockHistory.map((entry) => (
                <div key={entry.id} className="relative pl-8">
                  <div className="absolute left-0 top-0">
                    <div className={`p-2 rounded-full ${getTypeColor(entry.type)} bg-opacity-10`}>
                      {getTypeIcon(entry.type)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{entry.description}</h4>
                        <p className="text-sm text-gray-600">
                          {entry.professional} - {entry.specialty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(entry.date).toLocaleString()}
                      </div>
                      <div>{entry.facility}</div>
                    </div>
                    {entry.attachments && entry.attachments.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {entry.attachments.map((file, index) => (
                          <button
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                            {file}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {mockHistory
                .filter((entry) => entry.type === 'consultation')
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{entry.description}</h4>
                        <p className="text-sm text-gray-600">
                          {entry.professional} - {entry.specialty}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(entry.date).toLocaleString()}
                      </div>
                      <div>{entry.facility}</div>
                    </div>
                    {entry.attachments && (
                      <div className="mt-4 flex gap-2">
                        {entry.attachments.map((file, index) => (
                          <button
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                            {file}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4">
              {mockHistory
                .filter((entry) => entry.type === 'exam')
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{entry.description}</h4>
                        <p className="text-sm text-gray-600">
                          {entry.professional} - {entry.facility}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(entry.date).toLocaleString()}
                      </div>
                    </div>
                    {entry.attachments && (
                      <div className="mt-4 flex gap-2">
                        {entry.attachments.map((file, index) => (
                          <button
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                            {file}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}