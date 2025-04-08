import type { VitalSigns } from './patient';

export type NursingRecordType = 'evolution' | 'admission' | 'discharge';
export type NursingSeverity = 'low' | 'medium' | 'high';

export interface NursingRecord {
  id: string;
  type: NursingRecordType;
  description: string;
  registeredBy: string;
  date: string;
  vital_signs?: VitalSigns;
  severity: NursingSeverity;
  created_at: string;
  updated_at: string;
}

export interface BedAssignment {
  id: string;
  bedId: string;
  patientId: string;
  startDate: string;
  endDate?: string;
  created_at: string;
  updated_at: string;
}

export interface NursingHistory {
  nursingRecords: NursingRecord[];
  bedAssignments: BedAssignment[];
}

export interface Bed {
  id: string;
  number: string;
  sector: string;
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
  updated_at: string;
} 