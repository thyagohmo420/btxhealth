import { Patient, PatientStatus, PriorityType, Severity } from './patient'

export interface SectorPatient extends Omit<Patient, 'priority' | 'status' | 'severity'> {
  priority: PriorityType;
  status: PatientStatus;
  severity: Severity;
  record?: string;
  risk?: string;
  admissionDate?: string;
  diagnosis?: string;
  sector?: string;
  age?: number;
  movements?: {
    from: string;
    to: string;
    date: string;
    reason: string;
  }[];
}

export interface Sector {
  id: number;
  name: string;
  type: string;
  building: string;
  floor: string;
  capacity: number;
  currentOccupation: number;
  floorPlan: string | null;
  status: string;
} 