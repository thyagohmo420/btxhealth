// Tipos de dados para IA Prescrição
export interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  date: Date;
  medications: Medication[];
  diagnosis: string[];
  notes?: string;
  aiAnalysis?: PrescriptionAnalysis;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
  warnings?: string[];
}

export interface PrescriptionAnalysis {
  interactions: DrugInteraction[];
  warnings: PrescriptionWarning[];
  suggestions: PrescriptionSuggestion[];
  overallRisk: 'baixo' | 'médio' | 'alto';
  confidence: number;
}

export interface DrugInteraction {
  medications: string[];
  severity: 'leve' | 'moderada' | 'grave';
  description: string;
  recommendation: string;
}

export interface PrescriptionWarning {
  type: 'dosagem' | 'frequência' | 'contraindicação' | 'alergia' | 'outro';
  medication: string;
  description: string;
  recommendation: string;
}

export interface PrescriptionSuggestion {
  type: 'alternativa' | 'ajuste' | 'adição' | 'remoção';
  medication: string;
  description: string;
  reasoning: string;
}

// Banco de dados simulado de medicamentos e interações
const medicationDatabase = [
  {
    name: 'Amoxicilina',
    class: 'Antibiótico',
    commonDosages: ['500mg 8/8h', '875mg 12/12h'],
    sideEffects: ['Diarreia', 'Náusea', 'Rash cutâneo'],
    contraindications: ['Alergia a penicilinas'],
    interactions: ['Probenecida', 'Anticoagulantes', 'Contraceptivos orais']
  },
  {
    name: 'Dipirona',
    class: 'Analgésico',
    commonDosages: ['500mg 6/6h', '1g 8/8h'],
    sideEffects: ['Hipotensão', 'Reações alérgicas'],
    contraindications: ['Discrasias sanguíneas', 'Porfiria'],
    interactions: ['Ciclosporina', 'Metotrexato', 'Clorpromazina']
  },
  {
    name: 'Omeprazol',
    class: 'Inibidor de bomba de prótons',
    commonDosages: ['20mg 1x/dia', '40mg 1x/dia'],
    sideEffects: ['Dor de cabeça', 'Diarreia', 'Náusea'],
    contraindications: ['Hipersensibilidade'],
    interactions: ['Clopidogrel', 'Diazepam', 'Warfarina']
  },
  {
    name: 'Atenolol',
    class: 'Betabloqueador',
    commonDosages: ['25mg 1x/dia', '50mg 1x/dia'],
    sideEffects: ['Bradicardia', 'Hipotensão', 'Fadiga'],
    contraindications: ['Asma', 'Bloqueio AV', 'Bradicardia sinusal'],
    interactions: ['Amiodarona', 'Clonidina', 'Insulina', 'Verapamil']
  },
  {
    name: 'Losartana',
    class: 'Antagonista do receptor de angiotensina II',
    commonDosages: ['50mg 1x/dia', '100mg 1x/dia'],
    sideEffects: ['Tontura', 'Insônia', 'Tosse'],
    contraindications: ['Gravidez', 'Estenose de artéria renal bilateral'],
    interactions: ['Diuréticos poupadores de potássio', 'Lítio', 'AINEs']
  },
  {
    name: 'Metformina',
    class: 'Antidiabético',
    commonDosages: ['500mg 2x/dia', '850mg 2x/dia'],
    sideEffects: ['Diarreia', 'Náusea', 'Gosto metálico'],
    contraindications: ['Insuficiência renal', 'Acidose metabólica'],
    interactions: ['Álcool', 'Contrastes iodados', 'Cimetidina']
  },
  {
    name: 'Fluoxetina',
    class: 'Inibidor seletivo da recaptação de serotonina',
    commonDosages: ['20mg 1x/dia', '40mg 1x/dia'],
    sideEffects: ['Insônia', 'Ansiedade', 'Disfunção sexual'],
    contraindications: ['Uso de inibidores da MAO', 'Glaucoma'],
    interactions: ['Tramadol', 'Lítio', 'Triptanos', 'Antipsicóticos']
  },
  {
    name: 'Prednisona',
    class: 'Corticosteroide',
    commonDosages: ['5-60mg 1x/dia', 'Dose variável conforme condição'],
    sideEffects: ['Retenção de líquidos', 'Aumento de pressão arterial', 'Hiperglicemia'],
    contraindications: ['Infecções fúngicas sistêmicas', 'Hipersensibilidade'],
    interactions: ['Anticoagulantes', 'AINEs', 'Antidiabéticos']
  }
];

