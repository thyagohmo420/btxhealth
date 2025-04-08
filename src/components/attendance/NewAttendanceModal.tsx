import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Loader2, X } from 'lucide-react';

interface NewAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

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

const attendanceSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  professional_id: z.string().min(1, 'Selecione um profissional'),
  type: z.string().min(1, 'Selecione o tipo de atendimento'),
  notes: z.string().min(1, 'Informe as observações'),
  prescription: z.string().optional(),
  exam_request: z.string().optional(),
  attachments: z.any().optional()
});

export default function NewAttendanceModal({ isOpen, onClose, onSubmit }: NewAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(attendanceSchema)
  });

  const type = watch('type');

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchProfessionals();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, cpf')
        .eq('active', true)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast.error('Erro ao carregar pacientes');
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, full_name, specialty')
        .eq('active', true)
        .order('full_name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar profissionais');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Validar tipos de arquivo permitidos
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const validFiles = files.filter(file => allowedTypes.includes(file.type));
      
      if (validFiles.length !== files.length) {
        toast.error('Alguns arquivos foram ignorados. Apenas PDF, JPEG e PNG são permitidos.');
      }
      
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Upload dos arquivos
      const attachments = [];
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `attendance/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        attachments.push({
          path: filePath,
          name: file.name,
          type: file.type
        });
      }

      // Criar o registro de atendimento
      const attendanceData = {
        patient_id: data.patient_id,
        professional_id: data.professional_id,
        type: data.type,
        notes: data.notes,
        prescription: data.prescription,
        exam_request: data.exam_request,
        attachments: attachments,
        status: 'active',
        record_date: new Date().toISOString()
      };

      onSubmit(attendanceData);
      reset();
      setUploadedFiles([]);
      setSelectedType('');
    } catch (error: any) {
      console.error('Erro ao criar atendimento:', error);
      toast.error(error.message || 'Erro ao criar atendimento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Novo Atendimento</h3>
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
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} - CPF: {patient.cpf}
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profissional
              </label>
              <select
                {...register('professional_id')}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um profissional</option>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.full_name} - {professional.specialty}
                  </option>
                ))}
              </select>
              {errors.professional_id && (
                <p className="mt-1 text-sm text-red-600">{errors.professional_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Atendimento
              </label>
              <select
                {...register('type')}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o tipo</option>
                <option value="consultation">Consulta</option>
                <option value="return">Retorno</option>
                <option value="exam">Exame</option>
                <option value="procedure">Procedimento</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observações do atendimento..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            {(selectedType === 'consultation' || selectedType === 'return') && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receita Médica
                </label>
                <textarea
                  {...register('prescription')}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite a prescrição médica..."
                />
              </div>
            )}

            {(selectedType === 'consultation' || selectedType === 'return') && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solicitação de Exames
                </label>
                <textarea
                  {...register('exam_request')}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite os exames solicitados..."
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anexos (Guias de Exames, Receitas, etc)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
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
                  <div className="mt-2 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setUploadedFiles([]);
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