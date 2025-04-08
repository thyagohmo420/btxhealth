export type ProfessionalRole = 'doctor' | 'nurse' | 'receptionist' | 'other';

export interface Professional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: ProfessionalRole;
  specialization: string;
  registration_number?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
} 