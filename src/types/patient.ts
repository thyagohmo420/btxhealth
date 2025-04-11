import type { PrioridadeTipo } from './queue';

export type PatientStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';
export type Severity = 'low' | 'medium' | 'high';
export type PriorityType = 'low' | 'medium' | 'high' | 'emergency';

export interface VitalSigns {
  temperature: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painLevel?: number;
  glucoseLevel?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  measuredAt: string;
  notes?: string;
}

export interface TriageData {
  id: string;
  symptoms: string[];
  vital_signs: VitalSigns;
  priority: PrioridadeTipo;
  created_at: string;
  updated_at: string;
}

export interface ConsultationHistory {
  id?: string;
  created_at?: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment?: string;
  notes?: string;
  doctor: string;
  prescriptions?: Prescription[];
  exams?: Exam[];
  severity?: Severity;
}

export interface Patient {
  id: string;
  full_name: string;
  birth_date: string;
  cpf: string;
  sus_card?: string;
  phone: string;
  address?: string;
  priority: PriorityType;
  status: PatientStatus;
  severity: Severity;
  queue_number?: string;
  created_at: string;
  updated_at: string;
  gender: string;
  rg: string;
  city?: string;
  state?: string;
  zip_code?: string;
  mother_name?: string;
  father_name?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  health_insurance?: string;
  health_insurance_number?: string;
  health_insurance_validity?: string;
  marital_status: string;
  nationality?: string;
  occupation?: string;
  education_level?: string;
  race?: string;
  ethnicity?: string;
  preferred_contact?: string;
  notes?: string;
  height?: number;
  weight?: number;
  medications?: string[];
  risk_factors?: string[];
  last_visit_date?: string;
  next_visit_date?: string;
  registration_date?: string;
  active?: boolean;
  email: string;
  user_id: string;
  consultation_history?: ConsultationHistory[];
  vital_signs?: VitalSigns;
  medical_records?: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescriptions: Prescription[];
  exams: Exam[];
  doctor: string;
  requiresHospitalization: boolean;
  hospitalizationDetails?: HospitalizationDetails;
  vitalSigns?: VitalSigns;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sentToNursing?: boolean;
  sentToLaboratory?: boolean;
  needsMedication?: boolean;
  needsLaboratoryExams?: boolean;
  nursingNotes?: string;
  nursingCompletedAt?: string;
  nursingProcedures?: NursingProcedure[];
  laboratoryCompletedAt?: string;
  laboratoryNotes?: string;
}

export interface HospitalizationDetails {
  admissionDate?: string;
  dischargeDate?: string;
  reason?: string;
  ward?: string;
  bedNumber?: string;
  notes?: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Exam {
  id?: string;
  name: string;
  type: 'laboratory' | 'imaging';
  status: 'requested' | 'scheduled' | 'performed' | 'cancelled';
  requestDate: string;
  performedDate?: string;
  instructions?: string;
  results?: string;
  notes?: string;
  attachments?: string[];
}

export interface NursingHistory {
  nursingRecords: NursingRecord[];
  bedAssignments: BedAssignment[];
}

export interface NursingRecord {
  id: string;
  type: 'evolution' | 'admission' | 'discharge';
  description: string;
  registered_by: string;
  date: string;
  vital_signs?: VitalSigns;
  severity: Severity;
  created_at: string;
  updated_at: string;
}

export interface BedAssignment {
  id: string;
  bed_id: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientRegistration {
  id: string;
  patient_id: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  priority: PrioridadeTipo;
  arrivalTime: string;
  lastUpdate: string;
  created_at: string;
  updated_at: string;
}

export interface NursingProcedure {
  name: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  notes?: string;
}