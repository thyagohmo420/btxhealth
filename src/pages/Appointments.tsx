import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Search, Plus, User, Phone, FileText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  sus_card: string;
  phone: string;
}

interface Professional {
  id: string;
  full_name: string;
  specialty: string;
}

interface Appointment {
  id: string;
  patient_name: string;
  professional_name: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
}

export default function Appointments() {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { register, handleSubmit, reset } = useForm();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAppointments();
    fetchProfessionals();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments_view')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      toast.error('Erro ao carregar lista de atendimentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true)
        .order('full_name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar lista de profissionais');
    }
  };

  const searchPatients = async (term: string) => {
    if (!term) {
      setPatients([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${term}%,cpf.ilike.%${term}%,sus_card.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast.error('Erro ao buscar pacientes');
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedPatient) {
      toast.error('Selecione um paciente');
      return;
    }

    try {
      setLoading(true);

      const appointmentData = {
        patient_id: selectedPatient.id,
        professional_id: data.professional_id,
        date: data.date,
        time: data.time,
        type: data.type,
        notes: data.notes || ''
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;

      toast.success('Atendimento agendado com sucesso');
      setShowNewAppointment(false);
      reset();
      setSelectedPatient(null);
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao agendar atendimento:', error);
      toast.error('Erro ao agendar atendimento');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getAppointmentForTimeSlot = (time: string) => {
    return appointments.find(
      appointment =>
        appointment.date === selectedDate.toISOString().split('T')[0] &&
        appointment.time === time
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.professional_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Agendamentos</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium text-gray-800">
                {formatDate(selectedDate)}
              </h3>
              <button
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {timeSlots.map((time) => {
                const appointment = getAppointmentForTimeSlot(time);
                return (
                  <div
                    key={time}
                    className={`p-3 rounded-lg border ${
                      appointment ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{time}</span>
                      </div>
                      {appointment && (
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{appointment.patient_name}</div>
                            <div className="text-sm text-gray-500">{appointment.professional_name}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-96">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Lista de Agendamentos</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="scheduled">Agendado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{appointment.patient_name}</div>
                        <div className="text-sm text-gray-500">{appointment.professional_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Informações Importantes</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Confirme os agendamentos com 24h de antecedência</li>
          <li>Verifique a disponibilidade do profissional antes de agendar</li>
          <li>Em caso de cancelamento, notifique o paciente</li>
          <li>Mantenha os horários atualizados no sistema</li>
        </ul>
      </div>

      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Novo Atendimento</h2>
              <button
                onClick={() => {
                  setShowNewAppointment(false);
                  setSelectedPatient(null);
                  reset();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Paciente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchPatients(e.target.value);
                  }}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pl-10"
                  placeholder="Digite o nome, CPF ou cartão SUS..."
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {patients.length > 0 && !selectedPatient && (
                <div className="mt-2 border rounded-lg divide-y">
                  {patients.map(patient => (
                    <div
                      key={patient.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchTerm('');
                        setPatients([]);
                      }}
                    >
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-sm text-gray-500">
                          CPF: {patient.cpf} | SUS: {patient.sus_card}
                        </p>
                      </div>
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{selectedPatient.full_name}</p>
                      <p className="text-sm text-gray-600">
                        CPF: {selectedPatient.cpf} | SUS: {selectedPatient.sus_card}
                      </p>
                      {selectedPatient.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedPatient.phone}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Trocar Paciente
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional
                </label>
                <select
                  {...register('professional_id', { required: true })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.full_name} - {prof.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('date', { required: true })}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      {...register('time', { required: true })}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pl-10"
                    />
                    <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Atendimento
                </label>
                <select
                  {...register('type', { required: true })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="consultation">Consulta</option>
                  <option value="return">Retorno</option>
                  <option value="exam">Exame</option>
                  <option value="procedure">Procedimento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAppointment(false);
                    setSelectedPatient(null);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedPatient}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 