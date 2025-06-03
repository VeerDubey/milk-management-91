
export interface DemandPrediction {
  productId: string;
  predictedQuantity: number;
  confidence: number;
  factors: string[];
  dateRange: { start: string; end: string };
}

export interface SupplyAlert {
  id: string;
  type: 'low_stock' | 'high_demand' | 'supplier_delay';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  productId?: string;
  supplierId?: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedQuantity: number;
  estimatedCost: number;
  urgency: 'low' | 'medium' | 'high';
  reasoning: string[];
}

export class PredictiveAnalyticsService {
  private static readonly SEASONAL_FACTORS = {
    summer: { milk: 0.8, icecream: 1.5, yogurt: 1.2 },
    monsoon: { milk: 1.1, icecream: 0.7, yogurt: 0.9 },
    winter: { milk: 1.2, icecream: 0.6, yogurt: 1.1 },
    festival: { milk: 1.3, sweets: 2.0, ghee: 1.8 }
  };

  static async predictDailyDemand(productId: string, days: number = 7): Promise<DemandPrediction[]> {
    try {
      // Get historical data
      const historicalOrders = await this.getHistoricalOrders(productId, 90); // Last 90 days
      
      if (historicalOrders.length < 7) {
        throw new Error('Insufficient historical data for prediction');
      }

      const predictions: DemandPrediction[] = [];
      
      for (let i = 0; i < days; i++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i + 1);
        
        const prediction = this.calculateDemandPrediction(
          historicalOrders,
          targetDate,
          productId
        );
        
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting demand:', error);
      return [];
    }
  }

  private static calculateDemandPrediction(
    historicalData: any[],
    targetDate: Date,
    productId: string
  ): DemandPrediction {
    // Simple moving average with seasonal adjustments
    const dayOfWeek = targetDate.getDay();
    const month = targetDate.getMonth();
    
    // Calculate base demand from historical data
    const recentData = historicalData.slice(-21); // Last 3 weeks
    const baseDemand = recentData.reduce((sum, order) => {
      const item = order.items.find((i: any) => i.productId === productId);
      return sum + (item ? item.quantity : 0);
    }, 0) / recentData.length;

    // Apply day-of-week factor
    const dayFactors = [0.8, 1.0, 1.1, 1.1, 1.2, 1.3, 1.0]; // Sun-Sat
    let adjustedDemand = baseDemand * dayFactors[dayOfWeek];

    // Apply seasonal factors
    const season = this.getSeason(month);
    const productType = this.getProductType(productId);
    const seasonalFactor = this.SEASONAL_FACTORS[season]?.[productType] || 1.0;
    adjustedDemand *= seasonalFactor;

    // Add some randomness for confidence calculation
    const variance = this.calculateVariance(historicalData, productId);
    const confidence = Math.max(0.3, 1 - (variance / adjustedDemand));

    return {
      productId,
      predictedQuantity: Math.round(adjustedDemand),
      confidence: Math.round(confidence * 100) / 100,
      factors: this.getInfluencingFactors(dayOfWeek, season, month),
      dateRange: {
        start: targetDate.toISOString().split('T')[0],
        end: targetDate.toISOString().split('T')[0]
      }
    };
  }

  private static getSeason(month: number): keyof typeof PredictiveAnalyticsService.SEASONAL_FACTORS {
    if (month >= 3 && month <= 5) return 'summer';
    if (month >= 6 && month <= 9) return 'monsoon';
    return 'winter';
  }

  private static getProductType(productId: string): string {
    // Simple product categorization - in a real app, this would come from product data
    return 'milk'; // Default
  }

  private static calculateVariance(data: any[], productId: string): number {
    const quantities = data.map(order => {
      const item = order.items.find((i: any) => i.productId === productId);
      return item ? item.quantity : 0;
    });

    const mean = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
    const variance = quantities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / quantities.length;
    
    return Math.sqrt(variance);
  }

  private static getInfluencingFactors(dayOfWeek: number, season: string, month: number): string[] {
    const factors = [];
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      factors.push('Weekend effect');
    }
    
    factors.push(`${season} seasonal pattern`);
    
    if (month === 10 || month === 11) {
      factors.push('Festival season');
    }
    
    return factors;
  }

  private static async getHistoricalOrders(productId: string, days: number): Promise<any[]> {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [];
  }

  static async generateSupplyAlerts(): Promise<SupplyAlert[]> {
    const alerts: SupplyAlert[] = [];
    
    // Check low stock levels
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    for (const product of products) {
      if (product.stock <= (product.minStock || 10)) {
        alerts.push({
          id: `alert_${Date.now()}_${product.id}`,
          type: 'low_stock',
          severity: product.stock === 0 ? 'critical' : 'high',
          message: `Low stock for ${product.name}: ${product.stock} units remaining`,
          productId: product.id,
          timestamp: new Date().toISOString(),
          actionRequired: true
        });
      }
    }

    return alerts;
  }

  static async generateReorderSuggestions(): Promise<ReorderSuggestion[]> {
    const suggestions: ReorderSuggestion[] = [];
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    for (const product of products) {
      if (product.stock <= (product.minStock || 10)) {
        const predictions = await this.predictDailyDemand(product.id, 7);
        const totalPredictedDemand = predictions.reduce((sum, p) => sum + p.predictedQuantity, 0);
        
        const suggestedQuantity = Math.max(
          totalPredictedDemand * 1.2, // 20% buffer
          (product.minStock || 10) * 2
        );

        suggestions.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          suggestedQuantity: Math.round(suggestedQuantity),
          estimatedCost: suggestedQuantity * (product.costPrice || product.price * 0.7),
          urgency: product.stock === 0 ? 'high' : 'medium',
          reasoning: [
            `Current stock: ${product.stock}`,
            `Predicted 7-day demand: ${totalPredictedDemand}`,
            `Recommended safety buffer: 20%`
          ]
        });
      }
    }

    return suggestions;
  }
}
