import React, { useState } from 'react';
import { Search, FileText, Calendar, Activity, Pill, FileCheck, AlertCircle } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  cpf: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
}

interface Record {
  id: string;
  date: string;
  type: 'consultation' | 'exam' | 'procedure';
  description: string;
  professional: string;
  attachments?: string[];
  prescriptions?: string[];
}

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'attachments'>('info');

  const patients: Patient[] = [
    {
      id: '1',
      name: 'Maria Silva',
      birthDate: '1980-05-15',
      cpf: '123.456.789-00',
      bloodType: 'O+',
      allergies: ['Penicilina', 'Dipirona'],
      chronicConditions: ['Hipertensão', 'Diabetes']
    },
    {
      id: '2',
      name: 'João Santos',
      birthDate: '1975-08-22',
      cpf: '987.654.321-00',
      bloodType: 'A+',
      allergies: ['Sulfas'],
      chronicConditions: ['Asma']
    },
    // Adicione mais pacientes conforme necessário
  ];

  const medicalRecords: Record[] = [
    {
      id: '1',
      date: '2024-02-20',
      type: 'consultation',
      description: 'Consulta de rotina. Paciente apresentou pressão arterial controlada.',
      professional: 'Dr. Silva',
      prescriptions: ['Losartana 50mg', 'Metformina 850mg'],
      attachments: ['exame_sangue.pdf']
    },
    {
      id: '2',
      date: '2024-01-15',
      type: 'exam',
      description: 'Exame de sangue completo. Resultados dentro da normalidade.',
      professional: 'Dra. Costa',
      attachments: ['resultado_exame.pdf']
    },
    // Adicione mais registros conforme necessário
  ];

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-green-100 text-green-800';
      case 'procedure':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeText = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta';
      case 'exam':
        return 'Exame';
      case 'procedure':
        return 'Procedimento';
      default:
        return type;
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Prontuário Médico</h2>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Sanguíneo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateAge(patient.birthDate)} anos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.bloodType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedPatient && (
          <div className="w-96 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedPatient.name}
              </h3>

              <div className="flex gap-2">
                <button
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'info'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  Informações
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'history'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  Histórico
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'attachments'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('attachments')}
                >
                  Anexos
                </button>
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Data de Nascimento</div>
                    <div className="font-medium">
                      {new Date(selectedPatient.birthDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">CPF</div>
                    <div className="font-medium">{selectedPatient.cpf}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tipo Sanguíneo</div>
                    <div className="font-medium">{selectedPatient.bloodType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Alergias</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Condições Crônicas</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPatient.chronicConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(record.type)}`}>
                          {getRecordTypeText(record.type)}
                        </span>
                        <div className="text-sm text-gray-500">{record.date}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{record.description}</div>
                      <div className="text-sm text-gray-500">{record.professional}</div>
                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-500">Prescrições:</div>
                          <ul className="mt-1 space-y-1">
                            {record.prescriptions.map((prescription, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <Pill className="w-4 h-4 text-blue-500" />
                                {prescription}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  {medicalRecords
                    .filter(record => record.attachments && record.attachments.length > 0)
                    .map((record) => (
                      <div key={record.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="text-sm text-gray-500 mb-2">{record.date}</div>
                        <ul className="space-y-2">
                          {record.attachments?.map((attachment, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">{attachment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Informações Importantes</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Mantenha o prontuário sempre atualizado</li>
          <li>Verifique as alergias antes de prescrever medicamentos</li>
          <li>Anexe todos os exames e resultados relevantes</li>
          <li>Em caso de dúvida, consulte o histórico completo do paciente</li>
        </ul>
      </div>
    </div>
  );
} 