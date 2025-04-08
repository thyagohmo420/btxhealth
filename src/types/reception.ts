import { Patient as BasePatient, PatientStatus } from './patient'

export type ReceptionPriorityType = 'low' | 'medium' | 'high' | 'emergency';

export interface ReceptionPatient extends Omit<BasePatient, 'priority' | 'status'> {
  priority: ReceptionPriorityType;
  status: PatientStatus;
  queue_number?: string;
  active?: boolean;
} 