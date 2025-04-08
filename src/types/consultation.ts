import { VitalSigns } from './patient';

export interface ConsultationHistory {
  id: string;
  patient_id: string;
  professional_id: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  exams: string[];
  notes: string;
  vital_signs: VitalSigns;
  created_at: string;
  updated_at: string;
} 