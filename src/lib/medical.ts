import { create } from 'zustand';
import { supabase } from './supabase';
import { toast } from 'sonner';
import type { Database } from '../types/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Vaccine = Database['public']['Tables']['vaccines']['Row'];
type VaccineRecord = Database['public']['Tables']['vaccine_records']['Row'];
type Exam = Database['public']['Tables']['exams']['Row'];
type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];

interface MedicalStore {
  // Appointments
  appointments: Appointment[];
  loadingAppointments: boolean;
  fetchAppointments: () => Promise<void>;
  createAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  checkInAppointment: (id: string) => Promise<void>;
  startAppointment: (id: string) => Promise<void>;
  endAppointment: (id: string) => Promise<void>;

  // Vaccines
  vaccines: Vaccine[];
  loadingVaccines: boolean;
  fetchVaccines: () => Promise<void>;
  createVaccine: (data: Omit<Vaccine, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVaccine: (id: string, data: Partial<Vaccine>) => Promise<void>;
  
  // Vaccine Records
  vaccineRecords: VaccineRecord[];
  loadingVaccineRecords: boolean;
  fetchVaccineRecords: (patientId: string) => Promise<void>;
  createVaccineRecord: (data: Omit<VaccineRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  
  // Exams
  exams: Exam[];
  loadingExams: boolean;
  fetchExams: (patientId: string) => Promise<void>;
  createExam: (data: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExam: (id: string, data: Partial<Exam>) => Promise<void>;
  
  // Medical Records
  medicalRecords: MedicalRecord[];
  loadingMedicalRecords: boolean;
  fetchMedicalRecords: (patientId: string) => Promise<void>;
  createMedicalRecord: (data: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const useMedicalStore = create<MedicalStore>((set, get) => ({
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

  // Vaccines
  vaccines: [],
  loadingVaccines: false,
  fetchVaccines: async () => {
    try {
      set({ loadingVaccines: true });
      const { data, error } = await supabase
        .from('vaccines')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      set({ vaccines: data || [] });
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      toast.error('Erro ao carregar vacinas');
    } finally {
      set({ loadingVaccines: false });
    }
  },
  createVaccine: async (data) => {
    try {
      const { error } = await supabase
        .from('vaccines')
        .insert([data]);

      if (error) throw error;
      toast.success('Vacina cadastrada com sucesso');
      get().fetchVaccines();
    } catch (error) {
      console.error('Error creating vaccine:', error);
      toast.error('Erro ao cadastrar vacina');
    }
  },
  updateVaccine: async (id, data) => {
    try {
      const { error } = await supabase
        .from('vaccines')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success('Vacina atualizada com sucesso');
      get().fetchVaccines();
    } catch (error) {
      console.error('Error updating vaccine:', error);
      toast.error('Erro ao atualizar vacina');
    }
  },

  // Vaccine Records
  vaccineRecords: [],
  loadingVaccineRecords: false,
  fetchVaccineRecords: async (patientId) => {
    try {
      set({ loadingVaccineRecords: true });
      const { data, error } = await supabase
        .from('vaccine_records')
        .select('*, vaccines(*)')
        .eq('patient_id', patientId)
        .order('application_date', { ascending: false });

      if (error) throw error;
      set({ vaccineRecords: data || [] });
    } catch (error) {
      console.error('Error fetching vaccine records:', error);
      toast.error('Erro ao carregar histórico de vacinação');
    } finally {
      set({ loadingVaccineRecords: false });
    }
  },
  createVaccineRecord: async (data) => {
    try {
      const { error } = await supabase
        .from('vaccine_records')
        .insert([data]);

      if (error) throw error;
      toast.success('Registro de vacinação criado com sucesso');
      get().fetchVaccineRecords(data.patient_id);
    } catch (error) {
      console.error('Error creating vaccine record:', error);
      toast.error('Erro ao criar registro de vacinação');
    }
  },

  // Exams
  exams: [],
  loadingExams: false,
  fetchExams: async (patientId) => {
    try {
      set({ loadingExams: true });
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('patient_id', patientId)
        .order('request_date', { ascending: false });

      if (error) throw error;
      set({ exams: data || [] });
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Erro ao carregar exames');
    } finally {
      set({ loadingExams: false });
    }
  },
  createExam: async (data) => {
    try {
      const { error } = await supabase
        .from('exams')
        .insert([data]);

      if (error) throw error;
      toast.success('Exame solicitado com sucesso');
      get().fetchExams(data.patient_id);
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Erro ao solicitar exame');
    }
  },
  updateExam: async (id, data) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success('Exame atualizado com sucesso');
      get().fetchExams(data.patient_id!);
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Erro ao atualizar exame');
    }
  },

  // Medical Records
  medicalRecords: [],
  loadingMedicalRecords: false,
  fetchMedicalRecords: async (patientId) => {
    try {
      set({ loadingMedicalRecords: true });
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('record_date', { ascending: false });

      if (error) throw error;
      set({ medicalRecords: data || [] });
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Erro ao carregar prontuário');
    } finally {
      set({ loadingMedicalRecords: false });
    }
  },
  createMedicalRecord: async (data) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([data]);

      if (error) throw error;
      toast.success('Registro adicionado ao prontuário');
      get().fetchMedicalRecords(data.patient_id);
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast.error('Erro ao adicionar registro ao prontuário');
    }
  }
}));