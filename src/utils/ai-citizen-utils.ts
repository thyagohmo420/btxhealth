// Tipos de dados para IA Cidadão
export interface CitizenRequest {
  id: string;
  citizenName: string;
  requestType: 'Agendamento' | 'Informação' | 'Documento' | 'Reclamação' | 'Sugestão';
  status: 'Pendente' | 'Em análise' | 'Respondido' | 'Concluído';
  createdAt: Date;
  details: string;
  category?: string;
  priority?: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  aiAnalysis?: AIAnalysis;
  responses?: ResponseMessage[];
}

export interface AIAnalysis {
  sentiment: 'Positivo' | 'Neutro' | 'Negativo';
  recommendedAction: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  tags: string[];
  autoResponse?: string;
  confidence: number;
}

export interface ResponseMessage {
  id: string;
  content: string;
  createdAt: Date;
  isAI: boolean;
  sender?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Programada' | 'Ativa' | 'Concluída' | 'Pausada';
  startDate: Date;
  endDate?: Date;
  targetAudience: string;
  message: string;
  metrics?: CampaignMetrics;
}

export interface CampaignMetrics {
  reach: number;
  engagement: number;
  messages: number;
  responses: number;
  conversionRate: number;
}

// Dados simulados e funções utilitárias

/**
 * Analisa uma solicitação de cidadão e gera uma recomendação automática
 */
export function analyzeRequest(request: Partial<CitizenRequest>): Promise<AIAnalysis> {
  return new Promise((resolve) => {
    // Determinar o sentimento baseado no tipo de solicitação
    let sentiment: 'Positivo' | 'Neutro' | 'Negativo';
    if (request.requestType === 'Reclamação') {
      sentiment = 'Negativo';
    } else if (request.requestType === 'Sugestão' || request.requestType === 'Informação') {
      sentiment = 'Neutro';
    } else {
      sentiment = 'Positivo';
    }
    
    // Determinar a prioridade
    let priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
    if (request.details?.toLowerCase().includes('urgente') || 
        request.details?.toLowerCase().includes('emergência')) {
      priority = 'Urgente';
    } else if (request.requestType === 'Reclamação') {
      priority = 'Alta';
    } else if (request.requestType === 'Agendamento') {
      priority = 'Média';
    } else {
      priority = 'Baixa';
    }
    
    // Gerar tags baseadas no conteúdo
    const tags: string[] = [];
    if (request.details?.toLowerCase().includes('consulta')) tags.push('Consulta');
    if (request.details?.toLowerCase().includes('exame')) tags.push('Exame');
    if (request.details?.toLowerCase().includes('medicamento')) tags.push('Medicamento');
    if (request.details?.toLowerCase().includes('documento')) tags.push('Documento');
    if (tags.length === 0) tags.push('Geral');
    
    // Gerar resposta automática
    let autoResponse = '';
    if (request.requestType === 'Informação') {
      autoResponse = 'Obrigado por entrar em contato. Nossa equipe está analisando sua solicitação e responderá em breve.';
    } else if (request.requestType === 'Agendamento') {
      autoResponse = 'Recebemos sua solicitação de agendamento. Em breve entraremos em contato para confirmar a data e horário.';
    } else if (request.requestType === 'Reclamação') {
      autoResponse = 'Lamentamos pelo ocorrido. Sua reclamação foi registrada e será analisada com prioridade pela nossa equipe.';
    } else if (request.requestType === 'Documento') {
      autoResponse = 'Sua solicitação de documento foi recebida. Estamos processando e em breve disponibilizaremos o que foi solicitado.';
    }
    
    // Gerar ação recomendada
    let recommendedAction = '';
    if (priority === 'Urgente') {
      recommendedAction = 'Encaminhar para atendimento imediato';
    } else if (request.requestType === 'Reclamação') {
      recommendedAction = 'Analisar causa da reclamação e contatar o cidadão';
    } else if (request.requestType === 'Agendamento') {
      recommendedAction = 'Verificar disponibilidade e confirmar agendamento';
    } else if (request.requestType === 'Documento') {
      recommendedAction = 'Localizar documento solicitado e disponibilizar';
    } else {
      recommendedAction = 'Avaliar solicitação e responder ao cidadão';
    }
    
    // Construir a análise
    const analysis: AIAnalysis = {
      sentiment,
      recommendedAction,
      priority,
      tags,
      autoResponse,
      confidence: 0.7 + (Math.random() * 0.25) // 70-95%
    };
    
    // Simular tempo de processamento (0.5-1.5s)
    setTimeout(() => resolve(analysis), 500 + Math.random() * 1000);
  });
}

