import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QueueItem {
  id: string;
  ticket_number: string;
  patient_name: string;
  room: string;
  called_at: string;
  status: string;
}

export default function QueueDisplay() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Atualizar data e hora a cada minuto
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Buscar senhas chamadas
    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from('queue_display')
        .select('*')
        .in('status', ['em_atendimento', 'triagem'])
        .order('called_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar senhas:', error);
        return;
      }

      setQueueItems(data || []);
    };

    fetchQueue();

    // Inscrever para atualizações em tempo real
    const subscription = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_tickets',
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Cabeçalho */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-800 mb-4">
          Sistema de Chamadas BTx Health
        </h1>
        <p className="text-xl text-gray-600">
          {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy, HH:mm", {
            locale: ptBR,
          })}
        </p>
      </div>

      {/* Grid de chamadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queueItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-purple-800 mb-2">
                {item.ticket_number}
              </div>
              <div className="text-xl text-gray-800 text-center mb-2">
                {item.patient_name}
              </div>
              <div className="text-lg text-purple-600 font-semibold">
                {item.room || 'Aguardando sala...'}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {format(new Date(item.called_at), 'HH:mm')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há chamadas */}
      {queueItems.length === 0 && (
        <div className="text-center text-gray-500 text-xl mt-12">
          Nenhuma senha sendo chamada no momento
        </div>
      )}
    </div>
  );
} 