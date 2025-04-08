import React, { useState, useEffect } from 'react';
import { Search, Activity, Heart, ThermometerSnowflake, Droplet, Printer, Tag } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import type { Patient, VitalSigns } from '@/types/patient';
import type { PrioridadeTipo } from '@/types/queue';
import { supabase } from '@/lib/supabaseConfig';
import { toast } from 'react-hot-toast';

export default function Triage() {
  const { patients, refreshPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [priority, setPriority] = useState<PrioridadeTipo>('normal');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [vitalSigns, setVitalSigns] = useState<Partial<VitalSigns>>({
    temperature: 0,
    bloodPressure: {
      systolic: 0,
      diastolic: 0
    },
    heartRate: 0,
    respiratoryRate: 0,
    oxygenSaturation: 0,
    painLevel: 0,
    glucoseLevel: 0
  });
  const [triageDone, setTriageDone] = useState(false);
  const [triagePatient, setTriagePatient] = useState<Patient | null>(null);

  // Forçar atualização dos pacientes ao carregar a página
  useEffect(() => {
    console.log("Carregando página de triagem");
    refreshPatients();
  }, [refreshPatients]);

  // Exibir log dos pacientes em espera
  useEffect(() => {
    const waitingPatients = patients.filter(p => p.status === 'waiting');
    console.log(`Pacientes aguardando triagem: ${waitingPatients.length}`);
  }, [patients]);

  // Log de estado para depuração
  useEffect(() => {
    console.log("Estado da triagem:", { 
      triagemConcluida: triageDone, 
      pacienteSelecionado: selectedPatient?.full_name, 
      pacienteClassificado: triagePatient?.full_name,
      prioridade: priority
    });
  }, [triageDone, selectedPatient, triagePatient, priority]);

  // Definição das cores para os níveis de prioridade
  const priorityColors: Record<PrioridadeTipo, string> = {
    normal: 'bg-blue-100 text-blue-800 border-blue-400', // Azul
    priority: 'bg-yellow-100 text-yellow-800 border-yellow-400', // Amarelo
    urgent: 'bg-red-100 text-red-800 border-red-400', // Vermelho
  };

  const priorityLabels: Record<PrioridadeTipo, string> = {
    normal: 'Normal (Azul)',
    priority: 'Prioridade (Amarelo)',
    urgent: 'Urgência (Vermelho)',
  };

  const priorityOrder: Record<PrioridadeTipo, number> = {
    urgent: 3,
    priority: 2,
    normal: 1
  };

  const handleStartTriage = async (patient: Patient) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ 
          status: 'in_progress' as const,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id);

      if (error) throw error;
      setSelectedPatient(patient);
    } catch (error) {
      console.error('Erro ao iniciar triagem:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    try {
      console.log("Iniciando envio de triagem para paciente:", selectedPatient.full_name);
      console.log("Prioridade definida:", priority);
      
      // Atualizar paciente no banco de dados
      const { data: updatedPatient, error } = await supabase
        .from('patients')
        .update({
          priority,
          vital_signs: vitalSigns,
          status: 'waiting_consultation', // Atualiza status do paciente para aguardando consulta
          // Adiciona sintomas ao paciente
          symptoms: symptoms.join(', '),
          // Data de triagem
          triage_date: new Date().toISOString(),
          // Última atualização
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPatient.id)
        .select('*')
        .single();
        
      if (error) {
        console.error("Erro ao atualizar paciente:", error);
        throw error;
      }
      
      console.log("Triagem concluída com sucesso. Paciente atualizado:", updatedPatient);
      // Exibir mensagem de sucesso
      toast.success("Triagem concluída com sucesso!");
      
      // Atualizar estado de triagem
      setTriageDone(true);
      setTriagePatient(updatedPatient);
      
      // Atualizar lista de pacientes
      refreshPatients();
    } catch (error) {
      console.error("Erro ao finalizar triagem:", error);
      toast.error("Erro ao finalizar triagem");
    }
  };

  const handlePrintTag = () => {
    try {
      if (!triagePatient) {
        console.error("Tentativa de imprimir etiqueta sem paciente selecionado");
        toast.error("Erro: Não há paciente selecionado para impressão");
        return;
      }
      
      console.log("Gerando etiqueta para paciente:", triagePatient);
      
      // Obter classes de cores baseadas na prioridade
      const patientPriority = triagePatient.priority as unknown as PrioridadeTipo;
      console.log("Prioridade do paciente:", patientPriority);
      
      const priorityClass = patientPriority === 'normal' ? 'blue' : 
                          patientPriority === 'priority' ? 'yellow' : 
                          patientPriority === 'urgent' ? 'red' : 'gray';
      
      const priorityText = patientPriority === 'normal' ? 'NORMAL (AZUL)' : 
                         patientPriority === 'priority' ? 'PRIORIDADE (AMARELO)' : 
                         patientPriority === 'urgent' ? 'URGÊNCIA (VERMELHO)' : 'NÃO CLASSIFICADO';
      
      // Criar uma nova janela para impressão
      console.log("Abrindo janela de impressão");
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        console.error("Falha ao abrir janela de impressão - verificar bloqueador de pop-ups");
        toast.error('Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão bloqueados.');
        return;
      }
      
      // Valores padrão para sinais vitais
      const bloodPressure = triagePatient.vital_signs?.bloodPressure || { systolic: 0, diastolic: 0 };
      const heartRate = triagePatient.vital_signs?.heartRate || 0;
      const respiratoryRate = triagePatient.vital_signs?.respiratoryRate || 0;
      const temperature = triagePatient.vital_signs?.temperature || 0;
      const oxygenSaturation = triagePatient.vital_signs?.oxygenSaturation || 0;
      const painLevel = triagePatient.vital_signs?.painLevel || 0;
      
      // Montar o HTML da etiqueta
      console.log("Gerando HTML da etiqueta");
      const etiquetaHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiqueta de Classificação - ${triagePatient.full_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .tag {
              width: 300px;
              padding: 15px;
              margin: 20px auto;
              border: 3px solid ${priorityClass};
              border-radius: 8px;
            }
            .priority-indicator {
              width: 100%;
              padding: 10px;
              text-align: center;
              font-weight: bold;
              color: white;
              background-color: ${
                priorityClass === 'blue' ? '#3b82f6' : 
                priorityClass === 'yellow' ? '#eab308' : 
                priorityClass === 'red' ? '#ef4444' : '#6b7280'
              };
              border-radius: 4px;
              margin-bottom: 15px;
            }
            .patient-info {
              font-size: 14px;
              margin-bottom: 10px;
            }
            .patient-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .vital-signs {
              font-size: 12px;
              margin-top: 10px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 5px;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="tag">
            <div class="priority-indicator">${priorityText}</div>
            <div class="patient-name">${triagePatient.full_name}</div>
            <div class="patient-info">
              <strong>CPF:</strong> ${triagePatient.cpf || 'Não informado'}<br>
              <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
            </div>
            <div class="vital-signs">
              <div><strong>PA:</strong> ${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg</div>
              <div><strong>FC:</strong> ${heartRate} bpm</div>
              <div><strong>FR:</strong> ${respiratoryRate} rpm</div>
              <div><strong>Temp:</strong> ${temperature} °C</div>
              <div><strong>SpO2:</strong> ${oxygenSaturation}%</div>
              <div><strong>Dor:</strong> ${painLevel}/10</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button class="print-button" onclick="window.print();return false;">Imprimir</button>
          </div>
        </body>
        </html>
      `;
      
      // Escrever o HTML na janela de impressão
      printWindow.document.write(etiquetaHTML);
      
      // Fechar o document para finalizar o carregamento
      printWindow.document.close();
      console.log("Etiqueta gerada com sucesso");
      
      // Confirmar para o usuário
      toast.success("Etiqueta gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar etiqueta:", error);
      toast.error("Ocorreu um erro ao gerar a etiqueta");
    }
  };
  
  const resetTriageState = () => {
    setTriageDone(false);
    setTriagePatient(null);
    setSelectedPatient(null);
    setPriority('normal');
    setSymptoms([]);
    setVitalSigns({
      temperature: 0,
      bloodPressure: {
        systolic: 0,
        diastolic: 0
      },
      heartRate: 0,
      respiratoryRate: 0,
      oxygenSaturation: 0,
      painLevel: 0,
      glucoseLevel: 0
    });
  };

  // Adicionar função para classificar um paciente aleatoriamente para teste
  const handleTestTriage = async () => {
    try {
      if (!selectedPatient) {
        toast.error('Selecione um paciente para testar a classificação');
        return;
      }
      
      // Gerar prioridade aleatória
      const priorities: PrioridadeTipo[] = ['normal', 'priority', 'urgent'];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      
      console.log(`Testando classificação: Paciente ${selectedPatient.full_name} => ${randomPriority}`);
      
      // Atualizar prioridade
      setPriority(randomPriority);
      
      // Gerar sinais vitais de acordo com a prioridade
      const newVitalSigns = {
        temperature: randomPriority === 'urgent' ? 39.5 : randomPriority === 'priority' ? 37.8 : 36.5,
        bloodPressure: {
          systolic: randomPriority === 'urgent' ? 180 : randomPriority === 'priority' ? 150 : 120,
          diastolic: randomPriority === 'urgent' ? 110 : randomPriority === 'priority' ? 95 : 80
        },
        heartRate: randomPriority === 'urgent' ? 120 : randomPriority === 'priority' ? 100 : 75,
        respiratoryRate: randomPriority === 'urgent' ? 28 : randomPriority === 'priority' ? 22 : 16,
        oxygenSaturation: randomPriority === 'urgent' ? 88 : randomPriority === 'priority' ? 92 : 98,
        painLevel: randomPriority === 'urgent' ? 9 : randomPriority === 'priority' ? 6 : 2,
        glucoseLevel: 100
      };
      
      setVitalSigns(newVitalSigns);
      
      toast.success(`Simulação de triagem realizada: ${
        randomPriority === 'normal' ? 'Normal (Azul)' : 
        randomPriority === 'priority' ? 'Prioridade (Amarelo)' : 
        'Urgência (Vermelho)'
      }`);
    } catch (error) {
      console.error('Erro ao testar triagem:', error);
      toast.error('Erro ao realizar teste de triagem');
    }
  };

  const filteredPatients = patients.filter((patient: Patient) => 
    patient.status === 'waiting' &&
    (patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm))
  );

  // Tipagem segura para ordenar pacientes
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    // Se os valores de prioridade não estiverem em priorityOrder, use o valor padrão de 0
    const aValue = a.priority && priorityOrder[a.priority as unknown as PrioridadeTipo] || 0;
    const bValue = b.priority && priorityOrder[b.priority as unknown as PrioridadeTipo] || 0;
    return bValue - aValue;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Triagem</h1>
        <button onClick={() => {
          const testPatient = patients[0];
          if (testPatient) {
            setTriageDone(true);
            setTriagePatient({...testPatient, priority: 'urgent' as any});
          }
        }} className="btn btn-warning">
          Teste Etiqueta
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="form-control flex-1">
          <div className="input-group">
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Prioridade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient: Patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-bold">{patient.full_name}</div>
                        <div className="text-sm opacity-50">{patient.cpf}</div>
                      </div>
                    </div>
                  </td>
                  <td>{patient.cpf}</td>
                  <td>
                    {patient.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ((patient.priority as unknown as PrioridadeTipo) === 'normal' && priorityColors.normal) ||
                        ((patient.priority as unknown as PrioridadeTipo) === 'priority' && priorityColors.priority) ||
                        ((patient.priority as unknown as PrioridadeTipo) === 'urgent' && priorityColors.urgent) ||
                        ''
                      }`}>
                        {(patient.priority as unknown as PrioridadeTipo) === 'normal' ? 'Normal' : 
                         (patient.priority as unknown as PrioridadeTipo) === 'priority' ? 'Prioridade' :
                         (patient.priority as unknown as PrioridadeTipo) === 'urgent' ? 'Urgência' : 
                         patient.priority}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartTriage(patient)}
                    >
                      Iniciar Triagem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPatient && !triageDone && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Triagem - {selectedPatient.full_name}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-bold">Classificação de Risco</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center ${
                        priority === 'normal' ? 'ring-2 ring-blue-500 ' + priorityColors.normal : 'border-gray-200'
                      }`}
                      onClick={() => setPriority('normal')}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full mb-2"></div>
                      <span className="font-medium">Normal</span>
                      <span className="text-xs text-gray-500">Azul</span>
                    </button>
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center ${
                        priority === 'priority' ? 'ring-2 ring-yellow-500 ' + priorityColors.priority : 'border-gray-200'
                      }`}
                      onClick={() => setPriority('priority')}
                    >
                      <div className="w-8 h-8 bg-yellow-400 rounded-full mb-2"></div>
                      <span className="font-medium">Prioridade</span>
                      <span className="text-xs text-gray-500">Amarelo</span>
                    </button>
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center ${
                        priority === 'urgent' ? 'ring-2 ring-red-500 ' + priorityColors.urgent : 'border-gray-200'
                      }`}
                      onClick={() => setPriority('urgent')}
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full mb-2"></div>
                      <span className="font-medium">Urgência</span>
                      <span className="text-xs text-gray-500">Vermelho</span>
                    </button>
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sintomas</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={symptoms.join('\n')}
                    onChange={(e) => setSymptoms(e.target.value.split('\n').filter(Boolean))}
                    placeholder="Digite os sintomas (um por linha)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Pressão Arterial</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={vitalSigns.bloodPressure?.systolic + '/' + vitalSigns.bloodPressure?.diastolic}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: { ...vitalSigns.bloodPressure, systolic: Number(e.target.value.split('/')[0]) || 0, diastolic: Number(e.target.value.split('/')[1]) || 0 } })}
                        placeholder="120/80"
                      />
                      <span className="input-group-addon">mmHg</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Frequência Cardíaca</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: Number(e.target.value) })}
                        placeholder="80"
                      />
                      <span className="input-group-addon">bpm</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Frequência Respiratória</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        value={vitalSigns.respiratoryRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: Number(e.target.value) })}
                        placeholder="16"
                      />
                      <span className="input-group-addon">rpm</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Temperatura</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: Number(e.target.value) })}
                        placeholder="36.5"
                        step="0.1"
                      />
                      <span className="input-group-addon">°C</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Saturação de Oxigênio</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        value={vitalSigns.oxygenSaturation}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: Number(e.target.value) })}
                        placeholder="98"
                      />
                      <span className="input-group-addon">%</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nível de Dor (0-10)</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={vitalSigns.painLevel}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, painLevel: Number(e.target.value) })}
                      className="range"
                      step="1"
                    />
                    <div className="w-full flex justify-between text-xs px-2">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Finalizar Triagem
                  </button>
                  <div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetTriageState}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-accent ml-2"
                      onClick={handleTestTriage}
                    >
                      Testar Classificação
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {(triageDone || triagePatient) && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">Triagem Concluída</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (triagePatient?.priority as unknown as PrioridadeTipo) === 'normal' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                  (triagePatient?.priority as unknown as PrioridadeTipo) === 'priority' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                  (triagePatient?.priority as unknown as PrioridadeTipo) === 'urgent' ? 'bg-red-100 text-red-800 border border-red-300' : ''
                }`}>
                  {(triagePatient?.priority as unknown as PrioridadeTipo) === 'normal' ? 'Normal' : 
                   (triagePatient?.priority as unknown as PrioridadeTipo) === 'priority' ? 'Prioridade' : 
                   (triagePatient?.priority as unknown as PrioridadeTipo) === 'urgent' ? 'Urgência' : ''}
                </span>
              </div>
              
              <div className="alert alert-success mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Paciente {triagePatient?.full_name} foi classificado e encaminhado para consulta.</span>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handlePrintTag}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Tag className="w-5 h-5" />
                  Imprimir Etiqueta
                </button>
                <button
                  onClick={resetTriageState}
                  className="btn btn-ghost"
                >
                  Fazer Nova Triagem
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}