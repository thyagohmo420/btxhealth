import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface Patient {
  id: string;
  full_name: string;
  cpf: string;
}

interface Professional {
  id: string;
  full_name: string;
  specialty: string;
}

const prescriptionSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  professional_id: z.string().min(1, 'Médico é obrigatório'),
  medicine: z.string().min(1, 'Medicamento é obrigatório'),
  dosage: z.string().min(1, 'Dosagem é obrigatória'),
  route: z.string().min(1, 'Via de administração é obrigatória'),
  frequency: z.string().min(1, 'Frequência é obrigatória'),
  priority: z.enum(['low', 'medium', 'high']),
  scheduled_for: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional()
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface NewPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrescriptionFormData) => void;
}

export default function NewPrescriptionModal({ isOpen, onClose, onSubmit }: NewPrescriptionModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema)
  });

  useEffect(() => {
    fetchPatientsAndProfessionals();
  }, []);

  const fetchPatientsAndProfessionals = async () => {
    try {
      setLoading(true);

      // Buscar pacientes da triagem
      const { data: triageData, error: triageError } = await supabase
        .from('triage')
        .select(`
          id,
          patient:patients (
            id,
            full_name,
            cpf
          )
        `)
        .eq('status', 'waiting');

      if (triageError) throw triageError;

      // Buscar profissionais médicos ativos
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('professionals')
        .select('id, full_name, specialty')
        .eq('active', true);

      if (professionalsError) throw professionalsError;

      // Formatar dados dos pacientes (removendo duplicatas)
      const uniquePatients = Array.from(
        new Map(
          triageData
            .filter((item: any) => item.patient)
            .map((item: any) => [
              item.patient.id,
              {
                id: item.patient.id,
                full_name: item.patient.full_name,
                cpf: item.patient.cpf
              }
            ])
        ).values()
      );

      setPatients(uniquePatients);
      setProfessionals(professionalsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: PrescriptionFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
      toast.success('Prescrição criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar prescrição');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Nova Prescrição</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <select
                  {...register('patient_id')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} - {patient.cpf}
                    </option>
                  ))}
                </select>
                {errors.patient_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.patient_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico
                </label>
                <select
                  {...register('professional_id')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Selecione um médico...</option>
                  {professionals.map(professional => (
                    <option key={professional.id} value={professional.id}>
                      {professional.full_name} - {professional.specialty}
                    </option>
                  ))}
                </select>
                {errors.professional_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.professional_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicamento
                </label>
                <input
                  type="text"
                  {...register('medicine')}
                  className="w-full p-2 border rounded-md"
                  placeholder="Nome do medicamento"
                />
                {errors.medicine && (
                  <p className="text-red-500 text-sm mt-1">{errors.medicine.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosagem
                </label>
                <input
                  type="text"
                  {...register('dosage')}
                  className="w-full p-2 border rounded-md"
                  placeholder="Ex: 1 comprimido"
                />
                {errors.dosage && (
                  <p className="text-red-500 text-sm mt-1">{errors.dosage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Via de Administração
                </label>
                <select
                  {...register('route')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Selecione...</option>
                  <option value="oral">Oral</option>
                  <option value="intravenosa">Intravenosa</option>
                  <option value="intramuscular">Intramuscular</option>
                  <option value="subcutanea">Subcutânea</option>
                  <option value="topica">Tópica</option>
                </select>
                {errors.route && (
                  <p className="text-red-500 text-sm mt-1">{errors.route.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência
                </label>
                <input
                  type="text"
                  {...register('frequency')}
                  className="w-full p-2 border rounded-md"
                  placeholder="Ex: 8/8h"
                />
                {errors.frequency && (
                  <p className="text-red-500 text-sm mt-1">{errors.frequency.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  {...register('priority')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data/Hora Inicial
                </label>
                <input
                  type="datetime-local"
                  {...register('scheduled_for')}
                  className="w-full p-2 border rounded-md"
                />
                {errors.scheduled_for && (
                  <p className="text-red-500 text-sm mt-1">{errors.scheduled_for.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  {...register('notes')}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 