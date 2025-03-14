import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface QueueItem {
  id: string;
  ticket_number: string;
  patient_name: string;
  room: string;
  room_display: string;
  status: string;
  status_display: string;
  called_at: string | null;
  priority: string;
}

export default function QueueManagement() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('queue_display')
        .select('*')
        .eq('status', 'aguardando')
        .order('created_at');

      if (error) throw error;
      setQueueItems(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar senhas:', error);
      toast.error('Erro ao buscar senhas');
    } finally {
      setLoading(false);
    }
  };

  const callToRoom = async (room: string) => {
    try {
      const { data, error } = await supabase
        .rpc('call_next_ticket', { p_room: room });

      if (error) throw error;
      
      if (data && data[0]) {
        const audio = document.getElementById('callSound') as HTMLAudioElement;
        if (audio) {
          audio.play().catch(console.error);
        }
        toast.success(`Senha ${data[0].ticket_number} chamada para ${room}`);
      }
      
      await fetchQueue();
    } catch (error: any) {
      console.error('Erro ao chamar próxima senha:', error);
      toast.error('Erro ao chamar próxima senha');
    }
  };

  useEffect(() => {
    fetchQueue();

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Senhas</h1>
        <div className="text-gray-600">
          {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      {/* Botões de chamada */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <button
          onClick={() => callToRoom('TRIAGEM')}
          className="w-full h-16 text-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg"
        >
          Chamar para Triagem
        </button>

        <button
          onClick={() => callToRoom('CONSULTORIO1')}
          className="w-full h-16 text-xl font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg"
        >
          Chamar para Consultório 1
        </button>

        <button
          onClick={() => callToRoom('CONSULTORIO2')}
          className="w-full h-16 text-xl font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg"
        >
          Chamar para Consultório 2
        </button>
      </div>

      {/* Lista de senhas aguardando */}
      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Senha</th>
                <th className="px-4 py-3 text-left">Paciente</th>
                <th className="px-4 py-3 text-left">Prioridade</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Sala</th>
                <th className="px-4 py-3 text-left">Horário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {queueItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.ticket_number}</td>
                  <td className="px-4 py-3">{item.patient_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      item.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                      item.priority === 'priority' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority === 'emergency' ? 'Emergência' :
                       item.priority === 'priority' ? 'Prioritário' :
                       'Normal'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.status_display}</td>
                  <td className="px-4 py-3">{item.room_display || '-'}</td>
                  <td className="px-4 py-3">
                    {item.called_at
                      ? format(new Date(item.called_at), 'HH:mm')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <audio id="callSound" src="/sounds/call.mp3" />
    </div>
  );
} 