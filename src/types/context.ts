import { Patient, MedicalRecord, VitalSigns } from './patient'

export interface PatientsContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  createPatient: (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
  getPatientsByStatus: (status: Patient['status']) => Patient[];
  addMedicalRecord: (patientId: string, record: Omit<MedicalRecord, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addVitalSigns: (patientId: string, vitalSigns: VitalSigns) => Promise<void>;
  getVitalSignsHistory: (patientId: string) => Promise<VitalSigns[]>;
  getMedicalRecords: (patientId: string) => Promise<MedicalRecord[]>;
} 