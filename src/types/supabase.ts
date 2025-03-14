export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          sector: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: string
          sector?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          sector?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          full_name: string
          cpf: string | null
          rg: string | null
          sus_card: string | null
          birth_date: string | null
          phone: string | null
          email: string | null
          address: Json | null
          emergency_contact: Json | null
          priority: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          cpf?: string | null
          rg?: string | null
          sus_card?: string | null
          birth_date?: string | null
          phone?: string | null
          email?: string | null
          address?: Json | null
          emergency_contact?: Json | null
          priority?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          cpf?: string | null
          rg?: string | null
          sus_card?: string | null
          birth_date?: string | null
          phone?: string | null
          email?: string | null
          address?: Json | null
          emergency_contact?: Json | null
          priority?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          date: string
          time: string
          status: string
          type: string
          notes: string | null
          check_in_time: string | null
          start_time: string | null
          end_time: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          professional_id: string
          date: string
          time: string
          status?: string
          type: string
          notes?: string | null
          check_in_time?: string | null
          start_time?: string | null
          end_time?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          professional_id?: string
          date?: string
          time?: string
          status?: string
          type?: string
          notes?: string | null
          check_in_time?: string | null
          start_time?: string | null
          end_time?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      vaccines: {
        Row: {
          id: string
          name: string
          manufacturer: string
          batch: string
          expiration_date: string
          stock: number
          min_stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          manufacturer: string
          batch: string
          expiration_date: string
          stock?: number
          min_stock?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          manufacturer?: string
          batch?: string
          expiration_date?: string
          stock?: number
          min_stock?: number
          created_at?: string
          updated_at?: string
        }
      }
      vaccine_records: {
        Row: {
          id: string
          patient_id: string
          vaccine_id: string
          dose_number: number
          application_date: string
          batch: string
          applied_by: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          vaccine_id: string
          dose_number: number
          application_date: string
          batch: string
          applied_by: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          vaccine_id?: string
          dose_number?: number
          application_date?: string
          batch?: string
          applied_by?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          patient_id: string
          type: string
          status: string
          requested_by: string
          request_date: string
          result_date: string | null
          result: Json | null
          files: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          type: string
          status?: string
          requested_by: string
          request_date: string
          result_date?: string | null
          result?: Json | null
          files?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          type?: string
          status?: string
          requested_by?: string
          request_date?: string
          result_date?: string | null
          result?: Json | null
          files?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          record_type: string
          record_date: string
          professional_id: string
          content: string
          attachments: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          record_type: string
          record_date: string
          professional_id: string
          content: string
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          record_type?: string
          record_date?: string
          professional_id?: string
          content?: string
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      triage: {
        Row: {
          id: string
          patient_id: string
          symptoms: string[]
          medications: string[]
          allergies: string[]
          vital_signs: {
            temperature: number
            blood_pressure: string
            heart_rate: number
            respiratory_rate: number
            oxygen_saturation: number
          }
          priority: string
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          symptoms: string[]
          medications: string[]
          allergies: string[]
          vital_signs: {
            temperature: number
            blood_pressure: string
            heart_rate: number
            respiratory_rate: number
            oxygen_saturation: number
          }
          priority: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          symptoms?: string[]
          medications?: string[]
          allergies?: string[]
          vital_signs?: {
            temperature: number
            blood_pressure: string
            heart_rate: number
            respiratory_rate: number
            oxygen_saturation: number
          }
          priority?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      sectors: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          capacity: number
          manager: string
          status: string
          schedule: string
          staff: number
          occupancy: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          capacity: number
          manager: string
          status: string
          schedule: string
          staff: number
          occupancy?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          capacity?: number
          manager?: string
          status?: string
          schedule?: string
          staff?: number
          occupancy?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      professionals: {
        Row: {
          id: string
          user_id: string
          full_name: string
          registration_number: string | null
          specialty: string | null
          sector_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          registration_number?: string | null
          specialty?: string | null
          sector_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          registration_number?: string | null
          specialty?: string | null
          sector_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pharmacy: {
        Row: {
          id: string
          name: string
          description: string | null
          manufacturer: string
          batch: string
          expiration_date: string
          stock: number
          min_stock: number
          unit: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pharmacy']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pharmacy']['Insert']>
      }
      medication_dispensing: {
        Row: {
          id: string
          patient_id: string
          medication_id: string
          quantity: number
          dispensed_by: string
          dispensed_at: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['medication_dispensing']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['medication_dispensing']['Insert']>
      }
      calls: {
        Row: {
          id: string
          patient_id: string
          sector_id: string
          status: string
          priority: string
          called_at: string | null
          called_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['calls']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['calls']['Insert']>
      }
      reports: {
        Row: {
          id: string
          name: string
          type: string
          parameters: Json
          generated_by: string
          file_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reports']['Insert']>
      }
    }
  }
}