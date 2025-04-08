import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

export default function DisplayPanel() {
  const [currentCalls, setCurrentCalls] = useState<any[]>([]);
  const [lastCall, setLastCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
    subscribeToChanges();
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('display_calls')
        .select(`
          *,
          patient:patient_id (
            full_name
          ),
          professional:professional_id (
            full_name
          )
        `)
        .in('status', ['waiting', 'called'])
        .order('called_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setLastCall(data[0]);
        setCurrentCalls(data.slice(1));
      }
    } catch (error) {
      console.error('Erro ao carregar chamadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('display_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'display_calls'
        },
        () => {
          fetchCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'emergency':
        return 'text-red-800';
      default:
        return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold">Sistema de Chamadas</h1>
          <p className="text-lg mt-2">Hospital de Juquitiba</p>
        </div>
      </div>

      {/* Última Chamada */}
      {lastCall && (
        <div className="container mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center animate-pulse">
            <div className="text-2xl text-gray-600 mb-4">Chamada Atual</div>
            <div className={`text-5xl font-bold mb-4 ${getPriorityColor(lastCall.priority)}`}>
              {lastCall.patient.full_name}
            </div>
            <div className="text-3xl text-gray-800">
              Sala: {lastCall.room}
            </div>
            {lastCall.professional && (
              <div className="text-xl text-gray-600 mt-2">
                Dr(a). {lastCall.professional.full_name}
              </div>
            )}
            <div className="text-lg text-gray-500 mt-4">
              Senha: {lastCall.call_number}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Próximas Chamadas */}
      <div className="container mx-auto mt-8 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {currentCalls.map((call) => (
            <div
              key={call.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="text-xl font-semibold text-gray-800">
                {call.patient.full_name}
              </div>
              <div className="text-gray-600 mt-2">
                Sala: {call.room}
              </div>
              {call.professional && (
                <div className="text-gray-600">
                  Dr(a). {call.professional.full_name}
                </div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                Senha: {call.call_number}
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(call.called_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé com Data e Hora */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-3">
        <div className="container mx-auto text-center text-2xl">
          {format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: ptBR })}
        </div>
      </div>
    </div>
  );
} 