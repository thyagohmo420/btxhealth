import { supabase } from './supabaseConfig';
import { MedicalRecord } from '@/types/patient';

export const medicalRecords = {
  async getByPatientId(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patientId', patientId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async create(medicalRecord: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord> {
    const now = new Date().toISOString();
    const record = {
      ...medicalRecord,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    
    const { data, error } = await supabase
      .from('medical_records')
      .insert([record])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async update(id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .update({ ...updates, updatedAt: new Date().toISOString() })
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
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}; 