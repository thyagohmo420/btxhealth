'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'

// Definir a interface para os dados de triagem
interface TriageData {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  symptoms: string;
  observations: string;
}

// Definir a interface para o paciente
interface Patient {
  id: string;
  name: string;
  birthDate: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  service: string;
  priority: 'normal' | 'priority' | 'emergency';
  status: 'reception' | 'triage' | 'consulting_room' | 'completed';
  created_at: string;
  triage_data?: TriageData;
}

// Dados simulados
const mockPatients: Patient[] = [
  { 
    id: '1', 
    name: 'João Silva', 
    birthDate: '1980-05-15', 
    cpf: '123.456.789-00', 
    phone: '(11) 98765-4321', 
    email: 'joao@email.com',
    address: 'Rua A, 123',
    service: 'Consulta geral',
    priority: 'normal',
    status: 'reception',
    created_at: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'Maria Oliveira', 
    birthDate: '1990-10-20', 
    cpf: '987.654.321-00', 
    phone: '(11) 91234-5678', 
    email: 'maria@email.com',
    address: 'Rua B, 456',
    service: 'Ortopedia',
    priority: 'priority',
    status: 'triage',
    created_at: new Date().toISOString(),
    triage_data: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.5,
      weight: 70,
      height: 165,
      symptoms: 'Dor no joelho',
      observations: 'Paciente relata queda recente'
    }
  },
  { 
    id: '3', 
    name: 'Carlos Ferreira', 
    birthDate: '1975-03-10', 
    cpf: '456.789.123-00', 
    phone: '(11) 94567-8912', 
    email: 'carlos@email.com',
    address: 'Rua C, 789',
    service: 'Cardiologia',
    priority: 'emergency',
    status: 'consulting_room',
    created_at: new Date().toISOString(),
    triage_data: {
      bloodPressure: '140/90',
      heartRate: 85,
      temperature: 36.8,
      weight: 80,
      height: 175,
      symptoms: 'Dor no peito',
      observations: 'Histórico de hipertensão'
    }
  }
];

