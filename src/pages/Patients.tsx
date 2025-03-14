import React, { useState } from 'react';
import { Search, UserPlus, FileText, Calendar, Phone, Mail, MapPin, User, Heart } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  lastVisit: string;
  status: 'active' | 'inactive';
}

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({});

  const patients: Patient[] = [
    {
      id: '1',
      name: 'Maria Silva',
      birthDate: '1978-05-15',
      cpf: '123.456.789-00',
      phone: '(11) 98765-4321',
      email: 'maria.silva@email.com',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      bloodType: 'O+',
      lastVisit: '2024-03-10',
      status: 'active'
    },
    {
      id: '2',
      name: 'João Santos',
      birthDate: '1992-08-20',
      cpf: '987.654.321-00',
      phone: '(11) 91234-5678',
      email: 'joao.santos@email.com',
      address: 'Av. Principal, 456 - São Paulo, SP',
      bloodType: 'A+',
      lastVisit: '2024-03-08',
      status: 'active'
    }
  ];

  const handleSaveNewPatient = () => {
    console.log('Salvando novo paciente:', newPatient);
    setShowNewPatientForm(false);
    setNewPatient({});
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowNewPatientForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Pacientes</h2>
        <button
          onClick={() => {
            setShowNewPatientForm(true);
            setSelectedPatient(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar paciente por nome, CPF ou email..."
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
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Visita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients
                  .filter(patient =>
                    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patient.cpf.includes(searchTerm) ||
                    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewPatient(patient)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.cpf}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {(showNewPatientForm || selectedPatient) && (
          <div className="w-96 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showNewPatientForm ? 'Novo Paciente' : 'Detalhes do Paciente'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewPatientForm ? newPatient.name || '' : selectedPatient?.name || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, name: e.target.value })}
                    readOnly={!showNewPatientForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewPatientForm ? newPatient.birthDate || '' : selectedPatient?.birthDate || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, birthDate: e.target.value })}
                    readOnly={!showNewPatientForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewPatientForm ? newPatient.cpf || '' : selectedPatient?.cpf || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, cpf: e.target.value })}
                    readOnly={!showNewPatientForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewPatientForm ? newPatient.phone || '' : selectedPatient?.phone || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, phone: e.target.value })}
                    readOnly={!showNewPatientForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewPatientForm ? newPatient.email || '' : selectedPatient?.email || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, email: e.target.value })}
                    readOnly={!showNewPatientForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewPatientForm ? newPatient.address || '' : selectedPatient?.address || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, address: e.target.value })}
                    readOnly={!showNewPatientForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Sanguíneo
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewPatientForm ? newPatient.bloodType || '' : selectedPatient?.bloodType || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, bloodType: e.target.value })}
                    disabled={!showNewPatientForm}
                  >
                    <option value="">Selecione...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {showNewPatientForm && (
                <div className="pt-4">
                  <button
                    onClick={handleSaveNewPatient}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salvar Paciente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 