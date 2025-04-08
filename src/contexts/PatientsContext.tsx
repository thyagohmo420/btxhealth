'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Patient, MedicalRecord, VitalSigns } from '@/types/patient';

interface PatientsContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  createPatient: (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<any>;
  deletePatient: (id: string) => Promise<any>;
  getPatient: (id: string) => Patient | undefined;
  getPatientsByStatus: (status: Patient['status']) => Patient[];
  addMedicalRecord: (patientId: string, recordData: Partial<MedicalRecord>) => Promise<any>;
  addVitalSigns: (patientId: string, vitalSigns: VitalSigns) => Promise<any>;
  getVitalSignsHistory: (patientId: string) => Promise<VitalSigns[]>;
  getMedicalRecords: (patientId: string) => Promise<MedicalRecord[]>;
  refreshPatients: () => Promise<void>;
  getPatientHistory: (patientId: string) => Promise<MedicalRecord[]>;
  getMedicalRecordsForNursing: () => Promise<MedicalRecord[]>;
  getMedicalRecordsForLaboratory: () => Promise<MedicalRecord[]>;
}

const PatientsContext = createContext<PatientsContextType | undefined>(undefined);

export const PatientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) throw error;
      
      // Aqui podemos fazer qualquer transformação necessária nos dados
      setPatients(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pacientes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar pacientes ao montar o componente
  useEffect(() => {
    fetchPatients();
  }, []);

  // Função para criar um novo paciente
  const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select();

      if (error) throw error;
      
      await fetchPatients(); // Atualizar a lista após criar
      return data;
    } catch (error: any) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  };

  // Função para atualizar um paciente
  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      await fetchPatients(); // Atualizar a lista após modificar
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  };

  // Função para excluir um paciente
  const deletePatient = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPatients(); // Atualizar a lista após excluir
      return data;
    } catch (error: any) {
      console.error('Erro ao excluir paciente:', error);
      throw error;
    }
  };

  // Função para adicionar um prontuário médico ao paciente
  const addMedicalRecord = async (patientId: string, recordData: Partial<MedicalRecord>) => {
    try {
      // Criar o registro médico
      const { data: record, error: recordError } = await supabase
        .from('medical_records')
        .insert([{
          ...recordData,
          patient_id: patientId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (recordError) throw recordError;
      
      // Atualizar o paciente com o novo registro médico
      await updatePatient(patientId, {
        updated_at: new Date().toISOString()
      });
      
      toast.success('Prontuário médico adicionado com sucesso');
      return record;
    } catch (error: any) {
      console.error('Erro ao adicionar prontuário médico:', error);
      toast.error('Erro ao adicionar prontuário médico');
      throw error;
    }
  };

  // Função para recuperar o histórico completo de um paciente
  const getPatientHistory = async (patientId: string): Promise<MedicalRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar histórico do paciente:', error);
      throw error;
    }
  };

  // Função para buscar prontuários médicos para enfermagem
  const getMedicalRecordsForNursing = async (): Promise<MedicalRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*, patients(*)')
        .eq('sent_to_nursing', true)
        .eq('needs_medication', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar prontuários para enfermagem:', error);
      throw error;
    }
  };

  // Função para buscar prontuários médicos para laboratório
  const getMedicalRecordsForLaboratory = async (): Promise<MedicalRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*, patients(*)')
        .eq('sent_to_laboratory', true)
        .eq('needs_laboratory_exams', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar prontuários para laboratório:', error);
      throw error;
    }
  };

  // Função para atualizar a lista de pacientes
  const refreshPatients = async () => {
    await fetchPatients();
  };

  const getPatient = (id: string) => {
    return patients.find(p => p.id === id);
  };

  const getPatientsByStatus = (status: Patient['status']) => {
    return patients.filter(p => p.status === status);
  };

  const addVitalSigns = async (patientId: string, vitalSigns: VitalSigns) => {
    try {
      const newVitalSigns = {
        ...vitalSigns,
        patient_id: patientId,
        measuredAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vital_signs')
        .insert([newVitalSigns])
        .select('*')
        .single();

      if (error) throw error;

      // Atualizar o paciente com os novos sinais vitais
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        const updatedPatient = {
          ...patient,
          vital_signs: data
        };
        await updatePatient(patientId, updatedPatient);
      }

      toast.success('Sinais vitais registrados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao registrar sinais vitais:', error);
      toast.error('Erro ao registrar sinais vitais');
      throw error;
    }
  };

  const getVitalSignsHistory = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('measuredAt', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar histórico de sinais vitais:', error);
      toast.error('Erro ao buscar histórico de sinais vitais');
      throw error;
    }
  };

  const getMedicalRecords = async (patientId: string): Promise<MedicalRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar registros médicos:', error);
      toast.error('Erro ao buscar registros médicos');
      throw error;
    }
  };

  return (
    <PatientsContext.Provider value={{
      patients,
      loading,
      error,
      createPatient,
      updatePatient,
      deletePatient,
      refreshPatients,
      getPatient,
      getPatientsByStatus,
      addMedicalRecord,
      addVitalSigns,
      getVitalSignsHistory,
      getMedicalRecords,
      getPatientHistory,
      getMedicalRecordsForNursing,
      getMedicalRecordsForLaboratory
    }}>
      {children}
    </PatientsContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientsContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientsProvider');
  }
  return context;
}; 