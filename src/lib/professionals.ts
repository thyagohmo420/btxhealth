import { supabase } from './supabase';

interface Professional {
  id: string;
  full_name: string;
  specialty: string;
  registration_number: string;
  sector_id: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateProfessionalData {
  full_name: string;
  specialty: string;
  registration_number: string;
  sector_id: string;
  active: boolean;
  user_id: string;
}

export const professionals = {
  async getAll(): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('full_name');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async create(professional: CreateProfessionalData): Promise<Professional> {
    const { data, error } = await supabase
      .from('professionals')
      .insert([professional])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async update(id: string, professional: Partial<CreateProfessionalData>): Promise<Professional> {
    const { data, error } = await supabase
      .from('professionals')
      .update(professional)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}; 