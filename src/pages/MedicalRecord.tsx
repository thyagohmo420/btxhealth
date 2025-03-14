import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Pill,
  AlertCircle,
  Activity,
  FileCheck,
  Plus,
  Heart,
  History,
  Search,
  Download,
  Calendar,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useSenhas } from '@/hooks/useSenhas';
import { Senha } from '@/types/queue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NewEvolutionForm {
  type: string;
  description: string;
  diagnosis: string;
  procedures: string[];
  vitalSigns: {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    weight: string;
    height: string;
  };
  attachments: FileList;
  privateNotes: string;
  template?: string;
  specialty?: string;
  criticalConditions?: string[];
}

const validateVitalSigns = (vitalSigns: any) => {
  const errors: Record<string, string> = {};

  if (vitalSigns.temperature) {
    const temp = parseFloat(vitalSigns.temperature);
    if (temp < 35 || temp > 42) {
      errors.temperature = 'Temperatura fora dos limites normais (35°C - 42°C)';
    }
  }

  if (vitalSigns.bloodPressure) {
    if (!/^\d{2,3}\/\d{2,3}$/.test(vitalSigns.bloodPressure)) {
      errors.bloodPressure = 'Formato inválido. Use: 120/80';
    } else {
      const [systolic, diastolic] = vitalSigns.bloodPressure.split('/').map(Number);
      if (systolic < 70 || systolic > 220 || diastolic < 40 || diastolic > 140) {
        errors.bloodPressure = 'Valores de pressão arterial fora dos limites normais';
      }
    }
  }

  if (vitalSigns.heartRate) {
    const hr = parseInt(vitalSigns.heartRate);
    if (hr < 40 || hr > 200) {
      errors.heartRate = 'Frequência cardíaca fora dos limites normais (40-200 bpm)';
    }
  }

  if (vitalSigns.respiratoryRate) {
    const rr = parseInt(vitalSigns.respiratoryRate);
    if (rr < 8 || rr > 40) {
      errors.respiratoryRate = 'Frequência respiratória fora dos limites normais (8-40 rpm)';
    }
  }

  if (vitalSigns.oxygenSaturation) {
    const sat = parseInt(vitalSigns.oxygenSaturation);
    if (sat < 0 || sat > 100) {
      errors.oxygenSaturation = 'Saturação deve estar entre 0% e 100%';
    }
  }

  return errors;
};

const evolutionTemplates = {
  clinicaGeral: {
    description: `SUBJETIVO:
- Queixa principal:
- História da doença atual:
- Antecedentes:

OBJETIVO:
- Exame físico:
- Sinais vitais:

AVALIAÇÃO:
- Hipóteses diagnósticas:

PLANO:
- Conduta:
- Prescrição:
- Exames solicitados:
- Retorno:`,
    specialty: 'Clínica Geral'
  },
  pediatria: {
    description: `CRESCIMENTO E DESENVOLVIMENTO:
- Peso:
- Altura:
- PC:
- Marcos do desenvolvimento:

ALIMENTAÇÃO:
- Aleitamento:
- Complementar:

IMUNIZAÇÃO:
- Vacinas pendentes:

QUEIXAS:
- Principal:
- Associadas:

CONDUTA:`,
    specialty: 'Pediatria'
  }
};

