import { create } from 'zustand';
import { supabase } from './supabase';
import { toast } from 'sonner';
import type { Database } from '../types/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Queue = Database['public']['Tables']['queue']['Row'];

interface ServiceStore {
  // Appointments
  appointments: Appointment[];
  loadingAppointments: boolean;
  fetchAppointments: () => Promise<void>;
  createAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  checkInAppointment: (id: string) => Promise<void>;
  startAppointment: (id: string) => Promise<void>;
  endAppointment: (id: string) => Promise<void>;
  
  // Queue
  queue: Queue[];
  loadingQueue: boolean;
  fetchQueue: () => Promise<void>;
  addToQueue: (data: Omit<Queue, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateQueueStatus: (id: string, status: string) => Promise<void>;
  startService: (id: string) => Promise<void>;
  endService: (id: string) => Promise<void>;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  // Appointments
  appointments: [],
  loadingAppointments: false,
  fetchAppointments: async () => {
    try {
      set({ loadingAppointments: true });
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
      set({ loadingAppointments: false });
    }
  },
  createAppointment: async (data) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([data]);

      if (error) throw error;
      toast.success('Agendamento criado com sucesso');
      get().fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    }
  },
  updateAppointment: async (id, data) => {
    try {
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
    }
  },
  checkInAppointment: async (id) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          check_in_time: new Date().toISOString(),
          status: 'checked_in'
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Check-in realizado com sucesso');
      get().fetchAppointments();
    } catch (error) {
      console.error('Error checking in appointment:', error);
      toast.error('Erro ao realizar check-in');
    }
  },
  startAppointment: async (id) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          start_time: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Atendimento iniciado');
      get().fetchAppointments();
    } catch (error) {
      console.error('Error starting appointment:', error);
      toast.error('Erro ao iniciar atendimento');
    }
  },
  endAppointment: async (id) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Atendimento finalizado');
      get().fetchAppointments();
    } catch (error) {
      console.error('Error ending appointment:', error);
      toast.error('Erro ao finalizar atendimento');
    }
  },
  
  // Queue
  queue: [],
  loadingQueue: false,
  fetchQueue: async () => {
    try {
      set({ loadingQueue: true });
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
      set({ loadingQueue: false });
    }
  },
  addToQueue: async (data) => {
    try {
      const { error } = await supabase
        .from('queue')
        .insert([data]);

      if (error) throw error;
      toast.success('Paciente adicionado à fila');
      get().fetchQueue();
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast.error('Erro ao adicionar à fila');
    }
  },
  updateQueueStatus: async (id, status) => {
    try {
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
    }
  },
  startService: async (id) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({
          service_start: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Atendimento iniciado');
      get().fetchQueue();
    } catch (error) {
      console.error('Error starting service:', error);
      toast.error('Erro ao iniciar atendimento');
    }
  },
  endService: async (id) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({
          service_end: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Atendimento finalizado');
      get().fetchQueue();
    } catch (error) {
      console.error('Error ending service:', error);
      toast.error('Erro ao finalizar atendimento');
    }
  }
}));