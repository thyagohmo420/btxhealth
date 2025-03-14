import React, { useState } from 'react';
import { Search, FileText, Pill, Activity, FilePlus, History, Download, Calendar } from 'lucide-react';
import { usePatients } from '../contexts/PatientsContext';

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Exam {
  name: string;
  type: 'laboratory' | 'image';
  instructions?: string;
}

interface MedicalRecord {
  date: string;
  symptoms: string;
  diagnosis: string;
  prescriptions: Prescription[];
  exams: Exam[];
}

type PatientStatus = 'active' | 'waiting' | 'in_triage' | 'in_service' | 'completed';

export default function MedicalOffice() {
  const { patients, updatePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [consultation, setConsultation] = useState({
    symptoms: '',
    diagnosis: '',
    prescriptions: [] as Prescription[],
    exams: [] as Exam[],
  });
  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
  });
  const [newExam, setNewExam] = useState({
    name: '',
    type: 'laboratory' as 'laboratory' | 'image',
    instructions: '',
  });

  // Filtrar pacientes em atendimento (vindos da triagem)
  const waitingPatients = patients
    .filter(patient => 
      patient.status === 'in_service' &&
      (searchTerm === '' ||
       patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       patient.ticketNumber.includes(searchTerm) ||
       patient.cpf.includes(searchTerm))
    )
    .sort((a, b) => {
      // Ordenar por prioridade e tempo de espera
      const priorityOrder = { urgent: 0, priority: 1, normal: 2 };
      if (a.priority !== b.priority) {
        return (priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal']);
      }
      return new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
    });

  const currentPatient = selectedPatient ? patients.find(p => p.id === selectedPatient) : null;

  const handleStartConsultation = (patientId: string) => {
    setSelectedPatient(patientId);
    setConsultation({
      symptoms: '',
      diagnosis: '',
      prescriptions: [],
      exams: [],
    });
  };

  const handleAddPrescription = () => {
    if (!newPrescription.medication || !newPrescription.dosage || 
        !newPrescription.frequency || !newPrescription.duration) {
      alert('Por favor, preencha todos os campos da prescrição');
      return;
    }

    setConsultation(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { ...newPrescription }],
    }));

    setNewPrescription({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
    });
  };

  const handleAddExam = () => {
    if (!newExam.name || !newExam.type) {
      alert('Por favor, preencha o nome e tipo do exame');
      return;
    }

    setConsultation(prev => ({
      ...prev,
      exams: [...prev.exams, { ...newExam }],
    }));

    setNewExam({
      name: '',
      type: 'laboratory',
      instructions: '',
    });
  };

  const handleSaveConsultation = (patientId: string) => {
    const now = new Date();
    const consultationData = {
      date: now.toISOString(),
      doctor: localStorage.getItem('userName') || 'Médico', // Idealmente, pegar do contexto de autenticação
      diagnosis: consultation.diagnosis,
      prescriptions: consultation.prescriptions,
      exams: consultation.exams
    };

    updatePatient(patientId, {
      status: 'completed',
      medicalRecord: {
        ...consultation,
        date: now.toISOString()
      },
      consultationHistory: [
        ...(patients.find(p => p.id === patientId)?.consultationHistory || []),
        consultationData
      ]
    });

    setConsultation({
      symptoms: '',
      diagnosis: '',
      prescriptions: [],
      exams: [],
    });

    setSelectedPatient(null);
    alert('Consulta finalizada com sucesso!');
  };

  const handleGeneratePDF = (type: 'prescription' | 'exam' | 'certificate') => {
    // Implementar geração de PDF
    console.log(`Gerando ${type} em PDF...`);
  };

  const handleStartTriage = (patientId: string) => {
    updatePatient(patientId, {
      status: 'in_triage'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Consultório Médico</h2>
      </div>

      <div className="flex gap-6">
        <div className="w-1/3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Pacientes Aguardando</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {waitingPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 rounded-lg border ${
                      patient.id === selectedPatient
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <div className={`w-2 self-stretch rounded-l-lg ${
                          patient.priority === 'urgent' ? 'bg-red-500' :
                          patient.priority === 'priority' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">Senha: {patient.ticketNumber}</div>
                          <div className="text-sm text-gray-500">CPF: {patient.cpf}</div>
                          <div className="text-sm text-gray-500">
                            Chegada: {patient.arrivalTime}
                          </div>
                          <div className="text-sm text-gray-500">
                            Entrada: {patient.serviceStartTime || 'Aguardando'}
                          </div>
                          <div className="text-sm mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-white ${
                              patient.priority === 'urgent' ? 'bg-red-500' :
                              patient.priority === 'priority' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}>
                              {patient.priority === 'urgent' ? 'Emergência' :
                               patient.priority === 'priority' ? 'Prioritário' :
                               'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              updatePatient(patient.id, { priority: 'normal' });
                            }}
                            className={`w-4 h-4 rounded-full ${
                              patient.priority === 'normal' 
                                ? 'bg-green-500 ring-2 ring-green-200' 
                                : 'bg-green-200 hover:bg-green-300'
                            }`}
                            title="Normal"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              updatePatient(patient.id, { priority: 'priority' });
                            }}
                            className={`w-4 h-4 rounded-full ${
                              patient.priority === 'priority' 
                                ? 'bg-yellow-500 ring-2 ring-yellow-200' 
                                : 'bg-yellow-200 hover:bg-yellow-300'
                            }`}
                            title="Prioritário"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              updatePatient(patient.id, { priority: 'urgent' });
                            }}
                            className={`w-4 h-4 rounded-full ${
                              patient.priority === 'urgent' 
                                ? 'bg-red-500 ring-2 ring-red-200' 
                                : 'bg-red-200 hover:bg-red-300'
                            }`}
                            title="Urgente"
                          />
                        </div>
                        <button
                          onClick={() => handleStartConsultation(patient.id)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            patient.vitalSigns
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!patient.vitalSigns}
                          title={patient.vitalSigns ? 'Iniciar atendimento' : 'Aguardando triagem'}
                        >
                          {patient.vitalSigns ? 'Atender' : 'Aguardando Triagem'}
                        </button>
                      </div>
                    </div>
                    {patient.vitalSigns && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">PA: {patient.vitalSigns.bloodPressure}</div>
                        <div className="text-gray-600">FC: {patient.vitalSigns.heartRate}</div>
                        <div className="text-gray-600">Temp: {patient.vitalSigns.temperature}</div>
                        <div className="text-gray-600">Sat: {patient.vitalSigns.saturation}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedPatient && currentPatient && (
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Atendimento - {currentPatient.name}
                </h3>
                <div className="text-sm text-gray-500">
                  Senha: {currentPatient.ticketNumber} | CPF: {currentPatient.cpf}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sintomas e Queixas
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    value={consultation.symptoms}
                    onChange={(e) => setConsultation({ ...consultation, symptoms: e.target.value })}
                    placeholder="Descreva os sintomas e queixas do paciente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnóstico
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    value={consultation.diagnosis}
                    onChange={(e) => setConsultation({ ...consultation, diagnosis: e.target.value })}
                    placeholder="Registre o diagnóstico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescrição de Medicamentos
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Medicamento"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      value={newPrescription.medication}
                      onChange={(e) => setNewPrescription({ ...newPrescription, medication: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Dosagem"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Frequência"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      value={newPrescription.frequency}
                      onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Duração"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      value={newPrescription.duration}
                      onChange={(e) => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={handleAddPrescription}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Pill className="w-5 h-5" />
                    Adicionar Medicamento
                  </button>

                  {consultation.prescriptions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Medicamentos Prescritos</h4>
                      <div className="space-y-2">
                        {consultation.prescriptions.map((prescription, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{prescription.medication}</div>
                            <div className="text-sm text-gray-600">
                              {prescription.dosage} - {prescription.frequency} - {prescription.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitação de Exames
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nome do Exame"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      value={newExam.name}
                      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    />
                    <select
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      value={newExam.type}
                      onChange={(e) => setNewExam({ ...newExam, type: e.target.value as 'laboratory' | 'image' })}
                    >
                      <option value="laboratory">Laboratorial</option>
                      <option value="image">Imagem</option>
                    </select>
                    <textarea
                      placeholder="Instruções"
                      className="px-4 py-2 border border-gray-300 rounded-lg col-span-2"
                      value={newExam.instructions}
                      onChange={(e) => setNewExam({ ...newExam, instructions: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={handleAddExam}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Activity className="w-5 h-5" />
                    Adicionar Exame
                  </button>

                  {consultation.exams.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Exames Solicitados</h4>
                      <div className="space-y-2">
                        {consultation.exams.map((exam, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{exam.name}</div>
                            <div className="text-sm text-gray-600">
                              Tipo: {exam.type === 'laboratory' ? 'Laboratorial' : 'Imagem'}
                            </div>
                            {exam.instructions && (
                              <div className="text-sm text-gray-600">
                                Instruções: {exam.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleGeneratePDF('prescription')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Gerar Receita
                  </button>
                  <button
                    onClick={() => handleGeneratePDF('exam')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FilePlus className="w-5 h-5" />
                    Gerar Pedido de Exames
                  </button>
                  <button
                    onClick={() => handleGeneratePDF('certificate')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Gerar Atestado
                  </button>
                </div>

                <button
                  onClick={() => handleSaveConsultation(currentPatient.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Finalizar Consulta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 