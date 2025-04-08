import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import { Senha, SetorTipo, SenhaStatus, PrioridadeTipo } from '@/types/queue';

export function useSenhas() {
  const [senhas, setSenhas] = useState<Senha[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSenhas = async () => {
    try {
      const { data, error } = await supabase
        .from('senhas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
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

    const channel = supabase
      .channel('senhas_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'senhas' },
        fetchSenhas
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const criarSenha = async (setor: SetorTipo, priority: PrioridadeTipo = 'normal', patientId?: string) => {
    try {
      const { data: ultimaSenha } = await supabase
        .from('senhas')
        .select('number')
        .order('created_at', { ascending: false })
        .limit(1);

      const proximoNumero = (ultimaSenha?.[0]?.number || 0) + 1;

      const { data, error } = await supabase
        .from('senhas')
        .insert([{
          number: proximoNumero.toString().padStart(3, '0'),
          sector: setor,
          status: 'aguardando',
          priority,
          patient_id: patientId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
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

  const atualizarSenha = async (id: string, updates: Partial<Omit<Senha, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('senhas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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
    return senhas.filter(senha => senha.status === 'aguardando' || senha.status === 'chamado');
  };

  return {
    senhas,
    loading,
    criarSenha,
    atualizarSenha,
    getSenhasAtivas
  };
} 