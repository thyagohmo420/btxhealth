import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

interface FormData {
  patientId: string;
  professionalId: string;
  type: string;
  notes: string;
  prescription: string;
  exam_request: string;
  attachments: File[];
}

export default function NewMedicalRecord() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    professionalId: '',
    type: 'consultation',
    notes: '',
    prescription: '',
    exam_request: '',
    attachments: []
  });

  useEffect(() => {
    fetchPatients();
    fetchProfessionals();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, cpf')
        .eq('active', true)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...Array.from(e.target.files || [])]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Upload dos anexos
      const attachmentUrls = [];
      for (const file of formData.attachments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `medical-records/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw new Error('Erro ao fazer upload dos anexos');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        attachmentUrls.push(publicUrl);
      }

      // Criar o registro
      const { data: record, error: insertError } = await supabase
        .from('medical_records')
        .insert({
          patient_id: formData.patientId,
          professional_id: formData.professionalId,
          type: formData.type,
          notes: formData.notes,
          prescription: formData.prescription || null,
          exam_request: formData.exam_request || null,
          attachments: attachmentUrls,
          status: 'active',
          record_date: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro detalhado:', insertError);
        if (insertError.code === '23503') {
          throw new Error('Paciente ou Profissional não encontrado');
        } else if (insertError.code === '42501') {
          throw new Error('Você não tem permissão para criar registros');
        } else {
          throw new Error(insertError.message || 'Erro ao criar registro');
        }
      }

      if (record) {
        alert('Registro criado com sucesso!');
        navigate('/prontuario');
      }
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Novo Registro</h1>
        <button
          onClick={() => navigate('/prontuario')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">
            Paciente:
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecione o paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} - {patient.cpf}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="block mb-2">
            Profissional:
            <select
              name="professionalId"
              value={formData.professionalId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecione o profissional</option>
              {professionals.map(professional => (
                <option key={professional.id} value={professional.id}>
                  {professional.full_name} - {professional.specialty}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="block mb-2">
            Tipo:
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="consultation">Consulta</option>
              <option value="return">Retorno</option>
              <option value="exam">Exame</option>
              <option value="procedure">Procedimento</option>
            </select>
          </label>
        </div>

        <div>
          <label className="block mb-2">
            Observações:
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={6}
              required
            />
          </label>
        </div>

        {(formData.type === 'consultation' || formData.type === 'return') && (
          <>
            <div>
              <label className="block mb-2">
                Prescrição:
                <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
              </label>
            </div>

            <div>
              <label className="block mb-2">
                Solicitação de Exames:
                <textarea
                  name="exam_request"
                  value={formData.exam_request}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
              </label>
            </div>
          </>
        )}

        <div>
          <label className="block mb-2">
            Anexos:
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="w-full p-2 border rounded"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
} 