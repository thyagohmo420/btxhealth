import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import type { Patient, VitalSigns } from '@/types/patient';
import type { Bed, NursingRecord } from '@/types/nursing';
import { supabase } from '@/lib/supabaseConfig';

export default function Nursing() {
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [beds] = useState<Bed[]>([
    { id: '1', number: '101', sector: 'Enfermaria', status: 'available', created_at: '', updated_at: '' },
    { id: '2', number: '102', sector: 'Enfermaria', status: 'available', created_at: '', updated_at: '' },
    { id: '3', number: '103', sector: 'Enfermaria', status: 'available', created_at: '', updated_at: '' },
    { id: '4', number: '104', sector: 'Enfermaria', status: 'available', created_at: '', updated_at: '' }
  ]);

  const filteredPatients = patients.filter((patient: Patient) => 
    (patient.status === 'in_progress' || patient.status === 'completed') &&
    (patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm))
  );

  const handleUpdateVitalSigns = async (newVitalSigns: Partial<VitalSigns>) => {
    if (!selectedPatient) return;

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          vital_signs: {
            ...selectedPatient.vital_signs,
            ...newVitalSigns,
            measuredAt: new Date().toISOString()
          }
        })
        .eq('id', selectedPatient.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar sinais vitais:', error);
    }
  };

  const handleAddEvolution = async () => {
    if (!selectedPatient) return;

    const record: NursingRecord = {
      id: crypto.randomUUID(),
      type: 'evolution',
      description: '',
      registeredBy: 'Enfermeiro',
      date: new Date().toISOString(),
      vital_signs: selectedPatient.vital_signs,
      severity: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('nursing_records')
        .insert([record]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao adicionar evolução:', error);
    }
  };

  const handleAdmitPatient = async (bedId: string) => {
    if (!selectedPatient) return;

    const record: NursingRecord = {
      id: crypto.randomUUID(),
      type: 'admission',
      description: `Paciente admitido no leito ${bedId}`,
      registeredBy: 'Enfermeiro',
      date: new Date().toISOString(),
      severity: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('nursing_records')
        .insert([record]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao admitir paciente:', error);
    }
  };

  const handleDischargePatient = async (bedId: string) => {
    if (!selectedPatient) return;

    const record: NursingRecord = {
      id: crypto.randomUUID(),
      type: 'discharge',
      description: `Paciente recebeu alta do leito ${bedId}`,
      registeredBy: 'Enfermeiro',
      date: new Date().toISOString(),
      severity: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('nursing_records')
        .insert([record]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao dar alta ao paciente:', error);
    }
  };

  const formatBloodPressure = (systolic: number, diastolic: number) => {
    return `${systolic}/${diastolic}`;
  };

  const parseBloodPressure = (value: string): { systolic: number; diastolic: number } => {
    const [systolic, diastolic] = value.split('/').map(Number);
    return { systolic, diastolic };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Enfermagem</h1>
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
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient: Patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="text-sm text-gray-500">CPF: {patient.cpf}</div>
                      </div>
                    </div>
                  </td>
                  <td>{patient.status}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      Selecionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPatient && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Sinais Vitais - {selectedPatient.full_name}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Pressão Arterial</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={selectedPatient.vital_signs?.bloodPressure ? 
                        formatBloodPressure(
                          selectedPatient.vital_signs.bloodPressure.systolic,
                          selectedPatient.vital_signs.bloodPressure.diastolic
                        ) : ''}
                      onChange={(e) => {
                        const bp = parseBloodPressure(e.target.value);
                        handleUpdateVitalSigns({
                          ...selectedPatient.vital_signs,
                          bloodPressure: bp
                        });
                      }}
                      placeholder="120/80"
                    />
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
                      value={selectedPatient.vital_signs?.heartRate || ''}
                      onChange={(e) => handleUpdateVitalSigns({
                        ...selectedPatient.vital_signs,
                        heartRate: Number(e.target.value)
                      })}
                      placeholder="80"
                    />
                    <span>bpm</span>
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
                      value={selectedPatient.vital_signs?.respiratoryRate || ''}
                      onChange={(e) => handleUpdateVitalSigns({
                        ...selectedPatient.vital_signs,
                        respiratoryRate: Number(e.target.value)
                      })}
                      placeholder="16"
                    />
                    <span>rpm</span>
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
                      value={selectedPatient.vital_signs?.temperature || ''}
                      onChange={(e) => handleUpdateVitalSigns({
                        ...selectedPatient.vital_signs,
                        temperature: Number(e.target.value)
                      })}
                      placeholder="36.5"
                    />
                    <span>°C</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Saturação de O2</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={selectedPatient.vital_signs?.oxygenSaturation || ''}
                      onChange={(e) => handleUpdateVitalSigns({
                        ...selectedPatient.vital_signs,
                        oxygenSaturation: Number(e.target.value)
                      })}
                      placeholder="98"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nível de Dor</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={selectedPatient.vital_signs?.painLevel || ''}
                      onChange={(e) => handleUpdateVitalSigns({
                        ...selectedPatient.vital_signs,
                        painLevel: Number(e.target.value)
                      })}
                      placeholder="0"
                    />
                    <span>/10</span>
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-primary"
                  onClick={handleAddEvolution}
                >
                  Adicionar Evolução
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 