// Banco de dados simulado de interações medicamentosas
const interactionsDatabase = [
  {
    drugs: ['Amoxicilina', 'Contraceptivos orais'],
    severity: 'moderada',
    description: 'Diminuição da eficácia contraceptiva',
    recommendation: 'Considerar método contraceptivo adicional durante o tratamento'
  },
  {
    drugs: ['Fluoxetina', 'Tramadol'],
    severity: 'grave',
    description: 'Risco aumentado de síndrome serotoninérgica',
    recommendation: 'Evitar uso concomitante ou monitorar cuidadosamente o paciente'
  },
  {
    drugs: ['Omeprazol', 'Clopidogrel'],
    severity: 'moderada',
    description: 'Redução da eficácia do clopidogrel',
    recommendation: 'Considerar o uso de pantoprazol ou outro IBP'
  },
  {
    drugs: ['Metformina', 'Contrastes iodados'],
    severity: 'grave',
    description: 'Risco de acidose láctica',
    recommendation: 'Suspender metformina antes e 48h após uso de contraste'
  },
  {
    drugs: ['Losartana', 'Espironolactona'],
    severity: 'moderada',
    description: 'Risco aumentado de hipercalemia',
    recommendation: 'Monitorar níveis séricos de potássio'
  },
  {
    drugs: ['Atenolol', 'Verapamil'],
    severity: 'grave',
    description: 'Risco de bradicardia severa e bloqueio cardíaco',
    recommendation: 'Evitar uso concomitante ou ajustar doses e monitorar ECG'
  },
  {
    drugs: ['Prednisona', 'AINEs'],
    severity: 'moderada',
    description: 'Aumento do risco de sangramento gastrointestinal',
    recommendation: 'Considerar uso de protetor gástrico'
  },
  {
    drugs: ['Dipirona', 'Metotrexato'],
    severity: 'moderada',
    description: 'Aumento da toxicidade do metotrexato',
    recommendation: 'Monitorar hemograma e função renal'
  }
];

/**
 * Analisa uma prescrição em busca de interações, avisos e sugestões
 * @param prescription Prescrição a ser analisada
 * @returns Análise da prescrição
 */
export function analyzePrescription(prescription: Prescription): Promise<PrescriptionAnalysis> {
  return new Promise((resolve) => {
    // Extrair nomes dos medicamentos
    const medicationNames = prescription.medications.map(med => med.name);
    
    // Buscar interações entre os medicamentos
    const interactions: DrugInteraction[] = [];
    interactionsDatabase.forEach(interaction => {
      // Verifica se a prescrição contém os medicamentos que podem interagir
      const hasInteraction = interaction.drugs.every(drug => 
        medicationNames.some(med => med.toLowerCase().includes(drug.toLowerCase()))
      );
      
      if (hasInteraction) {
        interactions.push({
          medications: interaction.drugs,
          severity: interaction.severity as 'leve' | 'moderada' | 'grave',
          description: interaction.description,
          recommendation: interaction.recommendation
        });
      }
    });
    
    // Gerar avisos sobre dosagens ou contraindicações
    const warnings: PrescriptionWarning[] = [];
    prescription.medications.forEach(medication => {
      // Buscar no banco de dados de medicamentos
      const medInfo = medicationDatabase.find(m => 
        medication.name.toLowerCase().includes(m.name.toLowerCase())
      );
      
      if (medInfo) {
        // Verificar dosagem
        const dosageWarning = Math.random() < 0.2; // 20% de chance de gerar aviso de dosagem
        if (dosageWarning) {
          warnings.push({
            type: 'dosagem',
            medication: medication.name,
            description: `Verifique a dosagem de ${medication.name}. Dosagens comuns são: ${medInfo.commonDosages.join(', ')}.`,
            recommendation: 'Confirmar dose prescrita de acordo com indicação e condição do paciente.'
          });
        }
        
        // Verificar contraindicações com diagnósticos
        const contraindications = medInfo.contraindications.filter(contra => 
          prescription.diagnosis.some(diag => diag.toLowerCase().includes(contra.toLowerCase()))
        );
        
        if (contraindications.length > 0) {
          warnings.push({
            type: 'contraindicação',
            medication: medication.name,
            description: `Possível contraindicação: ${medication.name} x ${contraindications.join(', ')}.`,
            recommendation: 'Avaliar risco-benefício ou considerar alternativa terapêutica.'
          });
        }
      }
    });
    
    // Gerar sugestões
    const suggestions: PrescriptionSuggestion[] = [];
    
    // Sugestão de adição (ex: protetor gástrico com corticoides)
    if (medicationNames.some(med => med.includes('Prednisona')) && 
        !medicationNames.some(med => med.includes('Omeprazol') || med.includes('Pantoprazol'))) {
      suggestions.push({
        type: 'adição',
        medication: 'Protetor gástrico',
        description: 'Considerar a adição de um protetor gástrico (ex: Omeprazol 20mg 1x/dia).',
        reasoning: 'Uso prolongado de corticosteroides aumenta o risco de lesões gastrointestinais.'
      });
    }
    
    // Sugestão de alternativa para interações graves
    interactions.forEach(interaction => {
      if (interaction.severity === 'grave') {
        suggestions.push({
          type: 'alternativa',
          medication: interaction.medications[1],
          description: `Considerar alternativa para ${interaction.medications[1]} devido à interação grave.`,
          reasoning: interaction.description
        });
      }
    });
    
    // Determinar o nível de risco geral
    let overallRisk: 'baixo' | 'médio' | 'alto' = 'baixo';
    if (interactions.some(i => i.severity === 'grave')) {
      overallRisk = 'alto';
    } else if (interactions.some(i => i.severity === 'moderada') || warnings.length > 2) {
      overallRisk = 'médio';
    }
    
    // Construir análise completa
    const analysis: PrescriptionAnalysis = {
      interactions,
      warnings,
      suggestions,
      overallRisk,
      confidence: 0.75 + (Math.random() * 0.2) // 75-95%
    };
    
    // Simular tempo de processamento (1-3s)
    setTimeout(() => resolve(analysis), 1000 + Math.random() * 2000);
  });
}

