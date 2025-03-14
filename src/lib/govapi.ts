import axios from 'axios';

const CNES_API_URL = 'https://api.datasus.gov.br/cnes';
const ESUS_API_URL = 'https://api.datasus.gov.br/esus';

export const sendHospitalDataToCNES = async (hospitalData) => {
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

export const sendAppointmentToESUS = async (appointmentData) => {
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