export default function MedicalRecord() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'evolution');
  const [showNewEvolution, setShowNewEvolution] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<NewEvolutionForm>();
  const { senhas, loading, chamarProxima, finalizarAtendimento } = useSenhas();

  const senhasConsultorio = senhas.filter(
    (senha) => 
      (senha.setor === 'consultorio1' || senha.setor === 'consultorio2') && 
      senha.status === 'em_atendimento'
  );

  const handleChamarProxima = async (setor: 'consultorio1' | 'consultorio2') => {
    try {
      await chamarProxima(setor);
    } catch (error) {
      console.error('Erro ao chamar próxima senha:', error);
    }
  };

  const handleFinalizarAtendimento = async (senhaId: string) => {
    try {
      await finalizarAtendimento(senhaId);
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
    }
  };

  const onSubmit = async (data: NewEvolutionForm) => {
    try {
      if (!data.type || !data.description) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const vitalSignsErrors = validateVitalSigns(data.vitalSigns);
      if (Object.keys(vitalSignsErrors).length > 0) {
        Object.entries(vitalSignsErrors).forEach(([field, message]) => {
          toast.error(message);
        });
        return;
      }

      const criticalConditions = [];
      const vitalSigns = data.vitalSigns;

      if (parseFloat(vitalSigns.temperature) >= 39) {
        criticalConditions.push('Febre Alta');
      }
      if (vitalSigns.bloodPressure) {
        const [systolic] = vitalSigns.bloodPressure.split('/').map(Number);
        if (systolic >= 180) {
          criticalConditions.push('Hipertensão Grave');
        }
      }
      if (parseInt(vitalSigns.oxygenSaturation) <= 92) {
        criticalConditions.push('Hipoxemia');
      }

      const attachments = Array.from(data.attachments).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      const evolutionData = {
        ...data,
        attachments,
        criticalConditions,
        recordDate: new Date().toISOString(),
        professionalId: 'current-user-id',
        patientId: searchParams.get('patient'),
        signature: {
          professional: 'current-user-name',
          crmCoren: 'current-user-crm',
          timestamp: new Date().toISOString()
        }
      };

      console.log('Salvando evolução:', evolutionData);
      
      if (criticalConditions.length > 0) {
        toast.error(`Atenção! Condições críticas identificadas: ${criticalConditions.join(', ')}`);
      }

      toast.success('Evolução registrada com sucesso');
      setShowNewEvolution(false);
      reset();

      if (searchParams.get('tab') === 'triage') {
        navigate('/triagem');
      }
    } catch (error) {
      console.error('Erro ao salvar evolução:', error);
      toast.error('Erro ao salvar evolução');
    }
  };

  return (
    <div className="container mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Consultório 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              onClick={() => handleChamarProxima('consultorio1')}
              disabled={loading || senhasConsultorio.some(s => s.setor === 'consultorio1')}
            >
              Chamar Próxima Senha
            </Button>

            {senhasConsultorio
              .filter(senha => senha.setor === 'consultorio1')
              .map((senha) => (
                <Card key={senha.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-2xl font-bold">Senha: {senha.numero}</p>
                      <p className="text-sm text-gray-500">
                        Prioridade: {senha.prioridade}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleFinalizarAtendimento(senha.id)}
                    >
                      Finalizar
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultório 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              onClick={() => handleChamarProxima('consultorio2')}
              disabled={loading || senhasConsultorio.some(s => s.setor === 'consultorio2')}
            >
              Chamar Próxima Senha
            </Button>

            {senhasConsultorio
              .filter(senha => senha.setor === 'consultorio2')
              .map((senha) => (
                <Card key={senha.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-2xl font-bold">Senha: {senha.numero}</p>
                      <p className="text-sm text-gray-500">
                        Prioridade: {senha.prioridade}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleFinalizarAtendimento(senha.id)}
                    >
                      Finalizar
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Prontuário Eletrônico</h2>
        <button
          onClick={() => setShowNewEvolution(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Evolução
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('evolution')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'evolution'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Evolução
              </div>
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'exams'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Exames
              </div>
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'prescriptions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Prescrições
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'evolution' && (
            <div>
              {/* Lista de evoluções */}
            </div>
          )}

          {activeTab === 'exams' && (
            <div>
              {/* Lista de exames */}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div>
              {/* Lista de prescrições */}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {/* Histórico médico */}
            </div>
          )}
        </div>
      </div>

      {showNewEvolution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nova Evolução</h3>
              <button
                onClick={() => setShowNewEvolution(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evolução
                  </label>
                  <select
                    {...register('type')}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="consultation">Consulta</option>
                    <option value="return">Retorno</option>
                    <option value="emergency">Emergência</option>
                    <option value="procedure">Procedimento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidade
                  </label>
                  <select
                    {...register('specialty')}
                    onChange={(e) => {
                      const template = evolutionTemplates[e.target.value as keyof typeof evolutionTemplates];
                      if (template) {
                        setValue('description', template.description);
                      }
                    }}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="clinicaGeral">Clínica Geral</option>
                    <option value="pediatria">Pediatria</option>
                    <option value="ginecologia">Ginecologia</option>
                    <option value="ortopedia">Ortopedia</option>
                    <option value="cardiologia">Cardiologia</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('description')}
                      rows={12}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          const template = evolutionTemplates[watch('specialty') as keyof typeof evolutionTemplates];
                          if (template) {
                            setValue('description', template.description);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        Usar Template
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Sinais Vitais</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperatura (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('vitalSigns.temperature')}
                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pressão Arterial
                      </label>
                      <input
                        type="text"
                        {...register('vitalSigns.bloodPressure')}
                        placeholder="120/80"
                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequência Cardíaca
                      </label>
                      <input
                        type="number"
                        {...register('vitalSigns.heartRate')}
                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequência Respiratória
                      </label>
                      <input
                        type="number"
                        {...register('vitalSigns.respiratoryRate')}
                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Saturação O2 (%)
                      </label>
                      <input
                        type="number"
                        {...register('vitalSigns.oxygenSaturation')}
                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diagnóstico
                  </label>
                  <textarea
                    {...register('diagnosis')}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Procedimentos Realizados
                  </label>
                  <textarea
                    {...register('procedures')}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anexos
                  </label>
                  <input
                    type="file"
                    multiple
                    {...register('attachments')}
                    className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações Privadas
                  </label>
                  <textarea
                    {...register('privateNotes')}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewEvolution(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}