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

// Banco de dados de sintomas e sua classificação
const symptomDatabase = [
  { 
    symptom: 'Dor torácica', 
    keywords: ['dor no peito', 'aperto no peito', 'dor precordial', 'angina'],
    defaultPriority: 'Vermelho',
    specialties: ['Cardiologia', 'Clínica Médica']
  },
  { 
    symptom: 'Dispneia grave', 
    keywords: ['falta de ar', 'dificuldade para respirar', 'sufocamento', 'respiração curta'],
    defaultPriority: 'Vermelho',
    specialties: ['Pneumologia', 'Clínica Médica']
  },
  { 
    symptom: 'Hemorragia', 
    keywords: ['sangramento', 'perda de sangue', 'hemorragia'],
    defaultPriority: 'Vermelho',
    specialties: ['Cirurgia', 'Clínica Médica']
  },
  { 
    symptom: 'Convulsão', 
    keywords: ['ataque', 'crise convulsiva', 'epilepsia', 'desmaio com tremores'],
    defaultPriority: 'Laranja',
    specialties: ['Neurologia', 'Clínica Médica']
  },
  { 
    symptom: 'Febre alta', 
    keywords: ['febre', 'temperatura alta', 'pirexia'],
    defaultPriority: 'Amarelo',
    specialties: ['Infectologia', 'Clínica Médica']
  },
  { 
    symptom: 'Trauma leve', 
    keywords: ['pancada', 'contusão', 'queda', 'acidente leve', 'batida'],
    defaultPriority: 'Verde',
    specialties: ['Ortopedia', 'Cirurgia']
  },
  { 
    symptom: 'Dor abdominal', 
    keywords: ['dor na barriga', 'dor abdominal', 'cólica'],
    defaultPriority: 'Amarelo',
    specialties: ['Gastroenterologia', 'Cirurgia', 'Clínica Médica']
  },
  { 
    symptom: 'Cefaleia', 
    keywords: ['dor de cabeça', 'enxaqueca', 'cefaleia'],
    defaultPriority: 'Verde',
    specialties: ['Neurologia', 'Clínica Médica']
  },
  { 
    symptom: 'Tontura', 
    keywords: ['vertigem', 'tontura', 'desequilíbrio', 'sensação de desmaio'],
    defaultPriority: 'Verde',
    specialties: ['Neurologia', 'Otorrinolaringologia', 'Clínica Médica']
  },
  { 
    symptom: 'Vômitos', 
    keywords: ['náusea', 'enjoo', 'vômito'],
    defaultPriority: 'Verde',
    specialties: ['Gastroenterologia', 'Clínica Médica']
  },
  { 
    symptom: 'Reação alérgica grave', 
    keywords: ['alergia', 'urticária', 'inchaço', 'anafilaxia', 'edema'],
    defaultPriority: 'Vermelho',
    specialties: ['Alergologia', 'Clínica Médica']
  },
  { 
    symptom: 'Reação alérgica leve', 
    keywords: ['coceira', 'vermelhidão', 'prurido'],
    defaultPriority: 'Verde',
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
        // Atualiza prioridade se a nova for mais alta
        const priorityRanking = {
          'Emergência': 5,
          'Muito Urgente': 4,
          'Urgente': 3,
          'Pouco Urgente': 2,
          'Não Urgente': 1
        };
        
        if (priorityRanking[dbSymptom.defaultPriority] > priorityRanking[highestPriority]) {
          highestPriority = dbSymptom.defaultPriority;
        }
        
        // Adiciona especialidades recomendadas
        matchedSpecialties = [...matchedSpecialties, ...dbSymptom.specialties];
      }
    });
    
    // Remove duplicatas de especialidades
    matchedSpecialties = [...new Set(matchedSpecialties)];
    
    // Ajusta prioridade com base nos sinais vitais, se disponíveis
    if (patient.vitals) {
      const vitals = patient.vitals;
      
      // Febre alta (>39°C)
      if (vitals.temperature && vitals.temperature > 39) {
        if (highestPriority === 'Pouco Urgente' || highestPriority === 'Não Urgente') {
          highestPriority = 'Urgente';
        }
      }
      
      // Pressão arterial muito alta ou muito baixa
      if (vitals.bloodPressure) {
        const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
        if (systolic > 180 || diastolic > 110 || systolic < 90) {
          if (highestPriority === 'Pouco Urgente' || highestPriority === 'Não Urgente') {
            highestPriority = 'Urgente';
          }
        }
      }
      
      // Frequência cardíaca muito alta ou muito baixa
      if (vitals.heartRate && (vitals.heartRate > 120 || vitals.heartRate < 50)) {
        if (highestPriority !== 'Emergência') {
          highestPriority = 'Muito Urgente';
        }
      }
      
      // Saturação de oxigênio baixa
      if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) {
        highestPriority = 'Emergência';
      } else if (vitals.oxygenSaturation && vitals.oxygenSaturation < 94) {
        if (highestPriority !== 'Emergência') {
          highestPriority = 'Muito Urgente';
        }
      }
      
      // Nível de dor alto
      if (vitals.painLevel && vitals.painLevel >= 8) {
        if (highestPriority === 'Pouco Urgente' || highestPriority === 'Não Urgente') {
          highestPriority = 'Urgente';
        }
      }
      
      // Glicemia muito alta ou muito baixa
      if (vitals.glucoseLevel) {
        if (vitals.glucoseLevel < 60 || vitals.glucoseLevel > 400) {
          if (highestPriority !== 'Emergência') {
            highestPriority = 'Muito Urgente';
          }
        }
      }
    }
    
    // Ajusta prioridade para idosos (>65 anos)
    if (patient.age > 65 && highestPriority === 'Não Urgente') {
      highestPriority = 'Pouco Urgente';
    }
    
    // Determina a cor correspondente à prioridade
    const color = TRIAGE_COLORS[highestPriority];
    
    // Determina o tempo estimado de espera
    const [minWait, maxWait] = TRIAGE_WAIT_TIMES[color];
    const estimatedWaitTime = Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait;
    
    // Gera recomendação de ação
    let recommendedAction = '';
    let alerts: string[] = [];
    
    switch (highestPriority) {
      case 'Emergência':
        recommendedAction = 'Encaminhar imediatamente para sala de emergência';
        break;
      case 'Muito Urgente':
        recommendedAction = 'Encaminhar para atendimento prioritário em até 10 minutos';
        break;
      case 'Urgente':
        recommendedAction = 'Monitorar sinais vitais e aguardar atendimento em até 60 minutos';
        break;
      case 'Pouco Urgente':
        recommendedAction = 'Aguardar atendimento por ordem de chegada';
        break;
      case 'Não Urgente':
        recommendedAction = 'Considerar encaminhamento para unidade básica de saúde';
        break;
    }
    
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