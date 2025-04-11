export type UserRole = 
  | 'admin'
  | 'medico'
  | 'enfermagem'
  | 'recepcao'
  | 'farmacia'
  | 'financeiro'
  | 'rh'
  | 'laboratorio'
  | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at?: string
  last_sign_in_at?: string
} 