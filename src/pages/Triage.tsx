import React, { useState } from 'react';
import { Search, Activity, Heart, Thermometer, AlertCircle } from 'lucide-react';
import { usePatients } from '../contexts/PatientsContext';

interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  saturation: string;
}

export default function Triage() {
  const { patients, updatePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressure: '',
    heartRate: '',
      temperature: '',
    saturation: ''
  });
  const [priority, setPriority] = useState<'urgent' | 'priority' | 'normal'>('normal');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'priority':
        return 'bg-yellow-100 text-yellow-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'priority':
        return 'Prioritário';
      case 'normal':
        return 'Normal';
      default:
        return priority;
    }
  };

  const handleStartTriage = (patientId: string) => {
    setSelectedPatient(patientId);
    // Atualizar status para in_triage e manter a prioridade atual
    const patient = patients.find(p => p.id === patientId);
    updatePatient(patientId, { 
      status: 'in_triage',
      priority: patient?.priority || 'normal' 
    });
  };

  const handleSaveTriage = async () => {
    if (!selectedPatient) return;

    // Validação dos campos obrigatórios
    if (!symptoms.trim()) {
      alert('Por favor, descreva os sintomas do paciente');
      return;
    }

    if (!vitalSigns.bloodPressure || !vitalSigns.heartRate || 
        !vitalSigns.temperature || !vitalSigns.saturation) {
      alert('Por favor, preencha todos os sinais vitais');
      return;
    }

    const now = new Date();
    const triageData = {
      date: now.toISOString(),
      symptoms,
      vitalSigns,
      priority,
      nurse: localStorage.getItem('userName') || 'Enfermeiro'
    };

    // Atualizar paciente com dados da triagem e prioridade
    const currentPatient = patients.find(p => p.id === selectedPatient);
    
    // Atualizar paciente mantendo a prioridade até finalizar a triagem
    updatePatient(selectedPatient, {
      symptoms,
      vitalSigns,
      priority,
      status: 'in_service',
      triageHistory: [
        ...(currentPatient?.triageHistory || []),
        triageData
      ],
      serviceStartTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) // Adicionar hora de entrada no consultório
    });

    // Limpar formulário
    setSelectedPatient(null);
    setSymptoms('');
    setVitalSigns({
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      saturation: ''
    });
    setPriority('normal');

    alert('Triagem salva com sucesso! Paciente encaminhado para consultório.');
  };

  // Filtrar apenas pacientes aguardando triagem
  const waitingPatients = patients.filter(patient => 
    patient.status === 'waiting' &&
    (searchTerm === '' || 
     patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.ticketNumber.includes(searchTerm) ||
     patient.cpf.includes(searchTerm))
  ).sort((a, b) => {
    // Ordenar por prioridade e tempo de chegada
    if (a.priority !== b.priority) {
      const priorityOrder = { urgent: 0, priority: 1, normal: 2 };
      return (priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal']);
    }
    // Se mesma prioridade, ordenar por ordem de chegada
    return new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
  });

  const currentPatient = selectedPatient ? patients.find(p => p.id === selectedPatient) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Triagem</h2>
        <div className="text-sm text-gray-600">
          Total em espera: {waitingPatients.length}
        </div>
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
                  placeholder="Buscar por nome, senha ou CPF..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {waitingPatients.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    Nenhum paciente aguardando triagem
                  </div>
                ) : (
                  waitingPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-4 rounded-lg border ${
                        patient.id === selectedPatient
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500 font-bold">Senha: {patient.ticketNumber}</div>
                          <div className="text-sm text-gray-500">CPF: {patient.cpf}</div>
                          <div className="text-sm text-gray-500">Chegada: {patient.arrivalTime}</div>
                          {patient.priority && (
                            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                              patient.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              patient.priority === 'priority' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {patient.priority === 'urgent' ? 'Urgente' :
                               patient.priority === 'priority' ? 'Prioritário' :
                               'Normal'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartTriage(patient.id)}
                          className="px-3 py-1 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Iniciar Triagem
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedPatient && currentPatient && (
          <div className="w-96 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Triagem - {currentPatient.name}
              <div className="text-sm text-gray-500">Senha: {currentPatient.ticketNumber}</div>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sintomas *
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Descreva os sintomas do paciente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pressão Arterial *
                </label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ex: 120/80"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência Cardíaca *
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ex: 80 bpm"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={vitalSigns.heartRate}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura *
                </label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ex: 36.5°C"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturação *
                </label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ex: 98%"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={vitalSigns.saturation}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, saturation: e.target.value })}
                  />
                </div>
              </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classificação de Risco *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                      priority === 'urgent'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                    onClick={() => setPriority('urgent')}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Urgente
                  </button>
                  <button
                    className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                      priority === 'priority'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                    onClick={() => setPriority('priority')}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Prioritário
                  </button>
                  <button
                    className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                      priority === 'normal'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                    onClick={() => setPriority('normal')}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Normal
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveTriage}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Finalizar Triagem e Encaminhar para Consultório
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}