/**
 * Gera uma sugestão de prescrição baseada no diagnóstico
 * @param diagnoses Lista de diagnósticos
 * @returns Prescrição sugerida pela IA
 */
export function generatePrescriptionSuggestion(diagnoses: string[]): Promise<Medication[]> {
  return new Promise((resolve) => {
    const suggestedMedications: Medication[] = [];
    
    // Mapear diagnósticos comuns para medicamentos sugeridos
    diagnoses.forEach(diagnosis => {
      const diagLower = diagnosis.toLowerCase();
      
      if (diagLower.includes('infecção') || diagLower.includes('pneumonia') || diagLower.includes('amigdalite')) {
        suggestedMedications.push({
          id: 'med-' + Math.random().toString(36).substring(2, 10),
          name: 'Amoxicilina',
          dosage: '500mg',
          frequency: '8/8h',
          duration: '7 dias',
          route: 'Oral',
          instructions: 'Tomar com água, 1 hora antes ou 2 horas após refeições'
        });
      }
      
      if (diagLower.includes('dor') || diagLower.includes('cefaleia') || diagLower.includes('febre')) {
        suggestedMedications.push({
          id: 'med-' + Math.random().toString(36).substring(2, 10),
          name: 'Dipirona',
          dosage: '500mg',
          frequency: '6/6h',
          duration: 'Se necessário',
          route: 'Oral',
          instructions: 'Tomar em caso de dor ou febre. Não exceder 4g ao dia'
        });
      }
      
      if (diagLower.includes('úlcera') || diagLower.includes('gastrite') || diagLower.includes('refluxo')) {
        suggestedMedications.push({
          id: 'med-' + Math.random().toString(36).substring(2, 10),
          name: 'Omeprazol',
          dosage: '20mg',
          frequency: '1x/dia',
          duration: '30 dias',
          route: 'Oral',
          instructions: 'Tomar em jejum, 30 minutos antes do café da manhã'
        });
      }
      
      if (diagLower.includes('hipertensão') || diagLower.includes('pressão alta')) {
        suggestedMedications.push({
          id: 'med-' + Math.random().toString(36).substring(2, 10),
          name: 'Losartana',
          dosage: '50mg',
          frequency: '1x/dia',
          duration: 'Contínuo',
          route: 'Oral',
          instructions: 'Tomar todos os dias no mesmo horário'
        });
      }
      
      if (diagLower.includes('diabetes')) {
        suggestedMedications.push({
          id: 'med-' + Math.random().toString(36).substring(2, 10),
          name: 'Metformina',
          dosage: '500mg',
          frequency: '2x/dia',
          duration: 'Contínuo',
          route: 'Oral',
          instructions: 'Tomar após as refeições principais'
        });
      }
      
      if (diagLower.includes('alergia') || diagLower.includes('rinite') || diagLower.includes('urticária')) {
        suggestedMedications.push({
          id: 'med-' + Math.random().toString(36).substring(2, 10),
          name: 'Loratadina',
          dosage: '10mg',
          frequency: '1x/dia',
          duration: '7 dias',
          route: 'Oral',
          instructions: 'Pode causar sonolência. Evitar atividades que exijam atenção'
        });
      }
    });
    
    // Se não houver sugestões específicas, incluir analgésico genérico
    if (suggestedMedications.length === 0) {
      suggestedMedications.push({
        id: 'med-' + Math.random().toString(36).substring(2, 10),
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: '6/6h',
        duration: 'Se necessário',
        route: 'Oral',
        instructions: 'Em caso de dor ou febre. Não exceder 4g ao dia',
        warnings: ['Evitar uso prolongado', 'Atenção em pacientes com doenças hepáticas']
      });
    }
    
    // Simular tempo de processamento (0.8-2s)
    setTimeout(() => resolve(suggestedMedications), 800 + Math.random() * 1200);
  });
}

/**
 * Formata a severidade de uma interação medicamentosa com classe CSS
 */
export function getSeverityClass(severity: 'leve' | 'moderada' | 'grave'): string {
  switch (severity) {
    case 'leve':
      return 'text-blue-600 bg-blue-100';
    case 'moderada':
      return 'text-yellow-600 bg-yellow-100';
    case 'grave':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
} 