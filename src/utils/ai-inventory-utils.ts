// Tipos de dados para IA Estoque
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number;
  expirationDate?: Date;
  location?: string;
  consumptionHistory?: ConsumptionData[];
  aiPrediction?: InventoryPrediction;
}

export interface ConsumptionData {
  date: Date;
  quantity: number;
  reason?: string;
}

export interface InventoryPrediction {
  estimatedDailyConsumption: number;
  estimatedWeeklyConsumption: number;
  estimatedMonthlyConsumption: number;
  daysUntilStockout: number;
  recommendedPurchase: number;
  seasonalTrend?: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  recommendationNotes?: string[];
}

export interface PurchaseRecommendation {
  item: InventoryItem;
  quantityToOrder: number;
  urgency: 'baixa' | 'média' | 'alta' | 'crítica';
  estimatedCost: number;
  justification: string;
}

export interface InventoryReport {
  totalItems: number;
  itemsBeforeMin: number;
  itemsExpiringSoon: number;
  excessiveStock: number;
  totalValue: number;
  categorySummary: Record<string, {count: number, value: number}>;
  recommendations: PurchaseRecommendation[];
}

/**
 * Analisa o histórico de consumo e faz previsões para o item de estoque
 * @param item Item de estoque a ser analisado
 * @returns Previsão de consumo e recomendações
 */
export function analyzeInventoryItem(item: InventoryItem): Promise<InventoryPrediction> {
  return new Promise((resolve) => {
    // Verifica se há histórico de consumo
    if (!item.consumptionHistory || item.consumptionHistory.length === 0) {
      // Sem histórico, gera previsão básica
      const basicPrediction: InventoryPrediction = {
        estimatedDailyConsumption: item.minStock / 30, // Estimativa baseada no estoque mínimo
        estimatedWeeklyConsumption: (item.minStock / 30) * 7,
        estimatedMonthlyConsumption: item.minStock,
        daysUntilStockout: item.currentStock / (item.minStock / 30),
        recommendedPurchase: item.currentStock < item.minStock ? item.maxStock - item.currentStock : 0,
        confidence: 0.6, // Confiança baixa sem histórico
        recommendationNotes: ['Previsão com baixa confiança devido à falta de histórico de consumo']
      };
      
      setTimeout(() => resolve(basicPrediction), 500 + Math.random() * 500);
      return;
    }
    
    // Ordena histórico por data
    const sortedHistory = [...item.consumptionHistory].sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );
    
    // Calcula consumo médio diário, semanal e mensal
    const totalConsumed = sortedHistory.reduce((sum, record) => sum + record.quantity, 0);
    const firstDate = sortedHistory[0].date;
    const lastDate = sortedHistory[sortedHistory.length - 1].date;
    const totalDays = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyAvg = totalConsumed / totalDays;
    const weeklyAvg = dailyAvg * 7;
    const monthlyAvg = dailyAvg * 30;
    
    // Verifica tendência sazonal (últimos 30% do histórico vs. primeiros 30%)
    let seasonalTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (sortedHistory.length >= 10) {
      const cutoffIndex = Math.floor(sortedHistory.length * 0.3);
      const firstSegment = sortedHistory.slice(0, cutoffIndex);
      const lastSegment = sortedHistory.slice(-cutoffIndex);
      
      const firstSegmentAvg = firstSegment.reduce((sum, record) => sum + record.quantity, 0) / firstSegment.length;
      const lastSegmentAvg = lastSegment.reduce((sum, record) => sum + record.quantity, 0) / lastSegment.length;
      
      const changePercent = ((lastSegmentAvg - firstSegmentAvg) / firstSegmentAvg) * 100;
      
      if (changePercent > 15) {
        seasonalTrend = 'increasing';
      } else if (changePercent < -15) {
        seasonalTrend = 'decreasing';
      }
    }
    
    // Ajusta previsão com base na tendência
    let adjustedDailyConsumption = dailyAvg;
    if (seasonalTrend === 'increasing') {
      adjustedDailyConsumption *= 1.2; // Aumenta em 20%
    } else if (seasonalTrend === 'decreasing') {
      adjustedDailyConsumption *= 0.9; // Reduz em 10%
    }
    
    // Calcula dias até esgotamento do estoque
    const daysUntilStockout = Math.floor(item.currentStock / Math.max(0.1, adjustedDailyConsumption));
    
    // Determina quantidade recomendada para compra
    let recommendedPurchase = 0;
    const recommendationNotes: string[] = [];
    
    if (item.currentStock < item.minStock) {
      // Estoque abaixo do mínimo, recomendar compra imediata
      recommendedPurchase = item.maxStock - item.currentStock;
      recommendationNotes.push('Estoque abaixo do mínimo, recomenda-se reposição imediata');
    } else if (daysUntilStockout < 15) {
      // Estoque acabará em menos de 15 dias
      recommendedPurchase = Math.ceil(adjustedDailyConsumption * 30) - item.currentStock; // Repor para 30 dias
      recommendationNotes.push(`Estoque acabará em aproximadamente ${daysUntilStockout} dias`);
    }
    
    // Verifica se o item está expirando
    if (item.expirationDate) {
      const daysUntilExpiration = Math.floor((item.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiration < 90) {
        recommendationNotes.push(`Atenção: item expira em ${daysUntilExpiration} dias`);
      }
    }
    
    // Calcula nível de confiança com base no tamanho do histórico
    let confidence = 0.7;
    if (sortedHistory.length > 20) {
      confidence = 0.9;
    } else if (sortedHistory.length > 10) {
      confidence = 0.8;
    }
    
    // Constrói o objeto de previsão
    const prediction: InventoryPrediction = {
      estimatedDailyConsumption: adjustedDailyConsumption,
      estimatedWeeklyConsumption: adjustedDailyConsumption * 7,
      estimatedMonthlyConsumption: adjustedDailyConsumption * 30,
      daysUntilStockout,
      recommendedPurchase: Math.max(0, recommendedPurchase),
      seasonalTrend,
      confidence,
      recommendationNotes: recommendationNotes.length > 0 ? recommendationNotes : undefined
    };
    
    // Simula tempo de processamento (0.8-1.5s)
    setTimeout(() => resolve(prediction), 800 + Math.random() * 700);
  });
}

