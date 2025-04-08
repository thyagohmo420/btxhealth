import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Calendar,
  FileText,
  Activity,
  Bell,
  Search,
  Filter,
  Download,
  Clock
} from 'lucide-react';

interface Appointment {
  id: string;
  type: string;
  date: string;
  doctor: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Exam {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed';
  result?: string;
}

export default function CitizenApp() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [searchTerm, setSearchTerm] = useState('');

  const mockAppointments: Appointment[] = [
    {
      id: '1',
      type: 'Consulta Regular',
      date: '2024-03-20T10:00:00',
      doctor: 'Dr. João Silva',
      status: 'scheduled'
    },
    {
      id: '2',
      type: 'Retorno',
      date: '2024-03-15T14:30:00',
      doctor: 'Dra. Maria Santos',
      status: 'completed'
    }
  ];

  const mockExams: Exam[] = [
    {
      id: '1',
      name: 'Hemograma Completo',
      date: '2024-03-18',
      status: 'completed',
      result: 'Resultados dentro dos padrões normais'
    },
    {
      id: '2',
      name: 'Raio-X Tórax',
      date: '2024-03-22',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Aplicativo Cidadão</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Bell className="w-4 h-4" />
          Ativar Notificações
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Consultas</h3>
          </div>
          <p className="text-3xl font-bold">5</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Exames</h3>
          </div>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold">Histórico Médico</h3>
          </div>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <User className="w-5 h-5" />
            <h3 className="font-semibold">Perfil</h3>
          </div>
          <p className="text-3xl font-bold">100%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'appointments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
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
                <FileText className="w-5 h-5" />
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
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{appointment.type}</h4>
                      <p className="text-sm text-gray-600">{appointment.doctor}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(appointment.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4">
              {mockExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{exam.name}</h4>
                      <p className="text-sm text-gray-600">
                        Data: {new Date(exam.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                      {exam.status === 'completed' && (
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {exam.result && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">Resultado:</p>
                      <p>{exam.result}</p>
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