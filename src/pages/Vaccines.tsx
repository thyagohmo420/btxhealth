import { useState } from 'react';
import { Search, Plus, Syringe, Calendar, User, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Vaccine {
  id: string;
  name: string;
  manufacturer: string;
  batch: string;
  expirationDate: string;
  dosesAvailable: number;
  minDoseInterval: number;
  status: 'available' | 'low' | 'unavailable';
}

interface VaccinationRecord {
  id: string;
  patientName: string;
  patientId: string;
  vaccineName: string;
  dose: number;
  applicationDate: string;
  nextDoseDate: string | null;
  appliedBy: string;
  status: 'scheduled' | 'completed' | 'missed';
}

export default function Vaccines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewVaccineForm, setShowNewVaccineForm] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [newVaccine, setNewVaccine] = useState<Partial<Vaccine>>({});
  const [activeTab, setActiveTab] = useState<'inventory' | 'records'>('inventory');

  const vaccines: Vaccine[] = [
    {
      id: '1',
      name: 'Coronavac',
      manufacturer: 'Sinovac/Butantan',
      batch: 'B123456',
      expirationDate: '2024-12-31',
      dosesAvailable: 150,
      minDoseInterval: 28,
      status: 'available'
    },
    {
      id: '2',
      name: 'Influenza',
      manufacturer: 'GSK',
      batch: 'F789012',
      expirationDate: '2024-06-30',
      dosesAvailable: 50,
      minDoseInterval: 365,
      status: 'low'
    },
    {
      id: '3',
      name: 'Hepatite B',
      manufacturer: 'Pfizer',
      batch: 'H345678',
      expirationDate: '2024-09-30',
      dosesAvailable: 0,
      minDoseInterval: 30,
      status: 'unavailable'
    }
  ];

  const vaccinationRecords: VaccinationRecord[] = [
    {
      id: '1',
      patientName: 'Maria Silva',
      patientId: 'P123',
      vaccineName: 'Coronavac',
      dose: 1,
      applicationDate: '2024-03-01',
      nextDoseDate: '2024-03-29',
      appliedBy: 'Enf. Ana Santos',
      status: 'completed'
    },
    {
      id: '2',
      patientName: 'João Santos',
      patientId: 'P456',
      vaccineName: 'Influenza',
      dose: 1,
      applicationDate: '2024-03-15',
      nextDoseDate: null,
      appliedBy: 'Enf. Carlos Lima',
      status: 'completed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'low':
        return 'Baixo Estoque';
      case 'unavailable':
        return 'Indisponível';
      case 'completed':
        return 'Concluído';
      case 'scheduled':
        return 'Agendado';
      case 'missed':
        return 'Faltou';
      default:
        return status;
    }
  };

  const handleSaveNewVaccine = () => {
    console.log('Salvando nova vacina:', newVaccine);
    setShowNewVaccineForm(false);
    setNewVaccine({});
  };

  const handleViewVaccine = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setShowNewVaccineForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Vacinas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Estoque
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'records'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Registros
          </button>
          {activeTab === 'inventory' && (
            <button
              onClick={() => {
                setShowNewVaccineForm(true);
                setSelectedVaccine(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nova Vacina
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'inventory' ? "Buscar vacina..." : "Buscar registro..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === 'inventory' ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lote
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccines
                    .filter(vaccine =>
                      vaccine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      vaccine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      vaccine.batch.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((vaccine) => (
                      <tr
                        key={vaccine.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewVaccine(vaccine)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vaccine.name}</div>
                          <div className="text-sm text-gray-500">{vaccine.manufacturer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vaccine.batch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(vaccine.expirationDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vaccine.dosesAvailable}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vaccine.status)}`}>
                            {getStatusText(vaccine.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próxima Dose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccinationRecords
                    .filter(record =>
                      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                          <div className="text-sm text-gray-500">ID: {record.patientId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.vaccineName}</div>
                          <div className="text-sm text-gray-500">Dose {record.dose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.applicationDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.nextDoseDate
                            ? new Date(record.nextDoseDate).toLocaleDateString('pt-BR')
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activeTab === 'inventory' && (showNewVaccineForm || selectedVaccine) && (
          <div className="w-96 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showNewVaccineForm ? 'Nova Vacina' : 'Detalhes da Vacina'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Vacina
                </label>
                <div className="relative">
                  <Syringe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewVaccineForm ? newVaccine.name || '' : selectedVaccine?.name || ''}
                    onChange={(e) => showNewVaccineForm && setNewVaccine({ ...newVaccine, name: e.target.value })}
                    readOnly={!showNewVaccineForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabricante
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewVaccineForm ? newVaccine.manufacturer || '' : selectedVaccine?.manufacturer || ''}
                    onChange={(e) => showNewVaccineForm && setNewVaccine({ ...newVaccine, manufacturer: e.target.value })}
                    readOnly={!showNewVaccineForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lote
                </label>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewVaccineForm ? newVaccine.batch || '' : selectedVaccine?.batch || ''}
                    onChange={(e) => showNewVaccineForm && setNewVaccine({ ...newVaccine, batch: e.target.value })}
                    readOnly={!showNewVaccineForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Validade
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={showNewVaccineForm ? newVaccine.expirationDate || '' : selectedVaccine?.expirationDate || ''}
                    onChange={(e) => showNewVaccineForm && setNewVaccine({ ...newVaccine, expirationDate: e.target.value })}
                    readOnly={!showNewVaccineForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doses Disponíveis
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={showNewVaccineForm ? newVaccine.dosesAvailable || '' : selectedVaccine?.dosesAvailable || ''}
                  onChange={(e) => showNewVaccineForm && setNewVaccine({ ...newVaccine, dosesAvailable: parseInt(e.target.value) })}
                  readOnly={!showNewVaccineForm}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo Mínimo entre Doses (dias)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={showNewVaccineForm ? newVaccine.minDoseInterval || '' : selectedVaccine?.minDoseInterval || ''}
                  onChange={(e) => showNewVaccineForm && setNewVaccine({ ...newVaccine, minDoseInterval: parseInt(e.target.value) })}
                  readOnly={!showNewVaccineForm}
                />
              </div>

              {showNewVaccineForm && (
                <div className="pt-4">
                  <button
                    onClick={handleSaveNewVaccine}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salvar Vacina
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