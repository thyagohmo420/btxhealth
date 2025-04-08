// Tipos de dados para IA Diagnóstica
export interface DiagnosticResult {
  confidence: number;
  findings: string;
  recommendations: string;
  detectedConditions: DetectedCondition[];
  processingTime: number; // em segundos
}

export interface DetectedCondition {
  name: string;
  probability: number;
  severity: 'baixa' | 'média' | 'alta';
  location?: string;
  description?: string;
}

// Dados simulados para diferentes tipos de análises
const chestXRayFindings = [
  { 
    name: 'Pneumonia', 
    descriptions: [
      'Opacidades alveolares no lobo inferior direito, sugestivas de pneumonia.',
      'Consolidação no campo pulmonar direito compatível com processo pneumônico.'
    ],
    recommendations: 'Sugere-se correlação clínica e laboratorial. Considerar antibioticoterapia.'
  },
  { 
    name: 'Efusão Pleural', 
    descriptions: [
      'Pequeno derrame pleural à direita.',
      'Evidência de derrame pleural bilateral, mais pronunciado à esquerda.'
    ],
    recommendations: 'Recomenda-se avaliação com ultrassonografia para quantificação do derrame.'
  },
  { 
    name: 'Cardiomegalia', 
    descriptions: [
      'Aumento da área cardíaca, com índice cardiotorácico > 0,5.',
      'Silhueta cardíaca aumentada, sugestiva de cardiomegalia.'
    ],
    recommendations: 'Avaliação cardiológica e ecocardiograma são recomendados.'
  },
  { 
    name: 'Normal', 
    descriptions: [
      'Campos pulmonares sem opacidades focais. Silhueta cardíaca de dimensões normais.',
      'Parênquima pulmonar sem alterações significativas. Seios costofrênicos livres.'
    ],
    recommendations: 'Sem recomendações específicas.'
  }
];

const brainCTFindings = [
  { 
    name: 'AVC Isquêmico', 
    descriptions: [
      'Hipodensidade em território da artéria cerebral média esquerda, compatível com evento isquêmico recente.',
      'Área hipodensa em região temporo-parietal direita, sugestiva de isquemia aguda.'
    ],
    recommendations: 'Avaliação neurológica urgente. Considerar protocolo de AVC.'
  },
  { 
    name: 'Hemorragia Intracraniana', 
    descriptions: [
      'Imagem hiperdensa em região frontal direita, sugestiva de hemorragia parenquimatosa aguda.',
      'Coleção hemática aguda em região temporal esquerda com efeito de massa sobre estruturas adjacentes.'
    ],
    recommendations: 'Avaliação neurocirúrgica imediata. Monitoramento de pressão intracraniana.'
  },
  { 
    name: 'Tumor Cerebral', 
    descriptions: [
      'Lesão expansiva em região frontal direita com realce heterogêneo ao contraste e edema perilesional.',
      'Massa em fossa posterior com compressão do quarto ventrículo, sugestiva de processo neoplásico.'
    ],
    recommendations: 'Ressonância magnética com contraste para melhor caracterização. Avaliação neurocirúrgica.'
  },
  { 
    name: 'Normal', 
    descriptions: [
      'Parênquima cerebral sem anormalidades focais. Sistema ventricular de morfologia e dimensões normais.',
      'Ausência de lesões isquêmicas, hemorrágicas ou expansivas. Estruturas da linha média centradas.'
    ],
    recommendations: 'Sem recomendações específicas.'
  }
];

