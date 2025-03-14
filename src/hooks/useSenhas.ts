import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';

interface Senha {
  id: string;
  numero: number;
  tipo: string;
  status: string;
  patient_id?: string;
  professional_id?: string;
  created_at: string;
  updated_at: string;
}

export function useSenhas() {
  const [senhas, setSenhas] = useState<Senha[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSenhas = async () => {
    try {
      const { data, error } = await supabase
        .from('senhas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar senhas:', error);
        throw error;
      }

      setSenhas(data || []);
    } catch (error) {
      console.error('Erro ao buscar senhas:', error);
      toast.error('Erro ao carregar senhas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSenhas();

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('senhas_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'senhas' },
        () => {
          fetchSenhas();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const criarSenha = async (tipo: string, patientId?: string) => {
    try {
      // Buscar o último número de senha
      const { data: ultimaSenha } = await supabase
        .from('senhas')
        .select('numero')
        .order('numero', { ascending: false })
        .limit(1);

      const proximoNumero = (ultimaSenha?.[0]?.numero || 0) + 1;

      const { data, error } = await supabase
        .from('senhas')
        .insert([
          {
            numero: proximoNumero,
            tipo,
            status: 'waiting',
            patient_id: patientId
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Senha gerada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar senha:', error);
      toast.error('Erro ao gerar senha');
      throw error;
    }
  };

  const atualizarSenha = async (id: string, updates: Partial<Senha>) => {
    try {
      const { data, error } = await supabase
        .from('senhas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha');
      throw error;
    }
  };

  const getSenhasAtivas = () => {
    return senhas.filter(senha => senha.status === 'waiting' || senha.status === 'called');
  };

  return {
    senhas,
    loading,
    criarSenha,
    atualizarSenha,
    getSenhasAtivas
  };
} 