import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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
  const router = useRouter();
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
        toast.success('Registro criado com sucesso!');
        router.push('/prontuario');
      }
    } catch (err) {
      console.error('Erro completo:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao criar registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Novo Registro</CardTitle>
          <Button
            variant="outline"
            onClick={() => router.push('/prontuario')}
          >
            Voltar
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Paciente:
                <Select
                  name="patientId"
                  value={formData.patientId}
                  onValueChange={(value) => handleInputChange({ target: { name: 'patientId', value } } as any)}
                  required
                >
                  <option value="">Selecione o paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} - {patient.cpf}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Profissional:
                <Select
                  name="professionalId"
                  value={formData.professionalId}
                  onValueChange={(value) => handleInputChange({ target: { name: 'professionalId', value } } as any)}
                  required
                >
                  <option value="">Selecione o profissional</option>
                  {professionals.map(professional => (
                    <option key={professional.id} value={professional.id}>
                      {professional.full_name} - {professional.specialty}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo:
                <Select
                  name="type"
                  value={formData.type}
                  onValueChange={(value) => handleInputChange({ target: { name: 'type', value } } as any)}
                  required
                >
                  <option value="consultation">Consulta</option>
                  <option value="return">Retorno</option>
                  <option value="exam">Exame</option>
                  <option value="procedure">Procedimento</option>
                </Select>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Observações:
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={6}
                  required
                />
              </label>
            </div>

            {(formData.type === 'consultation' || formData.type === 'return') && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prescrição:
                    <Textarea
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Solicitação de Exames:
                    <Textarea
                      name="exam_request"
                      value={formData.exam_request}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </label>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Anexos:
                <Input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 