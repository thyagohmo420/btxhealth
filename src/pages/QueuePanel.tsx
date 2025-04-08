import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseConfig';
import type { Senha } from '@/types/queue';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function QueuePanel() {
  const [senhas, setSenhas] = useState<Senha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationSound = new Audio('/notification.mp3');
  const [latestCalled, setLatestCalled] = useState<Senha | null>(null);

  const fetchSenhas = async () => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSenhas(data || []);
    } catch (err) {
      console.error('Erro ao buscar senhas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSenhas();

    const subscription = supabase
      .channel('queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, () => {
        fetchSenhas();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSectorName = (sector: string) => {
    switch (sector) {
      case 'triagem':
        return 'TRIAGEM';
      case 'consultorio1':
        return 'CONSULTÓRIO 1';
      case 'consultorio2':
        return 'CONSULTÓRIO 2';
      default:
        return sector.toUpperCase();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'priority':
        return 'bg-yellow-100 text-yellow-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            fetchSenhas();
          }}
          className="btn btn-error"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {senhas.map((senha) => (
          <div
            key={senha.id}
            className={`card bg-base-100 shadow-xl ${getPriorityColor(senha.priority)}`}
          >
            <div className="card-body">
              <h2 className="card-title justify-center">
                {getSectorName(senha.sector)}
              </h2>
              <div className="text-center">
                <div className="text-4xl font-bold mb-4">{senha.number}</div>
                <div className="badge badge-lg">
                  {senha.priority.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 