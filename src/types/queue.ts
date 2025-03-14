export type SenhaStatus = 'Aguardando' | 'Em Atendimento' | 'Atendido' | 'Cancelado';
export type SetorTipo = 'Recepção' | 'Triagem' | 'Consultório' | 'Enfermagem';
export type Prioridade = 'normal' | 'prioritario' | 'emergencia';

export interface Senha {
    id: string;
    numero: number;
    status: 'aguardando' | 'em_atendimento' | 'finalizado';
    setor: 'triagem' | 'consultorio1' | 'consultorio2';
    prioridade: 'normal' | 'prioritario' | 'emergencia';
    created_at: string;
    updated_at: string;
}

export interface GerarSenhaResponse {
    success: boolean;
    id?: number;
    numero?: number;
    setor?: SetorTipo;
    message?: string;
}

export interface ChamarSenhaResponse {
    success: boolean;
    id?: number;
    numero?: number;
    setor?: SetorTipo;
    message?: string;
}

export interface FinalizarAtendimentoResponse {
    success: boolean;
    message: string;
}

export interface SenhaResponse {
    id: string;
    numero: number;
    status: string;
    setor: string;
    prioridade: string;
    created_at: string;
    updated_at: string;
} 