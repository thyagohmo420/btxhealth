import { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, Calendar, Phone, Mail, MapPin, User, Heart, Upload, FileSpreadsheet, File } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import type { Patient } from '@/types/patient';

export default function Patients() {
  const { patients, loading, refreshPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'pdf' | 'spreadsheet' | null>(null);

  // Forçar atualização dos pacientes ao carregar a página
  useEffect(() => {
    console.log("Carregando página de pacientes");
    refreshPatients();
  }, [refreshPatients]);

  // Exibir log dos pacientes carregados
  useEffect(() => {
    console.log(`Pacientes disponíveis: ${patients.length}`);
  }, [patients]);

  const handleSaveNewPatient = () => {
    console.log('Salvando novo paciente:', newPatient);
    setShowNewPatientForm(false);
    setNewPatient({});
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowNewPatientForm(false);
  };

  const handleImportPatients = () => {
    if (!importFile || !importType) return;
    
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('type', importType);
    
    // Aqui seria implementada a lógica de envio do arquivo para o backend
    console.log('Importando pacientes do arquivo:', importFile.name, 'Tipo:', importType);
    
    // Simular sucesso para demonstração
    setTimeout(() => {
      setShowImportModal(false);
      setImportFile(null);
      setImportType(null);
      alert('Pacientes importados com sucesso!');
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Pacientes</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-5 h-5" />
            Importar Pacientes
          </button>
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
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p>Carregando pacientes...</p>
              </div>
            ) : (
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{patient.full_name}</div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.cpf}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            patient.status === 'waiting' || patient.status === 'waiting_consultation' || patient.status === 'in_progress' 
                              ? 'bg-blue-100 text-blue-800' 
                              : patient.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.status === 'waiting' ? 'Aguardando' : 
                             patient.status === 'waiting_consultation' ? 'Aguardando Consulta' :
                             patient.status === 'in_progress' ? 'Em Atendimento' :
                             patient.status === 'completed' ? 'Atendido' : 
                             patient.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Nenhum paciente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
                    value={showNewPatientForm ? newPatient.full_name || '' : selectedPatient?.full_name || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, full_name: e.target.value })}
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
                    value={showNewPatientForm ? newPatient.birth_date || '' : selectedPatient?.birth_date || ''}
                    onChange={(e) => showNewPatientForm && setNewPatient({ ...newPatient, birth_date: e.target.value })}
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

              {showNewPatientForm && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveNewPatient}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Importar Pacientes</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o tipo de arquivo
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setImportType('pdf')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                      importType === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <File className="w-8 h-8 text-red-500 mb-2" />
                    <span className="text-sm">PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportType('spreadsheet')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                      importType === 'spreadsheet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <File className="w-8 h-8 text-green-500 mb-2" />
                    <span className="text-sm">Planilha</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o arquivo
                </label>
                <input
                  type="file"
                  accept={importType === 'pdf' ? '.pdf' : '.xlsx,.xls,.csv'}
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportPatients}
                  disabled={!importFile || !importType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 