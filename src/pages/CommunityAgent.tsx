import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Home,
  Users,
  Calendar,
  Bell,
  Plus,
  Search,
  Filter,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Visit {
  id: string;
  patientName: string;
  address: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'routine' | 'followup' | 'emergency';
  notes?: string;
  alerts?: string[];
}

const mockVisits: Visit[] = [
  {
    id: '1',
    patientName: 'Maria Silva',
    address: 'Rua das Flores, 123 - Centro',
    date: '2024-03-20T10:00:00',
    status: 'scheduled',
    type: 'routine',
    alerts: ['Paciente hipertenso', 'Medicação em uso']
  },
  {
    id: '2',
    patientName: 'José Santos',
    address: 'Av. Principal, 456 - Jardim',
    date: '2024-03-20T14:30:00',
    status: 'completed',
    type: 'followup',
    notes: 'Paciente apresentou melhora significativa',
    alerts: ['Diabético']
  }
];

export default function CommunityAgent() {
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    setShowNewVisit(false);
    reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'routine':
        return 'bg-blue-100 text-blue-800';
      case 'followup':
        return 'bg-purple-100 text-purple-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Agente Comunitário</h2>
        <button
          onClick={() => setShowNewVisit(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Visita
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Home className="w-5 h-5" />
            <h3 className="font-semibold">Visitas Hoje</h3>
          </div>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Pacientes Ativos</h3>
          </div>
          <p className="text-3xl font-bold">45</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Visitas na Semana</h3>
          </div>
          <p className="text-3xl font-bold">32</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-semibold">Alertas</h3>
          </div>
          <p className="text-3xl font-bold">3</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar paciente ou endereço..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {mockVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-lg">{visit.patientName}</h4>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      {visit.address}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(visit.status)}`}>
                      {visit.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(visit.type)}`}>
                      {visit.type}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    {new Date(visit.date).toLocaleString()}
                  </div>

                  {visit.alerts && visit.alerts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Alertas:</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.alerts.map((alert, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {alert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                      <p className="text-sm text-gray-600">{visit.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {visit.status === 'scheduled' && (
                    <>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-800">
                        <CheckCircle2 className="w-4 h-4" />
                        Concluir
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800">
                        <AlertCircle className="w-4 h-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNewVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Nova Visita</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente
                  </label>
                  <input
                    type="text"
                    {...register('patientName')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Visita
                  </label>
                  <select
                    {...register('type')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="routine">Rotina</option>
                    <option value="followup">Acompanhamento</option>
                    <option value="emergency">Emergência</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alertas
                  </label>
                  <input
                    type="text"
                    {...register('alerts')}
                    placeholder="Separar por vírgula"
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewVisit(false)}
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