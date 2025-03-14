import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface NewRegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  origin: string;
  last_update: string;
}

interface TriageData {
  id: string;
  patient_id: string;
  status: string;
  patients: Patient;
}

const regulationSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  specialty: z.string().min(1, 'Selecione uma especialidade'),
  priority: z.string().min(1, 'Selecione a prioridade'),
  notes: z.string().min(1, 'Informe a justificativa'),
  attachments: z.any().optional()
});

export default function NewRegulationModal({ isOpen, onClose, onSubmit }: NewRegulationModalProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(regulationSchema)
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      console.log('Buscando pacientes elegíveis para regulação...');
      const { data, error } = await supabase
        .rpc('get_regulation_eligible_patients');

      console.log('Pacientes elegíveis:', data);
      console.log('Erro se houver:', error);

      if (error) throw error;

      // Garantir que data é um array de Patient
      const eligiblePatients = Array.isArray(data) ? data as Patient[] : [];
      setPatients(eligiblePatients);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast.error('Erro ao carregar pacientes elegíveis');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Upload dos arquivos
      const attachments = [];
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `regulation/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        attachments.push(filePath);
      }

      // Obter o profissional logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (profError) {
        console.error('Erro ao buscar profissional:', profError);
        throw new Error('Não foi possível identificar o profissional');
      }

      if (!professional) {
        throw new Error('Profissional não encontrado');
      }

      // Criar a solicitação
      const regulationData = {
        patient_id: data.patient_id,
        professional_id: professional.id,
        specialty: data.specialty,
        priority: data.priority,
        notes: data.notes,
        attachments: attachments,
        status: 'pending'
      };

      onSubmit(regulationData);
      reset();
      setUploadedFiles([]);
    } catch (error: any) {
      console.error('Erro ao criar solicitação:', error);
      toast.error(error.message || 'Erro ao criar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Nova Solicitação de Regulação</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente
              </label>
              <select
                {...register('patient_id')}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient, index) => (
                  <option key={`${patient.id}-${index}`} value={patient.id}>
                    {patient.full_name} - CPF: {patient.cpf} ({patient.origin})
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidade
              </label>
              <select
                {...register('specialty')}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma especialidade</option>
                <option value="Cardiologia">Cardiologia</option>
                <option value="Neurologia">Neurologia</option>
                <option value="Ortopedia">Ortopedia</option>
                <option value="Oftalmologia">Oftalmologia</option>
                <option value="Endocrinologia">Endocrinologia</option>
                <option value="Dermatologia">Dermatologia</option>
                <option value="Psiquiatria">Psiquiatria</option>
                <option value="Urologia">Urologia</option>
              </select>
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                {...register('priority')}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a prioridade</option>
                <option value="emergency">Emergência</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baixa</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justificativa
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva a justificativa para a solicitação..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anexos
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Arquivos selecionados:</p>
                  <ul className="list-disc list-inside">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 