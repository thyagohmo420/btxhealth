import React, { useState, useRef } from 'react';
import { Search, FileText, Upload, FilePlus, Pill, TestTube, Clipboard, Save, Plus } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import type { Patient, VitalSigns, ConsultationHistory, Exam } from '@/types/patient';
import { supabase } from '@/lib/supabaseConfig';
import { toast } from 'sonner';

export default function MedicalOffice() {
  const { patients, addMedicalRecord } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  
  // Formulário de consulta
  const [consultationForm, setConsultationForm] = useState({
    symptoms: '',
    diagnosis: '',
    notes: '',
    doctor: '',
    needsMedication: false,
    needsLaboratoryExams: false
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

  const filteredPatients = patients.filter((patient: Patient) => 
    (patient.status === 'waiting' || patient.status === 'in_progress') &&
    (patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm))
  );

  const handleStartConsultation = async (patient: Patient) => {
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
      // Reset form fields
      setConsultationForm({
        symptoms: '',
        diagnosis: '',
        notes: '',
        doctor: '',
        needsMedication: false,
        needsLaboratoryExams: false
      });
      setPrescriptions([]);
      setExams([]);
      setActiveTab('info');
      toast.success(`Consulta iniciada para ${patient.full_name}`);
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error);
      toast.error('Erro ao iniciar consulta');
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
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setConsultationForm({
      ...consultationForm,
      [name]: checked
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
    if (!selectedPatient) return;
    
    if (!consultationForm.doctor) {
      toast.error('Informe o nome do médico responsável');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare exam requests
      const formattedExams = exams.map(exam => ({
        ...exam,
        status: 'requested' as const,
        requestDate: new Date().toISOString()
      }));
      
      // Determinar se precisa enviar para enfermagem e laboratório
      const needsMedication = consultationForm.needsMedication || prescriptions.length > 0;
      const needsLaboratoryExams = consultationForm.needsLaboratoryExams || formattedExams.some(exam => exam.type === 'laboratory');
      
      // Add medical record
      const recordData = {
        date: new Date().toISOString(),
        symptoms: consultationForm.symptoms,
        diagnosis: consultationForm.diagnosis,
        prescriptions: prescriptions,
        exams: formattedExams,
        doctor: consultationForm.doctor,
        requiresHospitalization: false,
        notes: consultationForm.notes,
        sentToNursing: needsMedication,
        sentToLaboratory: needsLaboratoryExams,
        needsMedication: needsMedication,
        needsLaboratoryExams: needsLaboratoryExams
      };
      
      await addMedicalRecord(selectedPatient.id, recordData);
      
      // Update patient status
      await supabase
        .from('patients')
        .update({ 
          status: 'completed' as const,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPatient.id);
      
      // Notificações para enfermagem e laboratório
      if (needsMedication) {
        toast.success('Prontuário enviado para a Enfermagem');
      }
      
      if (needsLaboratoryExams) {
        toast.success('Prontuário enviado para o Laboratório');
      }
      
      toast.success('Consulta finalizada com sucesso');
      
      // Reset state
      setSelectedPatient(null);
      setConsultationForm({
        symptoms: '',
        diagnosis: '',
        notes: '',
        doctor: '',
        needsMedication: false,
        needsLaboratoryExams: false
      });
      setPrescriptions([]);
      setExams([]);
      
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast.error('Erro ao finalizar consulta');
    } finally {
      setLoading(false);
    }
  };

  return (
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient: Patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-bold">{patient.full_name}</div>
                        <div className="text-sm opacity-50">
                          {patient.sus_card || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{patient.cpf}</td>
                  <td>
                    <span className={`badge ${
                      patient.priority === 'emergency' ? 'badge-error' :
                      patient.priority === 'high' ? 'badge-warning' :
                      patient.priority === 'medium' ? 'badge-info' :
                      'badge-success'
                    }`}>
                      {patient.priority}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartConsultation(patient)}
                    >
                      Iniciar Consulta
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
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
            <div className="card-body p-0">
              <div className="p-4 border-b">
                <h2 className="card-title">Consulta - {selectedPatient.full_name}</h2>
                <div className="text-sm text-gray-500">CPF: {selectedPatient.cpf}</div>
              </div>
              
              <div className="tabs">
                <a 
                  className={`tab tab-bordered ${activeTab === 'info' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <Clipboard className="w-4 h-4 mr-2" /> Informações
                </a>
                <a 
                  className={`tab tab-bordered ${activeTab === 'consultation' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('consultation')}
                >
                  <FileText className="w-4 h-4 mr-2" /> Consulta
                </a>
                <a 
                  className={`tab tab-bordered ${activeTab === 'prescriptions' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('prescriptions')}
                >
                  <Pill className="w-4 h-4 mr-2" /> Medicamentos
                </a>
                <a 
                  className={`tab tab-bordered ${activeTab === 'exams' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('exams')}
                >
                  <TestTube className="w-4 h-4 mr-2" /> Exames
                </a>
                <a 
                  className={`tab tab-bordered ${activeTab === 'documents' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('documents')}
                >
                  <Upload className="w-4 h-4 mr-2" /> Documentos
                </a>
              </div>
              
              <div className="p-4">
                {/* Aba de Informações */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">Informações do Paciente</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-gray-600">Idade: {new Date().getFullYear() - new Date(selectedPatient.birth_date).getFullYear()} anos</div>
                        <div className="text-gray-600">Gênero: {selectedPatient.gender}</div>
                        <div className="text-gray-600">Telefone: {selectedPatient.phone}</div>
                        <div className="text-gray-600">Email: {selectedPatient.email}</div>
                      </div>
                    </div>

                    {selectedPatient.vital_signs && (
                      <div>
                        <h3 className="font-bold mb-2">Sinais Vitais</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-gray-600">Pressão Arterial: {selectedPatient.vital_signs.bloodPressure?.systolic}/{selectedPatient.vital_signs.bloodPressure?.diastolic} mmHg</div>
                          <div className="text-gray-600">Frequência Cardíaca: {selectedPatient.vital_signs.heartRate} bpm</div>
                          <div className="text-gray-600">Frequência Respiratória: {selectedPatient.vital_signs.respiratoryRate} rpm</div>
                          <div className="text-gray-600">Temperatura: {selectedPatient.vital_signs.temperature} °C</div>
                          <div className="text-gray-600">Saturação de O2: {selectedPatient.vital_signs.oxygenSaturation}%</div>
                          <div className="text-gray-600">Nível de Dor: {selectedPatient.vital_signs.painLevel}/10</div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold mb-2">Histórico de Consultas</h3>
                      {selectedPatient.consultation_history?.length ? (
                        selectedPatient.consultation_history.map((consultation: ConsultationHistory, index) => (
                          <div key={index} className="card bg-base-100 shadow-sm p-4 mb-4">
                            <h4 className="font-bold">Consulta {index + 1}</h4>
                            <p><strong>Sintomas:</strong> {consultation.symptoms}</p>
                            <p><strong>Diagnóstico:</strong> {consultation.diagnosis}</p>
                            <p><strong>Tratamento:</strong> {consultation.treatment}</p>
                            <p><strong>Data:</strong> {consultation.created_at ? new Date(consultation.created_at).toLocaleString() : 'Data não disponível'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">Nenhuma consulta anterior registrada</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Aba de Consulta */}
                {activeTab === 'consultation' && (
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="font-medium">Sintomas</label>
                      <textarea
                        className="textarea textarea-bordered mt-1 w-full"
                        placeholder="Descreva os sintomas do paciente"
                        value={consultationForm.symptoms}
                        name="symptoms"
                        onChange={handleConsultationFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="form-control">
                      <label className="font-medium">Diagnóstico</label>
                      <textarea
                        className="textarea textarea-bordered mt-1 w-full"
                        placeholder="Diagnóstico"
                        value={consultationForm.diagnosis}
                        name="diagnosis"
                        onChange={handleConsultationFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="form-control">
                      <label className="font-medium">Observações</label>
                      <textarea
                        className="textarea textarea-bordered mt-1 w-full"
                        placeholder="Observações adicionais"
                        value={consultationForm.notes}
                        name="notes"
                        onChange={handleConsultationFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="form-control">
                      <label className="font-medium">Médico Responsável</label>
                      <input
                        type="text"
                        className="input input-bordered mt-1 w-full"
                        placeholder="Nome do médico"
                        value={consultationForm.doctor}
                        name="doctor"
                        onChange={handleConsultationFormChange}
                      />
                    </div>

                    <div className="form-control">
                      <label className="cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consultationForm.needsMedication}
                          name="needsMedication"
                          onChange={handleCheckboxChange}
                          className="checkbox checkbox-primary"
                        />
                        <span className="label-text">Enviar para Enfermagem para medicação</span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consultationForm.needsLaboratoryExams}
                          name="needsLaboratoryExams"
                          onChange={handleCheckboxChange}
                          className="checkbox checkbox-primary"
                        />
                        <span className="label-text">Enviar para Laboratório para exames</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Aba de Medicamentos */}
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
                
                {/* Aba de Exames */}
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
                
                {/* Aba de Documentos */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="card bordered shadow-sm p-4">
                      <h3 className="font-bold mb-3">Upload de Receita Médica</h3>
                      <div className="form-control">
                        <input 
                          type="file" 
                          className="file-input file-input-bordered w-full" 
                          accept=".pdf"
                          ref={prescriptionFileRef}
                        />
                        <div className="text-xs text-gray-500 mt-1">Apenas arquivos PDF são aceitos</div>
                      </div>
                      <button 
                        className="btn btn-primary mt-3"
                        onClick={handleUploadPrescription}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <><FilePlus className="w-4 h-4 mr-2" /> Enviar Receita</>
                        )}
                      </button>
                    </div>
                    
                    <div className="card bordered shadow-sm p-4">
                      <h3 className="font-bold mb-3">Upload de Atestado Médico</h3>
                      <div className="form-control">
                        <input 
                          type="file" 
                          className="file-input file-input-bordered w-full" 
                          accept=".pdf"
                          ref={medicalCertificateRef}
                        />
                        <div className="text-xs text-gray-500 mt-1">Apenas arquivos PDF são aceitos</div>
                      </div>
                      <button 
                        className="btn btn-primary mt-3"
                        onClick={handleUploadMedicalCertificate}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <><FilePlus className="w-4 h-4 mr-2" /> Enviar Atestado</>
                        )}
                      </button>
                    </div>
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
          </div>
        )}
      </div>
    </div>
  );
} 