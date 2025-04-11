import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Patient } from '@/types/patient';

export default function ElectronicRecord() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!patient) {
    return <div>Paciente não encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Prontuário Eletrônico</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Dados do Paciente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Nome</p>
            <p className="font-medium">{patient.full_name}</p>
          </div>
          <div>
            <p className="text-gray-600">CPF</p>
            <p className="font-medium">{patient.cpf}</p>
          </div>
          <div>
            <p className="text-gray-600">Data de Nascimento</p>
            <p className="font-medium">{patient.birth_date}</p>
          </div>
          <div>
            <p className="text-gray-600">Telefone</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
        </div>

        {patient.consultation_history && patient.consultation_history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Histórico de Consultas</h3>
            <div className="space-y-4">
              {patient.consultation_history.map((consultation, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-500">{consultation.created_at}</p>
                  <p className="font-medium">Diagnóstico: {consultation.diagnosis}</p>
                  <p>Sintomas: {consultation.symptoms}</p>
                  <p>Tratamento: {consultation.treatment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 