import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FileText,
  Bell,
  Download,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Exam {
  id: string;
  patientName: string;
  type: string;
  requestDate: string;
  resultDate?: string;
  status: 'pending' | 'available' | 'viewed';
  priority: 'routine' | 'urgent';
  doctor: string;
  laboratory?: string;
  files?: string[];
}

const mockExams: Exam[] = [
  {
    id: '1',
    patientName: 'Maria Silva',
    type: 'Hemograma Completo',
    requestDate: '2024-03-15',
    resultDate: '2024-03-16',
    status: 'available',
    priority: 'routine',
    doctor: 'Dr. João Santos',
    laboratory: 'Lab Central',
    files: ['hemograma_15032024.pdf']
  },
  {
    id: '2',
    patientName: 'José Oliveira',
    type: 'Raio-X Tórax',
    requestDate: '2024-03-20',
    status: 'pending',
    priority: 'urgent',
    doctor: 'Dra. Ana Costa'
  }
];

export default function Exams() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent'
      ? 'bg-red-100 text-red-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Resultados de Exames</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Bell className="w-4 h-4" />
            Notificações
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="w-4 h-4" />
            Baixar Todos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Total de Exames</h3>
          </div>
          <p className="text-3xl font-bold">156</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Pendentes</h3>
          </div>
          <p className="text-3xl font-bold">23</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-semibold">Disponíveis</h3>
          </div>
          <p className="text-3xl font-bold">45</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Urgentes</h3>
          </div>
          <p className="text-3xl font-bold">8</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Todos os Exames
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Disponíveis
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar exames..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Período
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          <div className="space-y-4">
            {mockExams
              .filter(
                (exam) =>
                  activeTab === 'all' ||
                  exam.status === activeTab
              )
              .map((exam) => (
                <div
                  key={exam.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{exam.patientName}</h4>
                      <p className="text-sm text-gray-600">{exam.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(exam.priority)}`}>
                        {exam.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Solicitante</p>
                      <p className="font-medium">{exam.doctor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data da Solicitação</p>
                      <p className="font-medium">
                        {new Date(exam.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                    {exam.laboratory && (
                      <div>
                        <p className="text-sm text-gray-600">Laboratório</p>
                        <p className="font-medium">{exam.laboratory}</p>
                      </div>
                    )}
                  </div>

                  {exam.resultDate && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Resultado Disponível em:</p>
                      <p className="font-medium">
                        {new Date(exam.resultDate).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {exam.files && exam.files.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {exam.files.map((file, index) => (
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
        </div>
      </div>
    </div>
  );
}