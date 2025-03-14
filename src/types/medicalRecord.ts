export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  prescribedBy: string;
  prescribedAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Exam {
  id: string;
  type: string;
  requestDate: string;
  resultDate?: string;
  requestedBy: string;
  status: 'requested' | 'completed' | 'cancelled';
  result?: {
    summary: string;
    details: string;
    files?: string[];
  };
}

export interface Allergy {
  id: string;
  substance: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  diagnosedAt: string;
  diagnosedBy: string;
  status: 'active' | 'inactive';
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedAt: string;
  diagnosedBy: string;
  status: 'active' | 'controlled' | 'resolved';
  notes: string;
}

export interface ClinicalNote {
  id: string;
  date: string;
  professional: {
    id: string;
    name: string;
    specialty: string;
    crm: string;
  };
  type: 'evolution' | 'consultation' | 'procedure';
  content: string;
  attachments?: string[];
}

export interface VitalSigns {
  temperature?: string;
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  measuredAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  medications: Medication[];
  exams: Exam[];
  allergies: Allergy[];
  conditions: MedicalCondition[];
  clinicalNotes: ClinicalNote[];
  vitalSigns: VitalSigns[];
  createdAt: string;
  updatedAt: string;
}