import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseConfig';
import { toast } from 'sonner';
import { Patient } from '@/types/patient';
import { PatientsContextType } from '@/types/context';

export function usePatients(): PatientsContextType {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando pacientes...');
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`Pacientes carregados: ${data?.length || 0}`);
      console.log('Dados dos pacientes:', data);
      
      setPatients(data || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
      setError('Não foi possível carregar os pacientes');
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }

  async function createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
    try {
      setError(null);
      console.log('Criando novo paciente:', patientData);
      
      // Verificar se já existe paciente com mesmo CPF
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('cpf', patientData.cpf)
        .maybeSingle();
      
      if (existingPatient?.id) {
        console.log('Paciente já existe, atualizando:', existingPatient.id);
        return updatePatient(existingPatient.id, {
          ...patientData,
          updated_at: new Date().toISOString()
        });
      }
      
      // Incluir campos obrigatórios
      const patientWithDefaults = {
        ...patientData,
        status: patientData.status || 'waiting',
        priority: patientData.priority || 'normal',
        severity: patientData.severity || 'low',
        gender: patientData.gender || '',
        marital_status: patientData.marital_status || '',
        email: patientData.email || '',
        created_at: new Date().toISOString()
      };

      console.log('Inserindo novo paciente:', patientWithDefaults);
      
      const { data, error } = await supabase
        .from('patients')
        .insert([patientWithDefaults])
        .select();

      if (error) {
        console.error('Erro na inserção:', error);
        throw error;
      }

      console.log('Paciente criado com sucesso:', data?.[0]?.id);
      
      setPatients(prev => [...(data || []), ...prev]);
      toast.success('Paciente cadastrado com sucesso!');
      return data?.[0];
    } catch (err) {
      console.error('Erro ao criar paciente:', err);
      setError('Não foi possível cadastrar o paciente');
      toast.error('Erro ao cadastrar paciente');
      throw err;
    }
  }

  async function updatePatient(id: string, updates: Partial<Patient>) {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('patients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) throw error;

      setPatients(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates } : p))
      );
      
      if (updates.status === 'waiting') {
        toast.success('Paciente na fila de espera!');
      } else if (updates.status === 'in_progress') {
        toast.success('Consulta iniciada!');
      } else if (updates.status === 'completed') {
        toast.success('Consulta finalizada com sucesso!');
      } else if (updates.status === 'cancelled') {
        toast.success('Consulta cancelada!');
      } else {
        toast.success('Paciente atualizado com sucesso!');
      }
      
      return data?.[0];
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      setError('Não foi possível atualizar o paciente');
      toast.error('Erro ao atualizar paciente');
      throw err;
    }
  }

  async function deletePatient(id: string) {
    try {
      setError(null);
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPatients(prev => prev.filter(p => p.id !== id));
      toast.success('Paciente removido com sucesso!');
    } catch (err) {
      console.error('Erro ao remover paciente:', err);
      setError('Não foi possível remover o paciente');
      toast.error('Erro ao remover paciente');
      throw err;
    }
  }

  async function addMedicalRecord(patientId: string, recordData: any) {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('medical_records')
        .insert([{ ...recordData, patient_id: patientId, created_at: new Date().toISOString() }])
        .select();

      if (error) throw error;

      // Atualizar o paciente com o novo registro médico
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        const updatedPatient = {
          ...patient,
          medical_records: [...(patient.medical_records || []), data[0]]
        };
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
      }

      toast.success('Registro médico adicionado com sucesso!');
      return data?.[0];
    } catch (err) {
      console.error('Erro ao adicionar registro médico:', err);
      setError('Não foi possível adicionar o registro médico');
      toast.error('Erro ao adicionar registro médico');
      throw err;
    }
  }

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    refreshPatients: fetchPatients,
    addMedicalRecord
  };
} 