// Tipos de dados para IA Triagem
export interface TriagePatient {
  id: string;
  name: string;
  age: number;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  mainComplaint: string;
  symptoms: string[];
  vitals?: VitalSigns;
  arrivalTime: Date;
  triageResult?: TriageResult;
}

export interface VitalSigns {
  temperature?: number; // em °C
  bloodPressure?: string; // ex: "120/80"
  heartRate?: number; // em bpm
  respiratoryRate?: number; // em irpm
  oxygenSaturation?: number; // em %
  painLevel?: number; // 0-10
  glucoseLevel?: number; // em mg/dL
}

export interface TriageResult {
  priority: TriagePriority;
  color: TriageColor;
  recommendedAction: string;
  estimatedWaitTime: number; // em minutos
  recommendedSpecialty?: string;
  alerts?: string[];
  AIConfidence: number; // 0-1
}

export type TriagePriority = 'Emergência' | 'Muito Urgente' | 'Urgente' | 'Pouco Urgente' | 'Não Urgente';
export type TriageColor = 'Vermelho' | 'Laranja' | 'Amarelo' | 'Verde' | 'Azul';

// Mapeamento de cores e prioridades
export const TRIAGE_PRIORITIES: Record<TriageColor, TriagePriority> = {
  'Vermelho': 'Emergência',
  'Laranja': 'Muito Urgente',
  'Amarelo': 'Urgente',
  'Verde': 'Pouco Urgente',
  'Azul': 'Não Urgente'
};

export const TRIAGE_COLORS: Record<TriagePriority, TriageColor> = {
  'Emergência': 'Vermelho',
  'Muito Urgente': 'Laranja',
  'Urgente': 'Amarelo',
  'Pouco Urgente': 'Verde',
  'Não Urgente': 'Azul'
};

export const TRIAGE_WAIT_TIMES: Record<TriageColor, [number, number]> = {
  'Vermelho': [0, 0], // Atendimento imediato
  'Laranja': [0, 10], // 0-10 minutos
  'Amarelo': [10, 60], // 10-60 minutos
  'Verde': [60, 120], // 1-2 horas
  'Azul': [120, 240] // 2-4 horas
};

// Interface para o banco de dados de sintomas
interface SymptomData {
  symptom: string;
  keywords: string[];
  defaultPriority: TriagePriority;
  specialties: string[];
}

// Banco de dados de sintomas e sua classificação
const symptomDatabase: SymptomData[] = [
  { 
    symptom: 'Dor torácica', 
    keywords: ['dor no peito', 'aperto no peito', 'dor precordial', 'angina'],
    defaultPriority: 'Emergência',
    specialties: ['Cardiologia', 'Clínica Médica']
  },
  { 
    symptom: 'Dispneia grave', 
    keywords: ['falta de ar', 'dificuldade para respirar', 'sufocamento', 'respiração curta'],
    defaultPriority: 'Emergência',
    specialties: ['Pneumologia', 'Clínica Médica']
  },
  { 
    symptom: 'Hemorragia', 
    keywords: ['sangramento', 'perda de sangue', 'hemorragia'],
    defaultPriority: 'Emergência',
    specialties: ['Cirurgia', 'Clínica Médica']
  },
  { 
    symptom: 'Convulsão', 
    keywords: ['ataque', 'crise convulsiva', 'epilepsia', 'desmaio com tremores'],
    defaultPriority: 'Muito Urgente',
    specialties: ['Neurologia', 'Clínica Médica']
  },
  { 
    symptom: 'Febre alta', 
    keywords: ['febre', 'temperatura alta', 'pirexia'],
    defaultPriority: 'Urgente',
    specialties: ['Infectologia', 'Clínica Médica']
  },
  { 
    symptom: 'Trauma leve', 
    keywords: ['pancada', 'contusão', 'queda', 'acidente leve', 'batida'],
    defaultPriority: 'Pouco Urgente',
    specialties: ['Ortopedia', 'Cirurgia']
  },
  { 
    symptom: 'Dor abdominal', 
    keywords: ['dor na barriga', 'dor abdominal', 'cólica'],
    defaultPriority: 'Urgente',
    specialties: ['Gastroenterologia', 'Cirurgia', 'Clínica Médica']
  },
  { 
    symptom: 'Cefaleia', 
    keywords: ['dor de cabeça', 'enxaqueca', 'cefaleia'],
    defaultPriority: 'Pouco Urgente',
    specialties: ['Neurologia', 'Clínica Médica']
  },
  { 
    symptom: 'Tontura', 
    keywords: ['vertigem', 'tontura', 'desequilíbrio', 'sensação de desmaio'],
    defaultPriority: 'Pouco Urgente',
    specialties: ['Neurologia', 'Otorrinolaringologia', 'Clínica Médica']
  },
  { 
    symptom: 'Vômitos', 
    keywords: ['náusea', 'enjoo', 'vômito'],
    defaultPriority: 'Pouco Urgente',
    specialties: ['Gastroenterologia', 'Clínica Médica']
  },
  { 
    symptom: 'Reação alérgica grave', 
    keywords: ['alergia', 'urticária', 'inchaço', 'anafilaxia', 'edema'],
    defaultPriority: 'Emergência',
    specialties: ['Alergologia', 'Clínica Médica']
  },
  { 
    symptom: 'Reação alérgica leve', 
    keywords: ['coceira', 'vermelhidão', 'prurido'],
    defaultPriority: 'Pouco Urgente',
    specialties: ['Alergologia', 'Dermatologia', 'Clínica Médica']
  }
];

