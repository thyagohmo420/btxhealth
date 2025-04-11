import { Patient } from './patient'

export interface PatientsContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  createPatient: (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<any>;
  deletePatient: (id: string) => Promise<void>;
  refreshPatients: () => Promise<void>;
  addMedicalRecord: (patientId: string, recordData: any) => Promise<any>;
} 