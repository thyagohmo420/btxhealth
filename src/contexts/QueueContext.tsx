import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Senha } from '@/types/queue';
import { supabase } from '@/lib/supabaseConfig';

interface QueueContextData {
  senhas: Senha[];
  loading: boolean;
  criarSenha: (tipo: string, patientId?: string) => Promise<any>;
  atualizarSenha: (id: string, updates: Partial<Senha>) => Promise<any>;
  getSenhasAtivas: () => Senha[];
}

const QueueContext = createContext<QueueContextData>({} as QueueContextData);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [senhas, setSenhas] = useState<Senha[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarSenhas();
    const channel = supabase
      .channel('queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, (payload) => {
        carregarSenhas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function carregarSenhas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSenhas(data || []);
    } catch (error) {
      console.error('Erro ao carregar senhas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function criarSenha(tipo: string, patientId?: string) {
    try {
      const { data, error } = await supabase
        .from('queue')
        .insert([
          {
            numero: `${tipo.toUpperCase()}${Math.floor(Math.random() * 1000)}`,
            setor: 'triagem',
            prioridade: 'normal',
            status: 'waiting',
            patient_id: patientId
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar senha:', error);
      throw error;
    }
  }

  async function atualizarSenha(id: string, updates: Partial<Senha>) {
    try {
      const { data, error } = await supabase
        .from('queue')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  function getSenhasAtivas() {
    return senhas.filter(senha => senha.status !== 'atendido');
  }

  return (
    <QueueContext.Provider
      value={{
        senhas,
        loading,
        criarSenha,
        atualizarSenha,
        getSenhasAtivas
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useSenhas() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useSenhas must be used within a QueueProvider');
  }
  return context;
} 