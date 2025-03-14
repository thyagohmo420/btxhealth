import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseConfig';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  has_active_ticket: boolean;
  current_ticket: string | null;
}

interface Ticket {
  id: string;
  ticket_number: string;
  patient_name: string;
  status: string;
  current_sector: string;
  priority: string;
  room?: string;
  created_at: string;
}

interface QueueStats {
  waiting: number;
  called: number;
  completed: number;
}

export default function QueueManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QueueStats>({ waiting: 0, called: 0, completed: 0 });
  const [selectedSector, setSelectedSector] = useState('triagem');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchTickets();
    const channel = subscribeToTickets();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('queue_display')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setTickets(data || []);

      // Calcular estatísticas
      const stats = (data || []).reduce((acc: QueueStats, ticket) => {
        acc[ticket.status as keyof QueueStats] = (acc[ticket.status as keyof QueueStats] || 0) + 1;
        return acc;
      }, { waiting: 0, called: 0, completed: 0 });

      setStats(stats);
    } catch (error: any) {
      console.error('Erro ao buscar senhas:', error);
      toast.error('Erro ao carregar senhas');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTickets = () => {
    return supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();
  };

  const searchPatients = async () => {
    if (!searchTerm) return;

    try {
      const { data, error } = await supabase
        .rpc('search_patients_for_ticket', {
          search_term: searchTerm
        });

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pacientes:', error);
      toast.error('Erro ao buscar pacientes');
    }
  };

  const generateTicket = async (patientId: string, priority: string = 'normal') => {
    try {
      const { data: ticket, error } = await supabase
        .rpc('generate_patient_ticket', {
          p_patient_id: patientId,
          p_priority: priority
        });

      if (error) throw error;

      toast.success(`Senha ${ticket[0].ticket_number} gerada com sucesso`);
      setShowSearch(false);
      setSearchTerm('');
      setSearchResults([]);
      fetchTickets();
    } catch (error: any) {
      console.error('Erro ao gerar senha:', error);
      toast.error(error.message || 'Erro ao gerar senha');
    }
  };

  const callNextTicket = async () => {
    try {
      const { data: ticket, error } = await supabase
        .rpc('call_next_ticket', { 
          p_sector: selectedSector,
          p_room: selectedRoom || null
        });

      if (error) throw error;

      if (!ticket) {
        toast.info('Não há senhas em espera');
        return;
      }

      toast.success(`Senha ${ticket.ticket_number} chamada para ${selectedSector}`);
      fetchTickets();
    } catch (error: any) {
      console.error('Erro ao chamar próxima senha:', error);
      toast.error('Erro ao chamar próxima senha');
    }
  };

  const forwardTicket = async (ticketId: string, targetSector: string) => {
    try {
      const { data: ticket, error } = await supabase
        .rpc('forward_patient', {
          p_ticket_id: ticketId,
          p_target_sector: targetSector,
          p_room: selectedRoom || null
        });

      if (error) throw error;

      toast.success(`Senha encaminhada para ${targetSector}`);
      fetchTickets();
    } catch (error: any) {
      console.error('Erro ao encaminhar senha:', error);
      toast.error('Erro ao encaminhar senha');
    }
  };

  const completeTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .rpc('complete_ticket', {
          p_ticket_id: ticketId
        });

      if (error) throw error;

      toast.success('Atendimento concluído');
      fetchTickets();
    } catch (error: any) {
      console.error('Erro ao concluir atendimento:', error);
      toast.error('Erro ao concluir atendimento');
    }
  };

  const cancelTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .rpc('cancel_ticket', {
          p_ticket_id: ticketId
        });

      if (error) throw error;

      toast.success('Senha cancelada');
      fetchTickets();
    } catch (error: any) {
      console.error('Erro ao cancelar senha:', error);
      toast.error('Erro ao cancelar senha');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Senhas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">Em Espera</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.waiting}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">Em Atendimento</h3>
            <p className="text-3xl font-bold text-green-600">{stats.called}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">Finalizados</h3>
            <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
          </div>
        </div>

        {/* Busca de Pacientes */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente por nome ou CPF"
              className="flex-1 px-4 py-2 border rounded"
            />
            <button
              onClick={searchPatients}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Buscar
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Resultados da Busca</h4>
              <div className="space-y-2">
                {searchResults.map((patient) => (
                  <div key={patient.id} className="border p-4 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{patient.full_name}</p>
                        <p className="text-sm text-gray-600">
                          CPF: {patient.cpf} | 
                          Nascimento: {format(new Date(patient.birth_date), 'dd/MM/yyyy')}
                        </p>
                        {patient.has_active_ticket && (
                          <p className="text-sm text-yellow-600">
                            Já possui senha ativa: {patient.current_ticket}
                          </p>
                        )}
                      </div>
                      {!patient.has_active_ticket && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => generateTicket(patient.id, 'normal')}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Normal
                          </button>
                          <button
                            onClick={() => generateTicket(patient.id, 'priority')}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            Prioritária
                          </button>
                          <button
                            onClick={() => generateTicket(patient.id, 'emergency')}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Emergência
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="triagem">Triagem</option>
            <option value="consultorio_1">Consultório 1</option>
            <option value="consultorio_2">Consultório 2</option>
          </select>

          <input
            type="text"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            placeholder="Número da sala (opcional)"
            className="px-4 py-2 border rounded"
          />

          <button
            onClick={callNextTicket}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Chamar Próxima Senha
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Senha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Setor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ticket.ticket_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ticket.patient_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'waiting' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'called' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'in_service' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ticket.current_sector}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'priority' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {ticket.status === 'waiting' && (
                      <button
                        onClick={() => callNextTicket()}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Chamar
                      </button>
                    )}
                    {(ticket.status === 'called' || ticket.status === 'in_service') && (
                      <>
                        <button
                          onClick={() => forwardTicket(ticket.id, 'consultorio_1')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Encaminhar
                        </button>
                        <button
                          onClick={() => completeTicket(ticket.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Concluir
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => cancelTicket(ticket.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 