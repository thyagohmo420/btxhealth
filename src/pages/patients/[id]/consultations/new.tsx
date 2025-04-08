import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { usePatients } from '@/contexts/PatientsContext';
import { Patient, MedicalRecord, Exam } from '@/types/patient';

interface ConsultationFormData {
  date: string;
  symptoms: string;
  diagnosis: string;
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  exams: Omit<Exam, 'id' | 'status' | 'requestDate' | 'performedDate' | 'results' | 'notes' | 'attachments'>[];
  doctor: string;
  requiresHospitalization: boolean;
}

const initialFormData: ConsultationFormData = {
  date: new Date().toISOString().split('T')[0],
  symptoms: '',
  diagnosis: '',
  prescriptions: [],
  exams: [],
  doctor: '',
  requiresHospitalization: false,
};

export default function NewConsultation() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<ConsultationFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;
  const { getPatient, addMedicalRecord } = usePatients();

  useEffect(() => {
    const loadPatient = async () => {
      if (id && typeof id === 'string') {
        const patientData = await getPatient(id);
        if (patientData) {
          setPatient(patientData as Patient);
        } else {
          router.push('/dashboard');
        }
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, getPatient, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!id || typeof id !== 'string') return;

      await addMedicalRecord(id, {
        date: formData.date,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        prescriptions: formData.prescriptions,
        exams: formData.exams.map(exam => ({
          ...exam,
          status: 'requested' as const,
          requestDate: new Date().toISOString()
        })),
        doctor: formData.doctor,
        requiresHospitalization: formData.requiresHospitalization
      });

      router.push(`/patients/${id}/record`);
    } catch (error) {
      console.error('Erro ao salvar consulta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medication: '', dosage: '', frequency: '', duration: '' }
      ]
    }));
  };

  const addExam = () => {
    setFormData(prev => ({
      ...prev,
      exams: [
        ...prev.exams,
        { name: '', type: 'laboratory', instructions: '' }
      ]
    }));
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Nova Consulta - {patient?.full_name}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Data da Consulta
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                    Médico Responsável
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="doctor"
                      id="doctor"
                      required
                      value={formData.doctor}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
                    Sintomas
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="symptoms"
                      name="symptoms"
                      rows={3}
                      required
                      value={formData.symptoms}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                    Diagnóstico
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="diagnosis"
                      name="diagnosis"
                      rows={3}
                      required
                      value={formData.diagnosis}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Prescrições</h3>
                    <button
                      type="button"
                      onClick={addPrescription}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Adicionar Prescrição
                    </button>
                  </div>
                  {formData.prescriptions.map((prescription, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Medicamento"
                        value={prescription.medication}
                        onChange={e => {
                          const newPrescriptions = [...formData.prescriptions];
                          newPrescriptions[index].medication = e.target.value;
                          setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }));
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Dosagem"
                        value={prescription.dosage}
                        onChange={e => {
                          const newPrescriptions = [...formData.prescriptions];
                          newPrescriptions[index].dosage = e.target.value;
                          setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }));
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Frequência"
                        value={prescription.frequency}
                        onChange={e => {
                          const newPrescriptions = [...formData.prescriptions];
                          newPrescriptions[index].frequency = e.target.value;
                          setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }));
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Duração"
                        value={prescription.duration}
                        onChange={e => {
                          const newPrescriptions = [...formData.prescriptions];
                          newPrescriptions[index].duration = e.target.value;
                          setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }));
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Exames</h3>
                    <button
                      type="button"
                      onClick={addExam}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Adicionar Exame
                    </button>
                  </div>
                  {formData.exams.map((exam, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Nome do Exame"
                        value={exam.name}
                        onChange={e => {
                          const newExams = [...formData.exams];
                          newExams[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, exams: newExams }));
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <select
                        value={exam.type}
                        onChange={e => {
                          const newExams = [...formData.exams];
                          newExams[index].type = e.target.value as 'laboratory' | 'imaging';
                          setFormData(prev => ({ ...prev, exams: newExams }));
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="laboratory">Laboratório</option>
                        <option value="imaging">Imagem</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Instruções"
                        value={exam.instructions || ''}
                        onChange={e => {
                          const newExams = [...formData.exams];
                          newExams[index].instructions = e.target.value;
                          setFormData(prev => ({ ...prev, exams: newExams }));
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requiresHospitalization"
                      name="requiresHospitalization"
                      checked={formData.requiresHospitalization}
                      onChange={e => setFormData(prev => ({ ...prev, requiresHospitalization: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresHospitalization" className="ml-2 block text-sm text-gray-900">
                      Requer Internação
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 