const abdominalUltrasoundFindings = [
  { 
    name: 'Esteatose Hepática', 
    descriptions: [
      'Fígado com aumento da ecogenicidade, sugestivo de esteatose hepática moderada.',
      'Parênquima hepático hiperecogênico em relação ao córtex renal, compatível com infiltração gordurosa.'
    ],
    recommendations: 'Avaliação dos níveis séricos de enzimas hepáticas. Orientações sobre dieta e estilo de vida.'
  },
  { 
    name: 'Colelitíase', 
    descriptions: [
      'Vesícula biliar com múltiplas imagens hiperecogênicas que projetam sombra acústica posterior, compatíveis com cálculos.',
      'Presença de cálculos móveis no interior da vesícula biliar, sem sinais de complicação.'
    ],
    recommendations: 'Avaliação com cirurgião geral para discutir manejo da colelitíase.'
  },
  { 
    name: 'Nefropatia', 
    descriptions: [
      'Rins com aumento da ecogenicidade cortical bilateral, sugestivo de nefropatia crônica.',
      'Cistos simples em rim direito, sem outras alterações significativas.'
    ],
    recommendations: 'Avaliação da função renal. Acompanhamento nefrológico.'
  },
  { 
    name: 'Normal', 
    descriptions: [
      'Fígado, vesícula biliar, pâncreas e baço de dimensões e ecotextura normais. Ausência de líquido livre na cavidade.',
      'Órgãos abdominais apresentam características ultrassonográficas dentro dos padrões de normalidade.'
    ],
    recommendations: 'Sem recomendações específicas.'
  }
];

/**
 * Simula a análise de uma imagem médica e gera um resultado diagnóstico
 * @param examType Tipo de exame (raio-x, tomografia, etc)
 * @param bodyPart Parte do corpo analisada
 * @returns Resultado diagnóstico simulado
 */
export function analyzeImage(examType: string, bodyPart: string): Promise<DiagnosticResult> {
  return new Promise((resolve) => {
    // Tempo simulado de processamento entre 2 e 5 segundos
    const processingTime = Math.floor(Math.random() * 3) + 2;
    
    // Escolher aleatoriamente um achado baseado no tipo de exame
    let findings: any;
    if (examType === 'Raio-X' && bodyPart === 'Tórax') {
      findings = chestXRayFindings[Math.floor(Math.random() * chestXRayFindings.length)];
    } else if (examType === 'Tomografia' && bodyPart === 'Crânio') {
      findings = brainCTFindings[Math.floor(Math.random() * brainCTFindings.length)];
    } else if (examType === 'Ultrassom' && bodyPart === 'Abdome') {
      findings = abdominalUltrasoundFindings[Math.floor(Math.random() * abdominalUltrasoundFindings.length)];
    } else {
      // Para outros tipos, gera um resultado aleatório "normal"
      findings = {
        name: 'Normal',
        descriptions: ['Sem alterações significativas.'],
        recommendations: 'Sem recomendações específicas.'
      };
    }
    
    // Gerar condições detectadas
    const detectedConditions: DetectedCondition[] = [];
    if (findings.name !== 'Normal') {
      // Condição principal
      detectedConditions.push({
        name: findings.name,
        probability: 0.7 + (Math.random() * 0.25), // 70-95%
        severity: ['baixa', 'média', 'alta'][Math.floor(Math.random() * 3)] as 'baixa' | 'média' | 'alta',
        location: bodyPart,
        description: findings.descriptions[Math.floor(Math.random() * findings.descriptions.length)]
      });
      
      // Possibilidade de achado secundário (30% de chance)
      if (Math.random() < 0.3) {
        detectedConditions.push({
          name: 'Achado incidental',
          probability: 0.5 + (Math.random() * 0.3), // 50-80%
          severity: 'baixa',
          description: 'Achado de menor relevância clínica, provavelmente incidental.'
        });
      }
    }
    
    // Construir o resultado diagnóstico
    const result: DiagnosticResult = {
      confidence: detectedConditions.length ? 0.75 + (Math.random() * 0.2) : 0.9 + (Math.random() * 0.1),
      findings: detectedConditions.length 
        ? findings.descriptions[Math.floor(Math.random() * findings.descriptions.length)]
        : 'Sem alterações significativas detectadas.',
      recommendations: findings.recommendations,
      detectedConditions,
      processingTime
    };
    
    // Simular tempo de processamento
    setTimeout(() => resolve(result), processingTime * 1000);
  });
}

/**
 * Formata a porcentagem de confiança para exibição
 */
export function formatConfidence(confidence: number): string {
  return (confidence * 100).toFixed(1) + '%';
}

/**
 * Obtém a classe CSS para o nível de severidade
 */
export function getSeverityClass(severity: 'baixa' | 'média' | 'alta'): string {
  switch (severity) {
    case 'baixa':
      return 'text-blue-600 bg-blue-100';
    case 'média':
      return 'text-yellow-600 bg-yellow-100';
    case 'alta':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
} 