import { useState, useEffect } from 'react';
import { Monitor, Bell } from 'lucide-react';
import { calls } from '../lib/calls';
import { toast } from 'sonner';

interface Call {
  id: string;
  patient_name: string;
  status: 'waiting' | 'called' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  room?: string;
}

export default function Totem() {
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);
  const [lastCall, setLastCall] = useState<Call | null>(null);

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadCalls = async () => {
    try {
      const data = await calls.getActive();
      if (data) {
        setActiveCalls(data);
        const newCall = data.find(call => 
          call.status === 'called' && 
          (!lastCall || new Date(call.created_at) > new Date(lastCall.created_at))
        );
        
        if (newCall && (!lastCall || newCall.id !== lastCall.id)) {
          setLastCall(newCall);
          playCallSound();
          showCallNotification(newCall);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar chamadas:', error);
    }
  };

  const playCallSound = () => {
    const audio = new Audio('/sounds/call.mp3');
    audio.play().catch(console.error);
  };

  const showCallNotification = (call: Call) => {
    const message = `${call.patient_name} - ${call.room ? `Sala ${call.room}` : ''}`;
    toast.info(message, {
      duration: 5000,
      position: 'top-center'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Painel de Chamadas</h1>
          <Monitor className="w-8 h-8" />
        </div>
      </header>

      {/* Última chamada */}
      {lastCall && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 my-4 mx-auto max-w-4xl animate-pulse">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-yellow-500 mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-yellow-800">
                {lastCall.patient_name}
              </h2>
              <p className="text-yellow-600">
                {lastCall.room ? `Sala ${lastCall.room}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de chamadas */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCalls.map(call => (
            <div
              key={call.id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                call.status === 'called' ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {call.patient_name}
              </h3>
              {call.room && (
                <p className="text-gray-600">Sala {call.room}</p>
              )}
              {call.created_at && (
                <p className="text-sm text-gray-500 mt-2">
                  Chamado às {formatTime(call.created_at)}
                </p>
              )}
              <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                call.priority === 'high' 
                  ? 'bg-red-100 text-red-800'
                  : call.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {call.priority === 'high' 
                  ? 'Prioritário'
                  : call.priority === 'medium'
                  ? 'Intermediário'
                  : 'Normal'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}