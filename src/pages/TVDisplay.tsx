import { useEffect, useState } from 'react';
import { usePatients } from '../contexts/PatientsContext';
import { Patient } from '@/types/patient';
import { supabase } from '@/lib/supabase';

export default function TVDisplay() {
  const { patients, setPatients } = usePatients();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar o horário a cada 10 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .in('status', ['waiting_consultation', 'in_progress'])
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
      }
    };

    fetchPatients();
    const interval = setInterval(fetchPatients, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Separar pacientes por setor
  const receptionPatients = patients.filter(p => p.status === 'waiting');
  const triagePatients = patients.filter(p => p.status === 'waiting_triage');
  const consultationPatients = patients.filter(p => p.status === 'waiting_consultation');

  // Ordenar pacientes por horário de chegada
  const sortByArrival = (patientList: Patient[]) => {
    return [...patientList].sort((a, b) => {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    });
  };

  const SectionList = ({ 
    patients, 
    title, 
    color 
  }: { 
    patients: Patient[], 
    title: string, 
    color: string 
  }) => (
    <div className={`p-4 rounded-lg ${color}`}>
      <h3 className="text-xl font-bold mb-3 text-white flex justify-between">
        <span>{title}</span>
        <span>({patients.length})</span>
      </h3>
      <div className="space-y-2">
        {sortByArrival(patients).map((patient) => (
          <div
            key={patient.id}
            className={`card bg-white shadow-md rounded-lg p-4 ${
              patient.status === 'in_progress' ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{patient.full_name}</h3>
                <p className="text-sm text-gray-600">
                  {patient.status === 'in_progress' ? 'Em atendimento' : 'Aguardando consulta'}
                </p>
              </div>
              {patient.priority && (
                <span className={`px-2 py-1 text-sm rounded-full ${
                  patient.priority === 'emergency' ? 'bg-purple-100 text-purple-800' :
                  patient.priority === 'high' ? 'bg-red-100 text-red-800' :
                  patient.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {patient.priority === 'emergency' ? 'Emergência' :
                  patient.priority === 'high' ? 'Alta' :
                  patient.priority === 'medium' ? 'Média' :
                  'Baixa'}
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