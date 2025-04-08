import type { Patient, VitalSigns } from './patient';

export type SetorTipo = 'triagem' | 'consultorio1' | 'consultorio2';
export type SenhaStatus = 'aguardando' | 'chamado' | 'atendido' | 'cancelado';
export type PrioridadeTipo = 'normal' | 'priority' | 'urgent'; // Azul (normal), Amarelo (priority), Vermelho (urgent)

export interface Senha {
    id: string;
    number: string;
    sector: SetorTipo;
    status: SenhaStatus;
    priority: PrioridadeTipo;
    patient_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Prescription {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface Exam {
    name: string;
    type: 'laboratory' | 'image';
    instructions?: string;
}

// Respostas da API
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
    status: SenhaStatus;
    setor: SetorTipo;
    prioridade: PrioridadeTipo;
    created_at: string;
    updated_at: string;
} 