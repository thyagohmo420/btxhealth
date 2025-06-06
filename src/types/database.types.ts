export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: PublicSchema
}

export interface PublicSchema {
  Tables: {
    pacientes: {
      Row: {
        id: string
        nome: string
        data_nascimento: string
        cpf: string
        criado_em: string
      }
      Insert: {
        id?: string
        nome: string
        data_nascimento: string
        cpf: string
        criado_em?: string
      }
      Update: {
        id?: string
        nome?: string
        data_nascimento?: string
        cpf?: string
        criado_em?: string
      }
    }
    consultas: {
      Row: {
        id: string
        paciente_id: string
        profissional_id: string
        data: string
        observacoes: string | null
      }
      Insert: {
        id?: string
        paciente_id: string
        profissional_id: string
        data: string
        observacoes?: string | null
      }
      Update: {
        id?: string
        paciente_id?: string
        profissional_id?: string
        data?: string
        observacoes?: string | null
      }
    }
  }
  Views: {
    [_ in never]: never
  }
  Functions: {
    [_ in never]: never
  }
  Enums: {
    [_ in never]: never
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 