/**
 * Gera recomendações de compra para uma lista de itens de estoque
 * @param items Lista de itens do estoque
 * @returns Lista de recomendações de compra
 */
export function generatePurchaseRecommendations(items: InventoryItem[]): Promise<PurchaseRecommendation[]> {
  return new Promise((resolve) => {
    // Filtra itens que precisam de reposição
    const itemsNeedingRestock = items.filter(item => {
      // Se já tem previsão da IA, usa recomendação
      if (item.aiPrediction && item.aiPrediction.recommendedPurchase > 0) {
        return true;
      }
      
      // Caso contrário, verifica estoque mínimo
      return item.currentStock < item.minStock;
    });
    
    // Gera recomendações para cada item
    const recommendations: PurchaseRecommendation[] = itemsNeedingRestock.map(item => {
      // Determina quantidade a pedir
      const quantityToOrder = item.aiPrediction
        ? item.aiPrediction.recommendedPurchase
        : item.maxStock - item.currentStock;
      
      // Determina urgência
      let urgency: 'baixa' | 'média' | 'alta' | 'crítica' = 'média';
      
      if (item.currentStock === 0) {
        urgency = 'crítica';
      } else if (item.currentStock < item.minStock * 0.3) {
        urgency = 'alta';
      } else if (item.currentStock < item.minStock) {
        urgency = 'média';
      } else {
        urgency = 'baixa';
      }
      
      // Se há previsão da IA, ajusta urgência com base nos dias até esgotamento
      if (item.aiPrediction) {
        if (item.aiPrediction.daysUntilStockout < 7) {
          urgency = 'alta';
        } else if (item.aiPrediction.daysUntilStockout < 15) {
          urgency = 'média';
        }
      }
      
      // Calcula custo estimado
      const estimatedCost = quantityToOrder * item.price;
      
      // Gera justificativa
      let justification = '';
      if (urgency === 'crítica') {
        justification = `Estoque zerado. Item crítico para operações.`;
      } else if (urgency === 'alta') {
        justification = `Estoque crítico (${item.currentStock} ${item.unit}). Reposição urgente necessária.`;
      } else if (item.aiPrediction) {
        justification = `Previsão de esgotamento em ${item.aiPrediction.daysUntilStockout} dias com base no consumo histórico.`;
      } else {
        justification = `Estoque abaixo do mínimo estabelecido (${item.minStock} ${item.unit}).`;
      }
      
      return {
        item,
        quantityToOrder,
        urgency,
        estimatedCost,
        justification
      };
    });
    
    // Ordena por urgência
    recommendations.sort((a, b) => {
      const urgencyRank = {
        'crítica': 4,
        'alta': 3,
        'média': 2,
        'baixa': 1
      };
      
      return urgencyRank[b.urgency] - urgencyRank[a.urgency];
    });
    
    // Simula tempo de processamento (1-2s)
    setTimeout(() => resolve(recommendations), 1000 + Math.random() * 1000);
  });
}

