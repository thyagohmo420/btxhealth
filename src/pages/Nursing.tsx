import React, { useState, useEffect } from 'react';
import { usePatients } from '../contexts/PatientsContext';
import { AlertTriangle, Clock, Heart, ThermometerSnowflake, Activity, Droplet, Check, X, RefreshCw } from 'lucide-react';

export default function Nursing() {
  const { 
    patients,
    updateVitalSigns,
    addMedication,
    administeredMedication,
    addNursingRecord,
    assignBed,
    dischargeBed
  } = usePatients();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [beds, setBeds] = useState<any[]>([
    // Exemplo de leitos pré-configurados
    ...Array(10).fill(null).map((_, i) => ({
      id: `bed-${i + 1}`,
      number: `${i + 1}`,
      type: 'regular',
      status: 'available'
    }))
  ]);

  // Filtrar pacientes em enfermaria ou aguardando leito
  const nursingPatients = patients.filter(patient => 
    (patient.status === 'in_nursing' || 
     (patient.status === 'in_service' && patient.medicalRecord?.requiresHospitalization)) &&
    (searchTerm === '' ||
     patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.ticketNumber.includes(searchTerm))
  );

  const currentPatient = selectedPatient ? patients.find(p => p.id === selectedPatient) : null;

  const handleVitalSignsUpdate = (patientId: string, newVitalSigns: any) => {
    const isCritical = 
      parseInt(newVitalSigns.temperature) > 38 ||
      parseInt(newVitalSigns.heartRate) > 100 ||
      parseInt(newVitalSigns.bloodPressure.split('/')[0]) > 140 ||
      parseInt(newVitalSigns.saturation) < 95;

    updateVitalSigns(patientId, {
      ...newVitalSigns,
      lastUpdate: new Date().toISOString(),
      registeredBy: localStorage.getItem('userName') || 'Enfermeiro',
      isCritical
    });

    if (isCritical) {
      addNursingRecord(patientId, {
        registeredBy: localStorage.getItem('userName') || 'Enfermeiro',
        type: 'evolution',
        description: 'ALERTA: Sinais vitais críticos detectados',
        vitalSigns: newVitalSigns
      });
    }
  };

  const handleAssignBed = (patientId: string, bedId: string) => {
    assignBed(patientId, bedId);
    addNursingRecord(patientId, {
      registeredBy: localStorage.getItem('userName') || 'Enfermeiro',
      type: 'admission',
      description: `Paciente admitido no leito ${beds.find(b => b.id === bedId)?.number}`
    });
  };

  const handleDischargeBed = (bedId: string) => {
    const bed = beds.find(b => b.id === bedId);
    if (bed?.currentPatientId) {
      addNursingRecord(bed.currentPatientId, {
        registeredBy: localStorage.getItem('userName') || 'Enfermeiro',
        type: 'discharge',
        description: `Alta do leito ${bed.number}`
      });
      dischargeBed(bedId);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Enfermaria</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de Pacientes */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Pacientes</h3>
          <div className="space-y-2">
            {nursingPatients.map(patient => (
              <div
                key={patient.id}
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedPatient === patient.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-gray-500">Senha: {patient.ticketNumber}</div>
                {patient.nursingHistory?.bedAssignments?.length ? (
                  <div className="text-sm text-blue-600">
                    Leito: {
                      beds.find(b => 
                        b.id === patient.nursingHistory?.bedAssignments.slice(-1)[0].bedId
                      )?.number
                    }
                  </div>
                ) : (
                  <div className="text-sm text-yellow-600">Aguardando leito</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes do Paciente */}
        <div className="col-span-6 space-y-4">
          {currentPatient ? (
            <>
              {/* Sinais Vitais */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-4">Sinais Vitais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pressão Arterial
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={currentPatient.vitalSigns?.bloodPressure || ''}
                        onChange={(e) => handleVitalSignsUpdate(currentPatient.id, {
                          ...currentPatient.vitalSigns,
                          bloodPressure: e.target.value
                        })}
                      />
                      <Activity className="text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Frequência Cardíaca
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={currentPatient.vitalSigns?.heartRate || ''}
                        onChange={(e) => handleVitalSignsUpdate(currentPatient.id, {
                          ...currentPatient.vitalSigns,
                          heartRate: e.target.value
                        })}
                      />
                      <Heart className="text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Temperatura
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={currentPatient.vitalSigns?.temperature || ''}
                        onChange={(e) => handleVitalSignsUpdate(currentPatient.id, {
                          ...currentPatient.vitalSigns,
                          temperature: e.target.value
                        })}
                      />
                      <ThermometerSnowflake className="text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Saturação
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={currentPatient.vitalSigns?.saturation || ''}
                        onChange={(e) => handleVitalSignsUpdate(currentPatient.id, {
                          ...currentPatient.vitalSigns,
                          saturation: e.target.value
                        })}
                      />
                      <Droplet className="text-gray-400" />
                    </div>
                  </div>
                </div>
                {currentPatient.vitalSigns?.isCritical && (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
                    <AlertTriangle />
                    Sinais vitais críticos detectados!
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                  <Clock size={16} />
                  Última atualização: {
                    currentPatient.vitalSigns?.lastUpdate
                      ? new Date(currentPatient.vitalSigns.lastUpdate).toLocaleString('pt-BR')
                      : 'Nunca'
                  }
                </div>
              </div>

              {/* Histórico */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-4">Histórico de Enfermagem</h3>
                <div className="space-y-2">
                  {currentPatient.nursingHistory?.nursingRecords.map((record, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{record.type}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-600">{record.description}</p>
                      <div className="text-sm text-gray-500">
                        Por: {record.registeredBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
              Selecione um paciente para ver os detalhes
            </div>
          )}
        </div>

        {/* Gestão de Leitos */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Leitos</h3>
          <div className="grid grid-cols-2 gap-2">
            {beds.map(bed => {
              const occupyingPatient = patients.find(p => 
                p.nursingHistory?.bedAssignments?.slice(-1)[0]?.bedId === bed.id &&
                !p.nursingHistory?.bedAssignments?.slice(-1)[0]?.endDate
              );

              return (
                <div
                  key={bed.id}
                  className={`p-3 rounded-lg border ${
                    selectedBed === bed.id
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  } ${
                    bed.status === 'available'
                      ? 'bg-green-50'
                      : bed.status === 'occupied'
                      ? 'bg-red-50'
                      : 'bg-gray-50'
                  }`}
                  onClick={() => setSelectedBed(bed.id)}
                >
                  <div className="font-medium">Leito {bed.number}</div>
                  {occupyingPatient ? (
                    <>
                      <div className="text-sm text-gray-600">
                        {occupyingPatient.name}
                      </div>
                      <button
                        onClick={() => handleDischargeBed(bed.id)}
                        className="mt-2 w-full px-2 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Alta
                      </button>
                    </>
                  ) : (
                    currentPatient && (
                      <button
                        onClick={() => handleAssignBed(currentPatient.id, bed.id)}
                        className="mt-2 w-full px-2 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Alocar
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 