import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseConfig';
import type { Professional } from '@/types/professional';

interface ProfessionalsContextData {
  professionals: Professional[];
  currentProfessional: Professional | null;
  loading: boolean;
  error: string | null;
  getProfessional: (id: string) => Promise<Professional | null>;
  updateProfessional: (id: string, data: Partial<Professional>) => Promise<void>;
  createProfessional: (data: Omit<Professional, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  setCurrentProfessional: (professional: Professional | null) => void;
}

const ProfessionalsContext = createContext<ProfessionalsContextData>({} as ProfessionalsContextData);

export function ProfessionalsProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfessionals();
  }, []);

  async function loadProfessionals() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*');

      if (error) throw error;

      setProfessionals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  }

  async function getProfessional(id: string) {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar profissional');
      return null;
    }
  }

  async function updateProfessional(id: string, data: Partial<Professional>) {
    try {
      const { error } = await supabase
        .from('professionals')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar profissional');
    }
  }

  async function createProfessional(data: Omit<Professional, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: newProfessional, error } = await supabase
        .from('professionals')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setProfessionals(prev => [...prev, newProfessional]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar profissional');
    }
  }

  async function deleteProfessional(id: string) {
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfessionals(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir profissional');
    }
  }

  return (
    <ProfessionalsContext.Provider
      value={{
        professionals,
        currentProfessional,
        loading,
        error,
        getProfessional,
        updateProfessional,
        createProfessional,
        deleteProfessional,
        setCurrentProfessional
      }}
    >
      {children}
    </ProfessionalsContext.Provider>
  );
}

export function useProfessionals() {
  const context = useContext(ProfessionalsContext);
  if (!context) {
    throw new Error('useProfessionals must be used within a ProfessionalsProvider');
  }
  return context;
} 