/**
 * Analisa os sintomas e sinais vitais de um paciente e determina a prioridade de triagem
 * @param patient Dados do paciente para triagem
 * @returns Resultado da triagem
 */
export function performAITriage(patient: TriagePatient): Promise<TriageResult> {
  return new Promise((resolve) => {
    // Avaliação de prioridade baseada em sintomas
    let highestPriority: TriagePriority = 'Não Urgente';
    let matchedSpecialties: string[] = [];
    
    // Define o ranking de prioridades
    const priorityRanking: Record<TriagePriority, number> = {
      'Emergência': 5,
      'Muito Urgente': 4,
      'Urgente': 3,
      'Pouco Urgente': 2,
      'Não Urgente': 1
    };

    // Função auxiliar para atualizar a prioridade
    const updatePriority = (newPriority: TriagePriority) => {
      if (priorityRanking[newPriority] > priorityRanking[highestPriority]) {
        highestPriority = newPriority;
      }
    };
    
    // Analisa sintomas principais e queixa
    const allSymptomsText = [
      patient.mainComplaint,
      ...(patient.symptoms || [])
    ].join(' ').toLowerCase();
    
    symptomDatabase.forEach(dbSymptom => {
      // Verifica se algum dos termos-chave está presente na descrição dos sintomas
      const hasSymptom = dbSymptom.keywords.some(keyword => 
        allSymptomsText.includes(keyword.toLowerCase())
      );
      
      if (hasSymptom) {
        updatePriority(dbSymptom.defaultPriority);
        // Adiciona especialidades recomendadas
        matchedSpecialties = [...matchedSpecialties, ...dbSymptom.specialties];
      }
    });
    
    // Remove duplicatas de especialidades usando Array.from
    matchedSpecialties = Array.from(new Set(matchedSpecialties));
    
    // Ajusta prioridade com base nos sinais vitais, se disponíveis
    if (patient.vitals) {
      const vitals = patient.vitals;
      
      // Febre alta (>39°C)
      if (vitals.temperature && vitals.temperature > 39) {
        const currentPriorityRank = priorityRanking[highestPriority];
        if (currentPriorityRank <= priorityRanking['Pouco Urgente']) {
          updatePriority('Urgente');
        }
      }
      
      // Pressão arterial muito alta ou muito baixa
      if (vitals.bloodPressure) {
        const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
        if (systolic > 180 || diastolic > 110 || systolic < 90) {
          const currentPriorityRank = priorityRanking[highestPriority];
          if (currentPriorityRank <= priorityRanking['Pouco Urgente']) {
            updatePriority('Urgente');
          }
        }
      }
      
      // Frequência cardíaca muito alta ou muito baixa
      if (vitals.heartRate) {
        if (vitals.heartRate > 150 || vitals.heartRate < 40) {
          updatePriority('Emergência');
        }
      }
      
      // Saturação de oxigênio muito baixa
      if (vitals.oxygenSaturation) {
        if (vitals.oxygenSaturation < 90) {
          updatePriority('Emergência');
        }
      }
      
      // Nível de dor muito alto
      if (vitals.painLevel) {
        if (vitals.painLevel >= 8) {
          const currentPriorityRank = priorityRanking[highestPriority];
          if (currentPriorityRank <= priorityRanking['Pouco Urgente']) {
            updatePriority('Urgente');
          }
        }
      }
    }
    
    // Ajusta prioridade para idosos (>65 anos)
    if (patient.age > 65) {
      const currentPriorityRank = priorityRanking[highestPriority];
      if (currentPriorityRank <= priorityRanking['Não Urgente']) {
        updatePriority('Pouco Urgente');
      }
    }
    
    // Determina a cor correspondente à prioridade
    const color = TRIAGE_COLORS[highestPriority];
    
    // Determina o tempo estimado de espera
    const [minWait, maxWait] = TRIAGE_WAIT_TIMES[color];
    const estimatedWaitTime = Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait;
    
    // Gera recomendação de ação
    let recommendedAction = '';
    let alerts: string[] = [];
    
    const actionMap: Record<TriagePriority, string> = {
      'Emergência': 'Encaminhar imediatamente para sala de emergência',
      'Muito Urgente': 'Encaminhar para atendimento prioritário em até 10 minutos',
      'Urgente': 'Monitorar sinais vitais e aguardar atendimento em até 60 minutos',
      'Pouco Urgente': 'Aguardar atendimento por ordem de chegada',
      'Não Urgente': 'Considerar encaminhamento para unidade básica de saúde'
    };

    recommendedAction = actionMap[highestPriority];
    
    // Gera alertas específicos
    if (patient.vitals) {
      if (patient.vitals.temperature && patient.vitals.temperature > 38) {
        alerts.push('Paciente febril');
      }
      
      if (patient.vitals.oxygenSaturation && patient.vitals.oxygenSaturation < 95) {
        alerts.push('Saturação de oxigênio reduzida');
      }
      
      if (patient.vitals.bloodPressure) {
        const [systolic, diastolic] = patient.vitals.bloodPressure.split('/').map(Number);
        if (systolic > 140 || diastolic > 90) {
          alerts.push('Pressão arterial elevada');
        }
      }
    }
    
    // Determina a especialidade recomendada (se tiver mais de uma, escolhe a primeira)
    const recommendedSpecialty = matchedSpecialties.length > 0 ? matchedSpecialties[0] : 'Clínica Médica';
    
    // Calcula nível de confiança da IA (simulado)
    const AIConfidence = 0.7 + (Math.random() * 0.25); // 70-95%
    
    // Constrói o resultado da triagem
    const result: TriageResult = {
      priority: highestPriority,
      color,
      recommendedAction,
      estimatedWaitTime,
      recommendedSpecialty,
      alerts: alerts.length > 0 ? alerts : undefined,
      AIConfidence
    };
    
    // Simula tempo de processamento (0.8-2.5s)
    setTimeout(() => resolve(result), 800 + Math.random() * 1700);
  });
}

/**
 * Obtém a classe CSS para a cor de triagem
 */
export function getTriageColorClass(color: TriageColor): string {
  switch (color) {
    case 'Vermelho':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Laranja':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Amarelo':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Verde':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Azul':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Criar novo paciente para triagem com ID gerado automaticamente
 */
export function createNewTriagePatient(data: Partial<TriagePatient>): TriagePatient {
  const id = 'pat-' + Math.random().toString(36).substring(2, 10);
  
  return {
    id,
    name: data.name || 'Paciente sem identificação',
    age: data.age || 0,
    gender: data.gender || 'Outro',
    mainComplaint: data.mainComplaint || '',
    symptoms: data.symptoms || [],
    vitals: data.vitals || {},
    arrivalTime: data.arrivalTime || new Date(),
    triageResult: data.triageResult
  };
} 