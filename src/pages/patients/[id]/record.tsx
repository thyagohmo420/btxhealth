import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { usePatients } from '@/contexts/PatientsContext';
import { Patient, MedicalRecord, VitalSigns } from '@/types/patient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VitalSignsForm } from '@/components/VitalSignsForm';
import { VitalSignsHistory } from '@/components/VitalSignsHistory';
import { ConsultationHistory } from '@/components/ConsultationHistory';
import { ExamHistory } from '@/components/ExamHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PatientRecord() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [showVitalSignsForm, setShowVitalSignsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;
  const { getPatient, addVitalSigns, getVitalSignsHistory, getMedicalRecords } = usePatients();

  useEffect(() => {
    const loadData = async () => {
      if (id && typeof id === 'string') {
        const [patientData, vitalSignsData, medicalRecordsData] = await Promise.all([
          getPatient(id),
          getVitalSignsHistory(id),
          getMedicalRecords(id)
        ]);

        if (patientData) {
          setPatient(patientData as Patient);
          setVitalSigns(vitalSignsData);
          setMedicalRecords(medicalRecordsData);
        } else {
          router.push('/dashboard');
        }
        setLoading(false);
      }
    };

    loadData();
  }, [id, getPatient, getVitalSignsHistory, getMedicalRecords, router]);

  const handleVitalSignsSubmit = async (data: VitalSigns) => {
    if (id && typeof id === 'string') {
      await addVitalSigns(id, data);
      const updatedVitalSigns = await getVitalSignsHistory(id);
      setVitalSigns(updatedVitalSigns);
      setShowVitalSignsForm(false);
    }
  };

  if (loading || !patient) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Prontuário - {patient.full_name}
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push(`/patients/${id}/consultations/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>

          <div className="mt-4">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                <TabsTrigger value="consultations">Consultas</TabsTrigger>
                <TabsTrigger value="vital-signs">Sinais Vitais</TabsTrigger>
                <TabsTrigger value="exams">Exames</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Paciente</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nome</p>
                      <p className="mt-1">{patient.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                      <p className="mt-1">
                        {format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">CPF</p>
                      <p className="mt-1">{patient.cpf}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">RG</p>
                      <p className="mt-1">{patient.rg}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefone</p>
                      <p className="mt-1">{patient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1">{patient.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Endereço</p>
                      <p className="mt-1">
                        {patient.address}
                        {patient.city && `, ${patient.city}`}
                        {patient.state && ` - ${patient.state}`}
                        {patient.zip_code && `, CEP: ${patient.zip_code}`}
                      </p>
                    </div>

                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Alergias</p>
                        <p className="mt-1">{patient.allergies.join(', ')}</p>
                      </div>
                    )}

                    {patient.blood_type && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tipo Sanguíneo</p>
                        <p className="mt-1">{patient.blood_type}</p>
                      </div>
                    )}

                    {patient.emergency_contact && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Contato de Emergência</p>
                        <p className="mt-1">{patient.emergency_contact}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="consultations">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Histórico de Consultas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ConsultationHistory records={medicalRecords} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vital-signs">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Sinais Vitais</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVitalSignsForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {showVitalSignsForm ? (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Novo Registro de Sinais Vitais
                        </h3>
                        <VitalSignsForm
                          onSubmit={handleVitalSignsSubmit}
                          onCancel={() => setShowVitalSignsForm(false)}
                        />
                      </div>
                    ) : (
                      <VitalSignsHistory vitalSigns={vitalSigns} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exams">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Exames</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExamHistory
                      exams={medicalRecords.flatMap(record => record.exams)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
} 