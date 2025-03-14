import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseConfig';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Ticket {
  id: string;
  ticket_number: string;
  patient_name: string;
  status: string;
  current_sector: string;
  sector_name: string;
  room?: string;
  priority: string;
}

export default function QueuePanel() {
  const [currentTickets, setCurrentTickets] = useState<Ticket[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const notificationSound = new Audio('/notification.mp3');

  useEffect(() => {
    console.log('QueuePanel mounted');
    fetchTickets();
    const channel = subscribeToTickets();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchTickets, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      console.log('Fetching tickets...');
      setLoading(true);

      // Buscar senhas atuais (waiting, called, in_service)
      const { data: currentData, error: currentError } = await supabase
        .from('queue_display')
        .select('*')
        .in('status', ['waiting', 'called', 'in_service'])
        .order('created_at', { ascending: true });

      if (currentError) {
        console.error('Error fetching current tickets:', currentError);
        throw currentError;
      }

      console.log('Current tickets:', currentData);
      setCurrentTickets(currentData || []);

      // Buscar senhas recentes (últimas 5 completadas)
      const { data: recentData, error: recentError } = await supabase
        .from('queue_history')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.error('Error fetching recent tickets:', recentError);
        throw recentError;
      }

      console.log('Recent tickets:', recentData);
      setRecentTickets(recentData || []);
    } catch (err: any) {
      console.error('Error in fetchTickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTickets = () => {
    console.log('Setting up realtime subscription...');
    // Inscrever para atualizações na fila atual
    const channel = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_tickets'
        },
        (payload) => {
          console.log('Queue change detected:', payload);
          fetchTickets();
          
          // Tocar som quando uma nova senha é chamada
          if (payload.new && payload.new.status === 'called') {
            console.log('Playing notification sound...');
            notificationSound.play().catch(console.error);
          }
        }
      )
      .subscribe();

    return channel;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'text-red-600';
      case 'urgent':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const formatTicketDisplay = (ticket: Ticket) => {
    return `${ticket.ticket_number} - ${ticket.sector_name || ticket.current_sector}${ticket.room ? ` (Sala ${ticket.room})` : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">
          <p className="font-bold">Erro ao carregar o painel</p>
          <p>{error}</p>
          <button 
            onClick={fetchTickets}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Painel de Senhas</h1>
          <p className="text-xl text-gray-600">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Senhas Atuais */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Senhas em Atendimento</h2>
            {currentTickets.filter(t => t.status === 'called' || t.status === 'in_service').length === 0 ? (
              <p className="text-gray-500">Nenhuma senha em atendimento</p>
            ) : (
              currentTickets
                .filter(t => t.status === 'called' || t.status === 'in_service')
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border-l-4 ${
                      ticket.status === 'called' ? 'border-blue-500 bg-blue-50 animate-pulse' : 'border-green-500 bg-green-50'
                    } p-4 mb-4`}
                  >
                    <div className={`text-3xl font-bold ${getPriorityColor(ticket.priority)} mb-2`}>
                      {ticket.ticket_number}
                    </div>
                    <div className="text-xl text-gray-600">
                      {ticket.sector_name || ticket.current_sector}
                      {ticket.room && ` - Sala ${ticket.room}`}
                    </div>
                  </div>
                ))
            )}

            {/* Senhas em Espera */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">Próximas Senhas</h2>
            {currentTickets.filter(t => t.status === 'waiting').length === 0 ? (
              <p className="text-gray-500">Nenhuma senha em espera</p>
            ) : (
              currentTickets
                .filter(t => t.status === 'waiting')
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border-l-4 ${
                      ticket.priority === 'emergency'
                        ? 'border-red-500 bg-red-50'
                        : ticket.priority === 'urgent'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-green-500 bg-green-50'
                    } p-4 mb-4`}
                  >
                    <div className={`text-2xl font-bold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.ticket_number}
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Senhas Recentes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Últimas Chamadas</h2>
            {recentTickets.length === 0 ? (
              <p className="text-gray-500">Nenhuma senha recente</p>
            ) : (
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border-l-4 border-gray-300 bg-gray-50 p-4"
                  >
                    <div className="text-xl font-semibold text-gray-600">
                      {ticket.ticket_number}
                    </div>
                    <div className="text-gray-500">
                      {ticket.sector_name || ticket.current_sector}
                      {ticket.room && ` - Sala ${ticket.room}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 