import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, Upload, FilePlus, Pill, TestTube, Clipboard, Save, Plus } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import type { Patient, VitalSigns, ConsultationHistory, Exam } from '@/types/patient';
import type { PrioridadeTipo } from '@/types/queue';
import { supabase } from '@/lib/supabaseConfig';
import { medicalRecords } from '@/lib/medicalRecords';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

export default function MedicalOffice() {
  const { patients, updatePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  
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

  // Formulário de consulta
  const [consultationForm, setConsultationForm] = useState({
    symptoms: '',
    diagnosis: '',
    notes: '',
    doctor: '',
  });
  
  // Campos para prescrição de medicamentos
  const [prescriptions, setPrescriptions] = useState<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[]>([]);
  
  // Campos para solicitação de exames
  const [exams, setExams] = useState<{
    name: string;
    type: 'laboratory' | 'imaging';
    instructions: string;
  }[]>([]);
  
  // Referências para os arquivos
  const prescriptionFileRef = useRef<HTMLInputElement>(null);
  const medicalCertificateRef = useRef<HTMLInputElement>(null);

  // Filtrar pacientes que estão aguardando ou em consulta
  const filteredPatients = patients.filter((patient: Patient) => {
    console.log("Verificando paciente:", patient.full_name, "Status:", patient.status, "Prioridade:", patient.priority);
    return (patient.status === 'waiting' || patient.status === 'in_progress') &&
      (patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf.includes(searchTerm));
  });

  // Ordenar pacientes por prioridade
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    // Mapeamento de prioridades para ordenação
    const priorityOrder: Record<string, number> = {
      urgent: 3,  // Vermelho (máxima prioridade)
      priority: 2, // Amarelo
      normal: 1,   // Azul
      '': 0        // Sem classificação
    };
    
    // Valores padrão se a prioridade não for reconhecida
    const aPriority = (a.priority as unknown as PrioridadeTipo) || 'normal';
    const bPriority = (b.priority as unknown as PrioridadeTipo) || 'normal';
    
    console.log(`Comparando prioridades: ${a.full_name}(${aPriority}:${priorityOrder[aPriority] || 0}) vs ${b.full_name}(${bPriority}:${priorityOrder[bPriority] || 0})`);
    
    // Ordenar por prioridade (maior primeiro)
    return (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0);
  });

  useEffect(() => {
    console.log("Consultório médico carregado. Total pacientes:", patients.length);
    console.log("Pacientes filtrados:", filteredPatients.length);
    console.log("Pacientes ordenados:", sortedPatients.length);
  }, [patients, filteredPatients.length, sortedPatients.length]);

  const handleStartConsultation = async (patient: Patient) => {
    try {
      setLoading(true);
      console.log("Iniciando consulta para o paciente:", patient.full_name);
      
      // Atualizar status do paciente para "em consulta"
      await updatePatient(patient.id, { 
        status: 'in_progress' as const
      });

      console.log("Status atualizado para 'em consulta'");
      setSelectedPatient(patient);
      // Reset form fields
      setConsultationForm({
        symptoms: '',
        diagnosis: '',
        notes: '',
        doctor: '',
      });
      setPrescriptions([]);
      setExams([]);
      setActiveTab('info');
      toast.success(`Consulta iniciada para ${patient.full_name}`);
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error);
      toast.error('Erro ao iniciar consulta');
    } finally {
      setLoading(false);
    }
  };

  const formatVitalSigns = (vitalSigns: VitalSigns) => {
    return {
      blood_pressure: `${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`,
      heart_rate: vitalSigns.heartRate,
      respiratory_rate: vitalSigns.respiratoryRate,
      oxygen_saturation: vitalSigns.oxygenSaturation,
      temperature: vitalSigns.temperature,
      pain_level: vitalSigns.painLevel || 0
    };
  };
  
  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medication: '', dosage: '', frequency: '', duration: '' }
    ]);
  };
  
  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };
  
  const handlePrescriptionChange = (index: number, field: string, value: string) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      [field]: value
    };
    setPrescriptions(updatedPrescriptions);
  };
  
  const handleAddExam = () => {
    setExams([
      ...exams,
      { name: '', type: 'laboratory', instructions: '' }
    ]);
  };
  
  const handleRemoveExam = (index: number) => {
    setExams(exams.filter((_, i) => i !== index));
  };
  
  const handleExamChange = (index: number, field: string, value: string) => {
    const updatedExams = [...exams];
    updatedExams[index] = {
      ...updatedExams[index],
      [field]: field === 'type' ? (value as 'laboratory' | 'imaging') : value
    };
    setExams(updatedExams);
  };
  
  const handleConsultationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsultationForm({
      ...consultationForm,
      [name]: value
    });
  };
  
  const handleUploadPrescription = async () => {
    if (!prescriptionFileRef.current?.files?.length) {
      toast.error('Selecione um arquivo PDF de receita');
      return;
    }
    
    const file = prescriptionFileRef.current.files[0];
    if (file.type !== 'application/pdf') {
      toast.error('O arquivo deve ser um PDF');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!selectedPatient) return;
      
      const fileName = `prescription_${selectedPatient.id}_${Date.now()}.pdf`;
      
      // Verificar se o bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'medical_documents');
      
      // Criar o bucket se não existir
      if (!bucketExists) {
        await supabase.storage.createBucket('medical_documents', {
          public: false
        });
      }
      
      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from('medical_documents')
        .upload(fileName, file);
        
      if (error) throw error;
      
      toast.success('Receita médica enviada com sucesso');
      
      // Reset the file input
      if (prescriptionFileRef.current) {
        prescriptionFileRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao enviar receita:', error);
      toast.error('Erro ao enviar receita');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadMedicalCertificate = async () => {
    if (!medicalCertificateRef.current?.files?.length) {
      toast.error('Selecione um arquivo PDF de atestado');
      return;
    }
    
    const file = medicalCertificateRef.current.files[0];
    if (file.type !== 'application/pdf') {
      toast.error('O arquivo deve ser um PDF');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!selectedPatient) return;
      
      const fileName = `certificate_${selectedPatient.id}_${Date.now()}.pdf`;
      
      // Verificar se o bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'medical_documents');
      
      // Criar o bucket se não existir
      if (!bucketExists) {
        await supabase.storage.createBucket('medical_documents', {
          public: false
        });
      }
      
      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from('medical_documents')
        .upload(fileName, file);
        
      if (error) throw error;
      
      toast.success('Atestado médico enviado com sucesso');
      
      // Reset the file input
      if (medicalCertificateRef.current) {
        medicalCertificateRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao enviar atestado:', error);
      toast.error('Erro ao enviar atestado');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFinishConsultation = async () => {
    if (!selectedPatient) {
      console.error("Tentativa de finalizar consulta sem paciente selecionado");
      return;
    }
    
    if (!consultationForm.doctor) {
      toast.error('Informe o nome do médico responsável');
      return;
    }
    
    try {
      setLoading(true);
      console.log("Finalizando consulta para o paciente:", selectedPatient.full_name);
      
      // Formatar exames para atender ao tipo Exam
      const formattedExams: Exam[] = exams.map(exam => ({
        ...exam,
        status: 'requested' as const,
        requestDate: new Date().toISOString()
      }));
      
      // Criar histórico de consulta
      const consultationHistory: ConsultationHistory = {
        date: new Date().toISOString(),
        symptoms: consultationForm.symptoms,
        diagnosis: consultationForm.diagnosis,
        notes: consultationForm.notes,
        doctor: consultationForm.doctor,
        prescriptions: [...prescriptions],
        exams: formattedExams,
      };
      
      console.log("Histórico de consulta criado:", consultationHistory);
      
      // Atualizar histórico de consulta do paciente
      const patientHistory = selectedPatient.consultation_history || [];
      patientHistory.push(consultationHistory);
      console.log("Histórico atualizado:", patientHistory);
      
      // Atualizar status do paciente para "atendido"
      const updatedPatient = await updatePatient(selectedPatient.id, {
        status: 'completed' as const,
        consultation_history: patientHistory,
      });
      
      console.log("Paciente atualizado com sucesso:", updatedPatient);
      
      // Limpar o formulário e o paciente selecionado
      setSelectedPatient(null);
      setConsultationForm({
        symptoms: '',
        diagnosis: '',
        notes: '',
        doctor: '',
      });
      setPrescriptions([]);
      setExams([]);
      
      toast.success('Consulta finalizada com sucesso');
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast.error('Erro ao finalizar consulta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Consultório</h1>
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
            <h2 className="text-xl font-semibold mb-3">Pacientes Aguardando</h2>
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatients.map((patient: Patient) => {
                  // Determinar a classificação de risco do paciente
                  const patientPriority = (patient.priority as unknown as PrioridadeTipo) || 'normal';
                  // Obter a classe CSS correspondente à prioridade
                  const priorityClass = priorityColors[patientPriority];
                  // Obter o texto da etiqueta
                  const priorityText = 
                    patientPriority === 'normal' ? 'Normal' :
                    patientPriority === 'priority' ? 'Prioridade' :
                    patientPriority === 'urgent' ? 'Urgência' : 'Não classificado';
                  
                  // Renderizar a linha do paciente com a etiqueta colorida
                  return (
                    <tr key={patient.id} className={patient.status === 'in_progress' ? 'bg-blue-50' : ''}>
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
                        <span className={`px-2 py-1 rounded-full text-xs border ${priorityClass}`}>
                          {priorityText}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          patient.status === 'waiting' ? 'bg-green-100 text-green-800' : 
                          patient.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''
                        }`}>
                          {patient.status === 'waiting' ? 'Aguardando' : 
                           patient.status === 'in_progress' ? 'Em Consulta' : patient.status}
                        </span>
                      </td>
                      <td>
                        {patient.status === 'waiting' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStartConsultation(patient)}
                            disabled={loading}
                          >
                            Iniciar Consulta
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            Ver Detalhes
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sortedPatients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Nenhum paciente aguardando consulta
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedPatient && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">
                    {selectedPatient.full_name}
                  </h2>
                  {selectedPatient.priority && (
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 ${
                      priorityColors[(selectedPatient.priority as unknown as PrioridadeTipo) || 'normal']
                    }`}>
                      {(selectedPatient.priority as unknown as PrioridadeTipo) === 'normal' ? 'Normal (Azul)' : 
                       (selectedPatient.priority as unknown as PrioridadeTipo) === 'priority' ? 'Prioridade (Amarelo)' :
                       (selectedPatient.priority as unknown as PrioridadeTipo) === 'urgent' ? 'Urgência (Vermelho)' : 
                       selectedPatient.priority}
                    </span>
                  )}
                </div>
                
                <div className="tabs tabs-boxed mb-4">
                  <button 
                    className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    Informações
                  </button>
                  <button 
                    className={`tab ${activeTab === 'consultation' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('consultation')}
                  >
                    Consulta
                  </button>
                  <button 
                    className={`tab ${activeTab === 'prescriptions' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('prescriptions')}
                  >
                    Prescrições
                  </button>
                  <button 
                    className={`tab ${activeTab === 'exams' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('exams')}
                  >
                    Exames
                  </button>
                </div>
                
                {activeTab === 'info' && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Nome Completo</span>
                        </label>
                        <input 
                          type="text" 
                          className="input input-bordered" 
                          value={selectedPatient.full_name} 
                          disabled 
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">CPF</span>
                        </label>
                        <input 
                          type="text" 
                          className="input input-bordered" 
                          value={selectedPatient.cpf} 
                          disabled 
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Telefone</span>
                        </label>
                        <input 
                          type="text" 
                          className="input input-bordered" 
                          value={selectedPatient.phone} 
                          disabled 
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Classificação de Risco</span>
                        </label>
                        <div className={`input input-bordered flex items-center gap-2 ${
                          (selectedPatient.priority as unknown as PrioridadeTipo) === 'normal' ? 'border-blue-400' : 
                          (selectedPatient.priority as unknown as PrioridadeTipo) === 'priority' ? 'border-yellow-400' :
                          (selectedPatient.priority as unknown as PrioridadeTipo) === 'urgent' ? 'border-red-400' : ''
                        }`}>
                          <div className={`w-4 h-4 rounded-full ${
                            (selectedPatient.priority as unknown as PrioridadeTipo) === 'normal' ? 'bg-blue-500' : 
                            (selectedPatient.priority as unknown as PrioridadeTipo) === 'priority' ? 'bg-yellow-500' :
                            (selectedPatient.priority as unknown as PrioridadeTipo) === 'urgent' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <span>
                            {(selectedPatient.priority as unknown as PrioridadeTipo) === 'normal' ? 'Normal (Azul)' : 
                             (selectedPatient.priority as unknown as PrioridadeTipo) === 'priority' ? 'Prioridade (Amarelo)' :
                             (selectedPatient.priority as unknown as PrioridadeTipo) === 'urgent' ? 'Urgência (Vermelho)' : 
                             'Não classificado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedPatient.vital_signs && (
                      <div className="border rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-medium mb-2">Sinais Vitais</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Pressão Arterial</span>
                            <p className="font-medium">{selectedPatient.vital_signs.bloodPressure?.systolic}/{selectedPatient.vital_signs.bloodPressure?.diastolic} mmHg</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Frequência Cardíaca</span>
                            <p className="font-medium">{selectedPatient.vital_signs.heartRate} bpm</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Frequência Respiratória</span>
                            <p className="font-medium">{selectedPatient.vital_signs.respiratoryRate} rpm</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Temperatura</span>
                            <p className="font-medium">{selectedPatient.vital_signs.temperature} °C</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Saturação de O2</span>
                            <p className="font-medium">{selectedPatient.vital_signs.oxygenSaturation}%</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Nível de Dor</span>
                            <p className="font-medium">{selectedPatient.vital_signs.painLevel}/10</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'consultation' && (
                  <div className="space-y-4">
                    <h3 className="font-bold mb-2">Nova Consulta</h3>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Sintomas</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered h-24"
                        placeholder="Descreva os sintomas do paciente"
                        name="symptoms"
                        value={consultationForm.symptoms}
                        onChange={handleConsultationFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Diagnóstico</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered h-24"
                        placeholder="Informe o diagnóstico"
                        name="diagnosis"
                        value={consultationForm.diagnosis}
                        onChange={handleConsultationFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Observações</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered h-24"
                        placeholder="Observações adicionais"
                        name="notes"
                        value={consultationForm.notes}
                        onChange={handleConsultationFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Médico Responsável</span>
                      </label>
                      <input 
                        type="text" 
                        className="input input-bordered"
                        placeholder="Nome do médico"
                        name="doctor"
                        value={consultationForm.doctor}
                        onChange={handleConsultationFormChange}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'prescriptions' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Prescrição de Medicamentos</h3>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={handleAddPrescription}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Adicionar
                      </button>
                    </div>
                    
                    {prescriptions.length === 0 && (
                      <div className="alert">
                        <div>
                          <Pill className="w-6 h-6" />
                          <span>Nenhum medicamento prescrito. Adicione medicamentos à prescrição.</span>
                        </div>
                      </div>
                    )}
                    
                    {prescriptions.map((prescription, index) => (
                      <div key={index} className="card bordered shadow-sm p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">Medicamento #{index + 1}</h4>
                          <button 
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={() => handleRemovePrescription(index)}
                          >✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Medicamento</span>
                            </label>
                            <input 
                              type="text" 
                              className="input input-bordered"
                              placeholder="Nome do medicamento"
                              value={prescription.medication}
                              onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Dosagem</span>
                            </label>
                            <input 
                              type="text" 
                              className="input input-bordered"
                              placeholder="Ex: 500mg"
                              value={prescription.dosage}
                              onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Frequência</span>
                            </label>
                            <input 
                              type="text" 
                              className="input input-bordered"
                              placeholder="Ex: 8 em 8 horas"
                              value={prescription.frequency}
                              onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Duração</span>
                            </label>
                            <input 
                              type="text" 
                              className="input input-bordered"
                              placeholder="Ex: 7 dias"
                              value={prescription.duration}
                              onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'exams' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Solicitação de Exames</h3>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={handleAddExam}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Adicionar
                      </button>
                    </div>
                    
                    {exams.length === 0 && (
                      <div className="alert">
                        <div>
                          <TestTube className="w-6 h-6" />
                          <span>Nenhum exame solicitado. Adicione exames à solicitação.</span>
                        </div>
                      </div>
                    )}
                    
                    {exams.map((exam, index) => (
                      <div key={index} className="card bordered shadow-sm p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">Exame #{index + 1}</h4>
                          <button 
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={() => handleRemoveExam(index)}
                          >✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Nome do Exame</span>
                            </label>
                            <input 
                              type="text" 
                              className="input input-bordered"
                              placeholder="Nome do exame"
                              value={exam.name}
                              onChange={(e) => handleExamChange(index, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Tipo</span>
                            </label>
                            <select 
                              className="select select-bordered"
                              value={exam.type}
                              onChange={(e) => handleExamChange(index, 'type', e.target.value)}
                            >
                              <option value="laboratory">Laboratório</option>
                              <option value="imaging">Imagem</option>
                            </select>
                          </div>
                          
                          <div className="form-control md:col-span-2">
                            <label className="label">
                              <span className="label-text">Instruções</span>
                            </label>
                            <textarea 
                              className="textarea textarea-bordered"
                              placeholder="Instruções para o exame"
                              value={exam.instructions}
                              onChange={(e) => handleExamChange(index, 'instructions', e.target.value)}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button 
                    className="btn btn-primary"
                    onClick={handleFinishConsultation}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Finalizar Consulta</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 