import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Patient, ConsultationHistory } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MedicalRecord() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<ConsultationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prontuário Médico</h1>
        <Button onClick={() => router.push('/patients')}>
          Voltar para Lista de Pacientes
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length > 0 ? (
            <div className="space-y-4">
              {consultations.map((consultation, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-500">
                    {consultation.created_at 
                      ? new Date(consultation.created_at).toLocaleString('pt-BR')
                      : 'Data não disponível'
                    }
                  </p>
                  <p className="font-medium">Diagnóstico: {consultation.diagnosis}</p>
                  <p>Sintomas: {consultation.symptoms}</p>
                  <p>Tratamento: {consultation.treatment}</p>
                  {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Prescrições:</p>
                      <ul className="list-disc list-inside">
                        {consultation.prescriptions.map((prescription, idx) => (
                          <li key={idx}>
                            {prescription.medication} - {prescription.dosage} - {prescription.frequency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma consulta registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}