/**
 * Gera um relatório completo de análise de estoque
 * @param items Lista de itens do estoque
 * @returns Relatório de estoque
 */
export function generateInventoryReport(items: InventoryItem[]): Promise<InventoryReport> {
  return new Promise(async (resolve) => {
    // Gerar recomendações de compra
    const recommendations = await generatePurchaseRecommendations(items);
    
    // Calcular estatísticas gerais
    const totalItems = items.length;
    const itemsBeforeMin = items.filter(item => item.currentStock < item.minStock).length;
    
    // Itens expirando nos próximos 90 dias
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const itemsExpiringSoon = items.filter(item => 
      item.expirationDate && item.expirationDate <= ninetyDaysFromNow
    ).length;
    
    // Itens com estoque excessivo (acima de 150% do máximo)
    const excessiveStock = items.filter(item => 
      item.currentStock > item.maxStock * 1.5
    ).length;
    
    // Valor total do estoque
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.currentStock), 0);
    
    // Resumo por categoria
    const categorySummary: Record<string, {count: number, value: number}> = {};
    items.forEach(item => {
      if (!categorySummary[item.category]) {
        categorySummary[item.category] = { count: 0, value: 0 };
      }
      
      categorySummary[item.category].count++;
      categorySummary[item.category].value += item.price * item.currentStock;
    });
    
    // Montar relatório
    const report: InventoryReport = {
      totalItems,
      itemsBeforeMin,
      itemsExpiringSoon,
      excessiveStock,
      totalValue,
      categorySummary,
      recommendations
    };
    
    // Simular tempo de processamento (1.5-3s)
    setTimeout(() => resolve(report), 1500 + Math.random() * 1500);
  });
}

/**
 * Obtém a classe CSS para o nível de urgência
 */
export function getUrgencyClass(urgency: 'baixa' | 'média' | 'alta' | 'crítica'): string {
  switch (urgency) {
    case 'baixa':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'média':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'alta':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'crítica':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Obtém a classe CSS para o nível de estoque
 */
export function getStockLevelClass(currentStock: number, minStock: number, maxStock: number): string {
  if (currentStock === 0) {
    return 'bg-red-100 text-red-800 border-red-300';
  } else if (currentStock < minStock * 0.5) {
    return 'bg-orange-100 text-orange-800 border-orange-300';
  } else if (currentStock < minStock) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  } else if (currentStock > maxStock * 1.5) {
    return 'bg-purple-100 text-purple-800 border-purple-300';
  } else if (currentStock > maxStock) {
    return 'bg-blue-100 text-blue-800 border-blue-300';
  } else {
    return 'bg-green-100 text-green-800 border-green-300';
  }
} 