/**
 * Gera uma resposta de IA para uma solicitação
 */
export function generateAIResponse(request: CitizenRequest): Promise<string> {
  return new Promise((resolve) => {
    let response = '';
    
    // Gerar resposta baseada no tipo de solicitação
    if (request.requestType === 'Informação') {
      if (request.details.toLowerCase().includes('horário')) {
        response = 'O horário de funcionamento da nossa unidade é de segunda a sexta, das 8h às 18h, e aos sábados das 8h às 12h.';
      } else if (request.details.toLowerCase().includes('documento')) {
        response = 'Para solicitar documentos, é necessário apresentar um documento de identidade e preencher o formulário específico disponível em nossa recepção.';
      } else if (request.details.toLowerCase().includes('exame')) {
        response = 'Os resultados de exames ficam disponíveis em até 3 dias úteis através do nosso portal ou na recepção da unidade.';
      } else {
        response = 'Agradecemos seu contato. Para mais informações, recomendamos acessar nosso site ou entrar em contato por telefone.';
      }
    } else if (request.requestType === 'Agendamento') {
      response = 'Sua solicitação de agendamento foi recebida. Baseado em sua necessidade, temos disponibilidade para os próximos dias. Um de nossos atendentes entrará em contato para confirmar a melhor data.';
    } else if (request.requestType === 'Reclamação') {
      response = 'Lamentamos pelos transtornos relatados. Sua reclamação foi registrada e encaminhada ao setor responsável. Entraremos em contato para mais informações e para buscar a melhor solução para seu caso.';
    } else if (request.requestType === 'Documento') {
      response = 'Recebemos sua solicitação de documento. O prazo para emissão é de até 5 dias úteis. Assim que estiver pronto, você receberá uma notificação.';
    } else {
      response = 'Agradecemos seu contato. Sua solicitação foi recebida e está sendo analisada por nossa equipe.';
    }
    
    // Simular tempo de processamento (1-2s)
    setTimeout(() => resolve(response), 1000 + Math.random() * 1000);
  });
}

/**
 * Cria uma nova solicitação de cidadão com ID gerado automaticamente
 */
export function createNewRequest(data: Partial<CitizenRequest>): CitizenRequest {
  const id = 'req-' + Math.random().toString(36).substring(2, 10);
  
  return {
    id,
    citizenName: data.citizenName || 'Cidadão Anônimo',
    requestType: data.requestType || 'Informação',
    status: 'Pendente',
    createdAt: new Date(),
    details: data.details || '',
    category: data.category,
    priority: data.priority || 'Média',
    responses: []
  };
}

/**
 * Obtém estatísticas de solicitações para o dashboard
 */
export function getRequestsStats(requests: CitizenRequest[]) {
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'Pendente').length;
  const analyzed = requests.filter(r => r.status === 'Em análise').length;
  const completed = requests.filter(r => r.status === 'Concluído' || r.status === 'Respondido').length;
  
  // Distribuição por tipo
  const byType = {
    Agendamento: requests.filter(r => r.requestType === 'Agendamento').length,
    Informação: requests.filter(r => r.requestType === 'Informação').length,
    Documento: requests.filter(r => r.requestType === 'Documento').length,
    Reclamação: requests.filter(r => r.requestType === 'Reclamação').length,
    Sugestão: requests.filter(r => r.requestType === 'Sugestão').length
  };
  
  // Calcular tempo médio de resposta (em horas)
  const responseTimes: number[] = [];
  requests.forEach(req => {
    if (req.responses && req.responses.length > 0) {
      const firstResponse = req.responses.sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime())[0];
      
      const hours = (firstResponse.createdAt.getTime() - req.createdAt.getTime()) / (1000 * 60 * 60);
      responseTimes.push(hours);
    }
  });
  
  const avgResponseTime = responseTimes.length 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;
  
  return {
    total,
    pending,
    analyzed,
    completed,
    byType,
    avgResponseTime: avgResponseTime.toFixed(1),
    completionRate: total ? ((completed / total) * 100).toFixed(1) + '%' : '0%'
  };
} 