import React, { useEffect, useState } from 'react';
import { usePatients } from '../contexts/PatientsContext';

export default function TVDisplay() {
  const { patients } = usePatients();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar o horário a cada 10 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Separar pacientes por setor
  const receptionPatients = patients.filter(p => p.status === 'waiting');
  const triagePatients = patients.filter(p => p.status === 'in_triage');
  const consultationPatients = patients.filter(p => p.status === 'in_service');

  // Ordenar pacientes por horário de chegada
  const sortByArrival = (patientList: any[]) => {
    return [...patientList].sort((a, b) => {
      return new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
    });
  };

  const SectionList = ({ 
    patients, 
    title, 
    color 
  }: { 
    patients: any[], 
    title: string, 
    color: string 
  }) => (
    <div className={`p-4 rounded-lg ${color}`}>
      <h3 className="text-xl font-bold mb-3 text-white flex justify-between">
        <span>{title}</span>
        <span>({patients.length})</span>
      </h3>
      <div className="space-y-2">
        {sortByArrival(patients).map(patient => (
          <div key={patient.id} className="bg-white p-3 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {patient.name.split(' ')[0]}
                </div>
                <div className="text-gray-600">
                  Senha: {patient.ticketNumber}
                </div>
                <div className="text-sm text-gray-500">
                  Chegada: {patient.arrivalTime}
                </div>
              </div>
              {patient.priority && (
                <span className={`px-2 py-1 text-sm rounded-full ${
                  patient.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  patient.priority === 'priority' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {patient.priority === 'urgent' ? 'Emergência' :
                   patient.priority === 'priority' ? 'Prioritário' :
                   'Normal'}
                </span>
              )}
            </div>
          </div>
        ))}
        {patients.length === 0 && (
          <div className="bg-white/80 p-3 rounded-lg text-center text-gray-500">
            Nenhum paciente
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Hospital de Juquitiba</h1>
            <div className="text-xl text-gray-600">
              {currentTime.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recepção */}
            <SectionList 
              patients={receptionPatients} 
              color="bg-blue-600" 
              title="RECEPÇÃO"
            />

            {/* Triagem */}
            <SectionList 
              patients={triagePatients} 
              color="bg-yellow-500" 
              title="TRIAGEM"
            />

            {/* Consultório */}
            <SectionList 
              patients={consultationPatients} 
              color="bg-green-600" 
              title="CONSULTÓRIO"
            />
          </div>

          <div className="mt-6 text-center text-gray-600">
            <p>Total de pacientes: {patients.filter(p => p.status !== 'completed').length}</p>
            <p className="text-sm mt-2">Atualizado automaticamente a cada 10 segundos</p>
          </div>
        </div>
      </div>
    </div>
  );
} 