export default function TestePage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentTab, setCurrentTab] = useState<'reception' | 'triage' | 'consulting_room'>('reception');

  const handleMoveToNextStage = (patientId: string) => {
    setPatients(prevPatients => 
      prevPatients.map(patient => {
        if (patient.id === patientId) {
          const newStatus = 
            patient.status === 'reception' ? 'triage' : 
            patient.status === 'triage' ? 'consulting_room' : 
            'completed';
          
          toast.success(`Paciente ${patient.name} movido para ${
            newStatus === 'triage' ? 'Triagem' : 
            newStatus === 'consulting_room' ? 'Consultório' : 
            'Finalizado'
          }`);
          
          return {
            ...patient,
            status: newStatus as 'reception' | 'triage' | 'consulting_room' | 'completed'
          };
        }
        return patient;
      })
    );
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  // Filtrar pacientes por status
  const filteredPatients = patients.filter(patient => 
    patient.status === currentTab
  );

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Sistema de Gestão de Saúde - Modo Teste</h1>
      
      <div className="bg-yellow-100 p-4 rounded mb-6">
        <p className="font-bold">Modo de Teste Ativado</p>
        <p>Esta página permite testar o fluxo do sistema sem autenticação com Supabase.</p>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <Button 
          variant={currentTab === 'reception' ? 'default' : 'outline'}
          onClick={() => setCurrentTab('reception')}
          className="bg-green-500 hover:bg-green-600"
        >
          Recepção
        </Button>
        <Button 
          variant={currentTab === 'triage' ? 'default' : 'outline'}
          onClick={() => setCurrentTab('triage')}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          Triagem
        </Button>
        <Button 
          variant={currentTab === 'consulting_room' ? 'default' : 'outline'}
          onClick={() => setCurrentTab('consulting_room')}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Consultório
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {currentTab === 'reception' ? 'Pacientes na Recepção' :
             currentTab === 'triage' ? 'Pacientes para Triagem' :
             'Pacientes no Consultório'}
          </h2>
          
          {filteredPatients.length === 0 ? (
            <p className="text-gray-500">Nenhum paciente neste estágio</p>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map(patient => (
                <Card key={patient.id} className="cursor-pointer hover:shadow-md" onClick={() => handleSelectPatient(patient)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription>CPF: {patient.cpf}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">Serviço: {patient.service}</p>
                    <p className="text-sm">
                      Prioridade: 
                      <span className={
                        patient.priority === 'emergency' ? 'text-red-500 font-bold' :
                        patient.priority === 'priority' ? 'text-orange-500 font-bold' :
                        'text-green-500'
                      }>
                        {" "}
                        {patient.priority === 'emergency' ? 'Emergência' :
                         patient.priority === 'priority' ? 'Prioritário' :
                         'Normal'}
                      </span>
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToNextStage(patient.id);
                      }}
                      className={
                        currentTab === 'reception' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        currentTab === 'triage' ? 'bg-blue-500 hover:bg-blue-600' :
                        'bg-green-500 hover:bg-green-600'
                      }
                    >
                      {currentTab === 'reception' ? 'Enviar para Triagem' :
                       currentTab === 'triage' ? 'Enviar para Consultório' :
                       'Finalizar Atendimento'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Detalhes do Paciente</h2>
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedPatient.name}</CardTitle>
                <CardDescription>
                  Data de Nascimento: {new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p><strong>CPF:</strong> {selectedPatient.cpf}</p>
                  <p><strong>Telefone:</strong> {selectedPatient.phone}</p>
                  <p><strong>Email:</strong> {selectedPatient.email}</p>
                  <p><strong>Endereço:</strong> {selectedPatient.address}</p>
                  <p><strong>Serviço:</strong> {selectedPatient.service}</p>
                  <p>
                    <strong>Prioridade:</strong> 
                    <span className={
                      selectedPatient.priority === 'emergency' ? 'text-red-500 font-bold' :
                      selectedPatient.priority === 'priority' ? 'text-orange-500 font-bold' :
                      'text-green-500'
                    }>
                      {" "}
                      {selectedPatient.priority === 'emergency' ? 'Emergência' :
                       selectedPatient.priority === 'priority' ? 'Prioritário' :
                       'Normal'}
                    </span>
                  </p>
                </div>
                
                {selectedPatient.triage_data && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Dados da Triagem</h3>
                    <p><strong>Pressão Arterial:</strong> {selectedPatient.triage_data.bloodPressure}</p>
                    <p><strong>Frequência Cardíaca:</strong> {selectedPatient.triage_data.heartRate} bpm</p>
                    <p><strong>Temperatura:</strong> {selectedPatient.triage_data.temperature}°C</p>
                    <p><strong>Peso:</strong> {selectedPatient.triage_data.weight} kg</p>
                    <p><strong>Altura:</strong> {selectedPatient.triage_data.height} cm</p>
                    <p><strong>Sintomas:</strong> {selectedPatient.triage_data.symptoms}</p>
                    <p><strong>Observações:</strong> {selectedPatient.triage_data.observations}</p>
                  </div>
                )}
                
                {currentTab === 'triage' && !selectedPatient.triage_data && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Formulário de Triagem</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Pressão Arterial</label>
                        <Input placeholder="Ex: 120/80" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Frequência Cardíaca</label>
                        <Input placeholder="Ex: 72" type="number" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Temperatura</label>
                        <Input placeholder="Ex: 36.5" type="number" step="0.1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sintomas</label>
                        <Input placeholder="Descreva os sintomas" />
                      </div>
                      <Button className="w-full">Salvar Triagem</Button>
                    </div>
                  </div>
                )}
                
                {currentTab === 'consulting_room' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Formulário de Consulta</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Diagnóstico</label>
                        <Input placeholder="Diagnóstico do paciente" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Prescrição</label>
                        <Input placeholder="Medicamentos prescritos" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <Input placeholder="Observações adicionais" />
                      </div>
                      <Button className="w-full">Salvar Consulta</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <p className="text-gray-500">Selecione um paciente para ver os detalhes</p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Vista da TV</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="bg-green-500 text-white">
              <CardTitle>Recepção</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {patients.filter(p => p.status === 'reception').map(patient => (
                <div key={patient.id} className="mb-2 p-2 bg-white rounded shadow">
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-sm">{patient.service}</p>
                </div>
              ))}
              {patients.filter(p => p.status === 'reception').length === 0 && (
                <p className="text-gray-500">Nenhum paciente</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="bg-yellow-500 text-white">
              <CardTitle>Triagem</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {patients.filter(p => p.status === 'triage').map(patient => (
                <div key={patient.id} className="mb-2 p-2 bg-white rounded shadow">
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-sm">{patient.service}</p>
                </div>
              ))}
              {patients.filter(p => p.status === 'triage').length === 0 && (
                <p className="text-gray-500">Nenhum paciente</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle>Consultório</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {patients.filter(p => p.status === 'consulting_room').map(patient => (
                <div key={patient.id} className="mb-2 p-2 bg-white rounded shadow">
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-sm">{patient.service}</p>
                </div>
              ))}
              {patients.filter(p => p.status === 'consulting_room').length === 0 && (
                <p className="text-gray-500">Nenhum paciente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 