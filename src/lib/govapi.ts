import axios from 'axios';

interface HospitalData {
  name: string;
  cnes: string;
  address: string;
  phone: string;
  email: string;
  beds: number;
  specialties: string[];
}

interface AppointmentData {
  patient_id: string;
  patient_name: string;
  patient_cpf: string;
  patient_sus: string;
  doctor_name: string;
  doctor_crm: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

const CNES_API_URL = 'https://api.datasus.gov.br/cnes';
const ESUS_API_URL = 'https://api.datasus.gov.br/esus';

export const sendHospitalDataToCNES = async (hospitalData: HospitalData) => {
    try {
        const response = await axios.post(`${CNES_API_URL}/hospitais`, hospitalData, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Dados enviados ao CNES:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar dados para o CNES:', error);
        throw error;
    }
};

export const sendAppointmentToESUS = async (appointmentData: AppointmentData) => {
    try {
        const response = await axios.post(`${ESUS_API_URL}/atendimentos`, appointmentData, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Dados enviados ao e-SUS:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar dados para o e-SUS:', error);
        throw error;
    }
};
