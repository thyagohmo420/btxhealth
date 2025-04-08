import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import NewAttendanceModal from '../components/attendance/NewAttendanceModal';

interface Patient {
  id: string;
  full_name: string;
  cpf: string;
}

interface Professional {
  id: string;
  full_name: string;
  specialty: string;
}

interface Attendance {
  id: string;
  patient: Patient;
  professional: Professional;
  type: string;
  notes: string;
  attachments: string[];
  status: string;
  record_date: string;
  created_at: string;
}

interface SupabaseAttendance {
  id: string;
  patient: {
    id: string;
    full_name: string;
    cpf: string;
  }[];
  professional: {
    id: string;
    full_name: string;
    specialty: string;
  }[];
  type: string;
  notes: string;
  attachments: string[];
  status: string;
  record_date: string;
  created_at: string;
}

export default function Attendance() {
  const [showNewAttendance, setShowNewAttendance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          patient:patient_id (
            id,
            full_name,
            cpf
          ),
          professional:professional_id (
            id,
            full_name,
            specialty
          ),
          type,
          notes,
          attachments,
          status,
          record_date,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Attendance[] = (data || []).map((item: SupabaseAttendance) => ({
        id: item.id,
        patient: {
          id: item.patient[0].id,
          full_name: item.patient[0].full_name,
          cpf: item.patient[0].cpf
        },
        professional: {
          id: item.professional[0].id,
          full_name: item.professional[0].full_name,
          specialty: item.professional[0].specialty
        },
        type: item.type,
        notes: item.notes,
        attachments: item.attachments,
        status: item.status,
        record_date: item.record_date,
        created_at: item.created_at
      }));

      setAttendances(formattedData);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      toast.error('Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAttendance = async (data: any) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([data]);

      if (error) throw error;

      toast.success('Atendimento criado com sucesso');
      setShowNewAttendance(false);
      fetchAttendances();
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      toast.error('Erro ao criar atendimento');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta';
      case 'return':
        return 'Retorno';
      case 'exam':
        return 'Exame';
      case 'procedure':
        return 'Procedimento';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Atendimentos</h2>
        <button
          onClick={() => setShowNewAttendance(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Atendimento
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Plus className="w-5 h-5" />
            <h3 className="font-semibold">Novos</h3>
          </div>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Plus className="w-5 h-5" />
            <h3 className="font-semibold">Em Andamento</h3>
          </div>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Plus className="w-5 h-5" />
            <h3 className="font-semibold">Aguardando</h3>
          </div>
          <p className="text-3xl font-bold">5</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Plus className="w-5 h-5" />
            <h3 className="font-semibold">Finalizados</h3>
          </div>
          <p className="text-3xl font-bold">45</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar atendimentos..."
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anexos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(attendance.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attendance.patient.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {attendance.patient.cpf}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attendance.professional.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {attendance.professional.specialty}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTypeLabel(attendance.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                      {attendance.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.attachments?.length || 0} anexos
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewAttendanceModal
        isOpen={showNewAttendance}
        onClose={() => setShowNewAttendance(false)}
        onSubmit={handleNewAttendance}
      />
    </div>
  );
} 