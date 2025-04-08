import { create } from 'zustand';
import { supabase } from './supabase';
import { toast } from 'sonner';
import type { Database } from '../types/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Queue = {
  id: string;
  ticket_number: string;
  priority: 'normal' | 'priority' | 'emergency';
  sector: 'triage' | 'office1' | 'office2';
  status: 'waiting' | 'called' | 'completed';
  created_at: string;
  updated_at: string;
};

interface AppState {
  // Estado global
  loading: boolean;
  error: string | null;
  
  // Pacientes
  patients: Patient[];
  selectedPatient: Patient | null;
  fetchPatients: () => Promise<void>;
  createPatient: (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  selectPatient: (patient: Patient | null) => void;
  
  // Agendamentos
  appointments: Appointment[];
  fetchAppointments: () => Promise<void>;
  createAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  
  // Fila de Espera
  queue: Queue[];
  fetchQueue: () => Promise<void>;
  addToQueue: (data: Omit<Queue, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateQueueStatus: (id: string, status: Queue['status']) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Estado global
  loading: false,
  error: null,
  
  // Pacientes
  patients: [],
  selectedPatient: null,
  fetchPatients: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ patients: data || [] });
    } catch (error) {
      console.error('Error fetching patients:', error);
      set({ error: 'Failed to fetch patients' });
      toast.error('Erro ao carregar pacientes');
    } finally {
      set({ loading: false });
    }
  },
  createPatient: async (data) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('patients')
        .insert([data]);

      if (error) throw error;
      
      toast.success('Paciente cadastrado com sucesso');
      get().fetchPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Erro ao cadastrar paciente');
    } finally {
      set({ loading: false });
    }
  },
  updatePatient: async (id, data) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Paciente atualizado com sucesso');
      get().fetchPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Erro ao atualizar paciente');
    } finally {
      set({ loading: false });
    }
  },
  selectPatient: (patient) => {
    set({ selectedPatient: patient });
  },
  
  // Agendamentos
  appointments: [],
  fetchAppointments: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      set({ appointments: data || [] });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      set({ loading: false });
    }
  },
  createAppointment: async (data) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('appointments')
        .insert([data]);

      if (error) throw error;
      
      toast.success('Agendamento criado com sucesso');
      get().fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    } finally {
      set({ loading: false });
    }
  },
  updateAppointment: async (id, data) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Agendamento atualizado com sucesso');
      get().fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Erro ao atualizar agendamento');
    } finally {
      set({ loading: false });
    }
  },
  
  // Fila de Espera
  queue: [],
  fetchQueue: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .order('arrival_time', { ascending: true });

      if (error) throw error;
      set({ queue: data || [] });
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Erro ao carregar fila de espera');
    } finally {
      set({ loading: false });
    }
  },
  addToQueue: async (data) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('queue')
        .insert([data]);

      if (error) throw error;
      
      toast.success('Paciente adicionado à fila');
      get().fetchQueue();
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast.error('Erro ao adicionar à fila');
    } finally {
      set({ loading: false });
    }
  },
  updateQueueStatus: async (id, status) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('queue')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Status atualizado com sucesso');
      get().fetchQueue();
    } catch (error) {
      console.error('Error updating queue status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      set({ loading: false });
    }
  }
}));