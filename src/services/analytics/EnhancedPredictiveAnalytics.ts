
import { db } from '../database/OfflineDatabase';
import { toast } from 'sonner';

export interface DemandPrediction {
  productId: string;
  productName: string;
  predictedQuantity: number;
  confidence: number;
  factors: string[];
  dateRange: { start: string; end: string };
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalImpact: number;
  weatherImpact?: number;
}

export interface SupplyAlert {
  id: string;
  type: 'low_stock' | 'high_demand' | 'supplier_delay' | 'quality_issue' | 'price_increase';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  productId?: string;
  supplierId?: string;
  timestamp: string;
  actionRequired: boolean;
  estimatedImpact: string;
  recommendedAction: string;
}

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedQuantity: number;
  estimatedCost: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string[];
  supplierRecommendation?: string;
  deliveryDate: string;
  bufferDays: number;
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'monsoon' | 'winter';
  festivals: string[];
  demandMultiplier: number;
  peakDays: string[];
}

export interface WeatherImpact {
  temperature: number;
  humidity: number;
  rainfall: number;
  demandAdjustment: number;
}

export class EnhancedPredictiveAnalyticsService {
  private static readonly SEASONAL_PATTERNS: Record<string, SeasonalPattern> = {
    spring: {
      season: 'spring',
      festivals: ['Holi', 'Ram Navami'],
      demandMultiplier: 1.1,
      peakDays: ['friday', 'saturday', 'sunday']
    },
    summer: {
      season: 'summer',
      festivals: ['Akshaya Tritiya'],
      demandMultiplier: 0.9,
      peakDays: ['saturday', 'sunday']
    },
    monsoon: {
      season: 'monsoon',
      festivals: ['Raksha Bandhan', 'Janmashtami'],
      demandMultiplier: 1.2,
      peakDays: ['saturday', 'sunday', 'monday']
    },
    winter: {
      season: 'winter',
      festivals: ['Diwali', 'Christmas', 'New Year'],
      demandMultiplier: 1.4,
      peakDays: ['friday', 'saturday', 'sunday']
    }
  };

  private static readonly PRODUCT_FACTORS = {
    milk: { 
      baseMultiplier: 1.0, 
      weatherSensitivity: 0.3, 
      festivalImpact: 1.2,
      shelfLife: 2,
      category: 'dairy_fresh'
    },
    yogurt: { 
      baseMultiplier: 0.8, 
      weatherSensitivity: 0.4, 
      festivalImpact: 1.1,
      shelfLife: 5,
      category: 'dairy_fresh'
    },
    cheese: { 
      baseMultiplier: 0.6, 
      weatherSensitivity: 0.2, 
      festivalImpact: 1.3,
      shelfLife: 14,
      category: 'dairy_processed'
    },
    ice_cream: { 
      baseMultiplier: 0.4, 
      weatherSensitivity: 0.8, 
      festivalImpact: 1.5,
      shelfLife: 30,
      category: 'dairy_frozen'
    }
  };

  static async predictDailyDemand(productId: string, days: number = 7): Promise<DemandPrediction[]> {
    try {
      const product = await db.products.get(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const historicalOrders = await this.getHistoricalOrders(productId, 90);
      
      if (historicalOrders.length < 14) {
        throw new Error('Insufficient historical data for prediction (minimum 14 days required)');
      }

      const predictions: DemandPrediction[] = [];
      
      for (let i = 0; i < days; i++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i + 1);
        
        const prediction = await this.calculateAdvancedDemandPrediction(
          historicalOrders,
          targetDate,
          product
        );
        
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting demand:', error);
      toast.error(`Prediction failed: ${error.message}`);
      return [];
    }
  }

  private static async calculateAdvancedDemandPrediction(
    historicalData: any[],
    targetDate: Date,
    product: any
  ): Promise<DemandPrediction> {
    const dayOfWeek = targetDate.getDay();
    const month = targetDate.getMonth();
    const season = this.getSeason(month);
    
    // Calculate base demand using multiple methods
    const simpleDemand = this.calculateSimpleMovingAverage(historicalData, product.id, 7);
    const exponentialDemand = this.calculateExponentialMovingAverage(historicalData, product.id);
    const trendDemand = this.calculateTrendAdjustedDemand(historicalData, product.id);
    
    // Weighted average of different prediction methods
    const baseDemand = (simpleDemand * 0.4 + exponentialDemand * 0.4 + trendDemand * 0.2);

    // Apply various factors
    const dayFactor = this.getDayOfWeekFactor(dayOfWeek);
    const seasonalFactor = this.getSeasonalFactor(season, product.name);
    const festivalFactor = await this.getFestivalFactor(targetDate, season);
    const weatherFactor = await this.getWeatherFactor(targetDate, product.name);
    
    // Calculate final prediction
    let predictedQuantity = baseDemand * dayFactor * seasonalFactor * festivalFactor * weatherFactor;
    
    // Apply product-specific adjustments
    const productFactor = this.getProductFactor(product.name);
    predictedQuantity *= productFactor.baseMultiplier;
    
    // Calculate confidence based on data quality and consistency
    const confidence = this.calculateConfidence(historicalData, product.id, predictedQuantity);
    
    // Determine trend
    const trend = this.calculateTrend(historicalData, product.id);
    
    // Calculate seasonal impact
    const seasonalImpact = (seasonalFactor - 1) * 100;

    return {
      productId: product.id,
      productName: product.name,
      predictedQuantity: Math.round(predictedQuantity),
      confidence: Math.round(confidence * 100) / 100,
      factors: this.getInfluencingFactors(dayOfWeek, season, month, festivalFactor > 1, weatherFactor),
      dateRange: {
        start: targetDate.toISOString().split('T')[0],
        end: targetDate.toISOString().split('T')[0]
      },
      trend,
      seasonalImpact: Math.round(seasonalImpact * 100) / 100,
      weatherImpact: Math.round((weatherFactor - 1) * 100 * 100) / 100
    };
  }

  private static calculateSimpleMovingAverage(data: any[], productId: string, days: number): number {
    const recentData = data.slice(-days);
    const total = recentData.reduce((sum, order) => {
      const item = order.items.find((i: any) => i.productId === productId);
      return sum + (item ? item.quantity : 0);
    }, 0);
    return total / days;
  }

  private static calculateExponentialMovingAverage(data: any[], productId: string, alpha: number = 0.3): number {
    let ema = 0;
    for (let i = 0; i < data.length; i++) {
      const item = data[i].items.find((i: any) => i.productId === productId);
      const quantity = item ? item.quantity : 0;
      ema = i === 0 ? quantity : alpha * quantity + (1 - alpha) * ema;
    }
    return ema;
  }

  private static calculateTrendAdjustedDemand(data: any[], productId: string): number {
    const recentData = data.slice(-14); // Last 2 weeks
    const oldData = data.slice(-28, -14); // Previous 2 weeks
    
    const recentAvg = this.calculateSimpleMovingAverage(recentData, productId, 14);
    const oldAvg = this.calculateSimpleMovingAverage(oldData, productId, 14);
    
    const trendFactor = recentAvg / (oldAvg || 1);
    return recentAvg * trendFactor;
  }

  private static getDayOfWeekFactor(dayOfWeek: number): number {
    // 0 = Sunday, 6 = Saturday
    const factors = [1.2, 0.8, 0.9, 0.9, 1.0, 1.3, 1.4]; // Sun-Sat
    return factors[dayOfWeek] || 1.0;
  }

  private static getSeason(month: number): keyof typeof EnhancedPredictiveAnalyticsService.SEASONAL_PATTERNS {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 6) return 'summer';
    if (month >= 7 && month <= 9) return 'monsoon';
    return 'winter';
  }

  private static getSeasonalFactor(season: string, productName: string): number {
    const seasonalPattern = this.SEASONAL_PATTERNS[season];
    if (!seasonalPattern) return 1.0;
    
    let factor = seasonalPattern.demandMultiplier;
    
    // Product-specific seasonal adjustments
    if (productName.toLowerCase().includes('ice cream') && season === 'summer') {
      factor *= 1.5;
    } else if (productName.toLowerCase().includes('milk') && season === 'winter') {
      factor *= 1.2;
    }
    
    return factor;
  }

  private static async getFestivalFactor(date: Date, season: string): Promise<number> {
    const seasonalPattern = this.SEASONAL_PATTERNS[season];
    if (!seasonalPattern) return 1.0;
    
    // Check if date is near any festival (simplified check)
    const month = date.getMonth();
    const day = date.getDate();
    
    // Major Indian festivals and their impact
    const festivals = [
      { month: 2, day: 14, impact: 1.3 }, // Holi
      { month: 3, day: 15, impact: 1.2 }, // Ram Navami (varies)
      { month: 7, day: 15, impact: 1.4 }, // Raksha Bandhan (varies)
      { month: 8, day: 15, impact: 1.5 }, // Janmashtami (varies)
      { month: 10, day: 20, impact: 1.8 }, // Diwali (varies)
      { month: 11, day: 25, impact: 1.3 }, // Christmas
      { month: 11, day: 31, impact: 1.2 }  // New Year
    ];
    
    for (const festival of festivals) {
      const daysDiff = Math.abs((month * 30 + day) - (festival.month * 30 + festival.day));
      if (daysDiff <= 2) { // Within 2 days of festival
        return festival.impact;
      }
    }
    
    return 1.0;
  }

  private static async getWeatherFactor(date: Date, productName: string): Promise<number> {
    // Simulated weather impact - in real implementation, integrate with weather API
    const productFactor = this.getProductFactor(productName);
    const baseWeatherImpact = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    
    return 1 + (baseWeatherImpact - 1) * productFactor.weatherSensitivity;
  }

  private static getProductFactor(productName: string): any {
    const name = productName.toLowerCase();
    if (name.includes('milk')) return this.PRODUCT_FACTORS.milk;
    if (name.includes('yogurt') || name.includes('curd')) return this.PRODUCT_FACTORS.yogurt;
    if (name.includes('cheese')) return this.PRODUCT_FACTORS.cheese;
    if (name.includes('ice cream')) return this.PRODUCT_FACTORS.ice_cream;
    return this.PRODUCT_FACTORS.milk; // Default
  }

  private static calculateConfidence(data: any[], productId: string, prediction: number): number {
    const quantities = data.map(order => {
      const item = order.items.find((i: any) => i.productId === productId);
      return item ? item.quantity : 0;
    });

    if (quantities.length === 0) return 0.3;

    const mean = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
    const variance = quantities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / quantities.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Confidence decreases with higher variance and difference from historical average
    const varianceConfidence = Math.max(0.1, 1 - (standardDeviation / mean));
    const predictionConfidence = Math.max(0.1, 1 - Math.abs(prediction - mean) / mean);
    const dataQualityConfidence = Math.min(1, quantities.length / 30); // More data = higher confidence
    
    return (varianceConfidence + predictionConfidence + dataQualityConfidence) / 3;
  }

  private static calculateTrend(data: any[], productId: string): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 14) return 'stable';
    
    const recentWeek = data.slice(-7);
    const previousWeek = data.slice(-14, -7);
    
    const recentAvg = this.calculateSimpleMovingAverage(recentWeek, productId, 7);
    const previousAvg = this.calculateSimpleMovingAverage(previousWeek, productId, 7);
    
    const change = (recentAvg - previousAvg) / previousAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private static getInfluencingFactors(
    dayOfWeek: number, 
    season: string, 
    month: number, 
    isFestival: boolean,
    weatherFactor: number
  ): string[] {
    const factors = [];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    factors.push(`${dayNames[dayOfWeek]} demand pattern`);
    
    factors.push(`${season} seasonal effect`);
    
    if (isFestival) {
      factors.push('Festival period increase');
    }
    
    if (weatherFactor > 1.05) {
      factors.push('Favorable weather conditions');
    } else if (weatherFactor < 0.95) {
      factors.push('Adverse weather impact');
    }
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      factors.push('Weekend consumption boost');
    }
    
    return factors;
  }

  private static async getHistoricalOrders(productId: string, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.orders
      .where('date')
      .above(startDate.toISOString())
      .and(order => order.items.some((item: any) => item.productId === productId))
      .toArray();
  }

  static async generateAdvancedSupplyAlerts(): Promise<SupplyAlert[]> {
    const alerts: SupplyAlert[] = [];
    const products = await db.products.toArray();
    
    for (const product of products) {
      // Check current stock levels
      const currentStock = product.stock || 0;
      const minStock = product.minStock || 10;
      const maxStock = product.maxStock || 100;
      
      // Get predictions for next 3 days
      const predictions = await this.predictDailyDemand(product.id, 3);
      const totalPredictedDemand = predictions.reduce((sum, p) => sum + p.predictedQuantity, 0);
      
      // Low stock alert
      if (currentStock <= minStock) {
        alerts.push({
          id: `alert_low_stock_${product.id}_${Date.now()}`,
          type: 'low_stock',
          severity: currentStock === 0 ? 'critical' : currentStock <= minStock * 0.5 ? 'high' : 'medium',
          message: `Low stock for ${product.name}: ${currentStock} units remaining`,
          productId: product.id,
          timestamp: new Date().toISOString(),
          actionRequired: true,
          estimatedImpact: `Potential stockout in ${Math.floor(currentStock / (totalPredictedDemand / 3))} days`,
          recommendedAction: `Order ${Math.max(maxStock - currentStock, totalPredictedDemand * 2)} units immediately`
        });
      }
      
      // High demand alert
      const avgPrediction = predictions.reduce((sum, p) => sum + p.predictedQuantity, 0) / predictions.length;
      const historicalAvg = await this.getHistoricalAverage(product.id, 30);
      
      if (avgPrediction > historicalAvg * 1.5) {
        alerts.push({
          id: `alert_high_demand_${product.id}_${Date.now()}`,
          type: 'high_demand',
          severity: avgPrediction > historicalAvg * 2 ? 'high' : 'medium',
          message: `Unusually high demand predicted for ${product.name}: ${Math.round(avgPrediction)} units/day`,
          productId: product.id,
          timestamp: new Date().toISOString(),
          actionRequired: true,
          estimatedImpact: `${Math.round((avgPrediction / historicalAvg - 1) * 100)}% increase over normal demand`,
          recommendedAction: `Increase order quantity by ${Math.round((avgPrediction - historicalAvg) * 7)} units for next week`
        });
      }
      
      // Quality/shelf life alerts
      const productFactor = this.getProductFactor(product.name);
      const daysUntilExpiry = productFactor.shelfLife;
      
      if (currentStock > totalPredictedDemand && daysUntilExpiry <= 3) {
        alerts.push({
          id: `alert_quality_${product.id}_${Date.now()}`,
          type: 'quality_issue',
          severity: 'medium',
          message: `${product.name} may expire before consumption: ${currentStock} units, ${daysUntilExpiry} days shelf life`,
          productId: product.id,
          timestamp: new Date().toISOString(),
          actionRequired: true,
          estimatedImpact: `Potential waste of ${Math.max(0, currentStock - totalPredictedDemand)} units`,
          recommendedAction: 'Consider promotional pricing or alternative sales channels'
        });
      }
    }

    return alerts;
  }

  private static async getHistoricalAverage(productId: string, days: number): Promise<number> {
    const orders = await this.getHistoricalOrders(productId, days);
    return this.calculateSimpleMovingAverage(orders, productId, orders.length);
  }

  static async generateEnhancedReorderSuggestions(): Promise<ReorderSuggestion[]> {
    const suggestions: ReorderSuggestion[] = [];
    const products = await db.products.toArray();
    
    for (const product of products) {
      const currentStock = product.stock || 0;
      const minStock = product.minStock || 10;
      
      if (currentStock <= minStock * 1.5) { // Trigger reorder before hitting minimum
        const predictions = await this.predictDailyDemand(product.id, 14); // 2 weeks ahead
        const totalPredictedDemand = predictions.reduce((sum, p) => sum + p.predictedQuantity, 0);
        
        const productFactor = this.getProductFactor(product.name);
        const bufferDays = Math.max(3, productFactor.shelfLife * 0.2); // Buffer based on shelf life
        const bufferStock = (totalPredictedDemand / 14) * bufferDays;
        
        const suggestedQuantity = Math.round(totalPredictedDemand + bufferStock - currentStock);
        
        if (suggestedQuantity > 0) {
          const urgency = this.calculateUrgency(currentStock, minStock, totalPredictedDemand / 14);
          
          suggestions.push({
            productId: product.id,
            productName: product.name,
            currentStock,
            suggestedQuantity,
            estimatedCost: suggestedQuantity * (product.costPrice || product.price * 0.7),
            urgency,
            reasoning: [
              `Current stock: ${currentStock} units`,
              `Predicted 14-day demand: ${Math.round(totalPredictedDemand)} units`,
              `Safety buffer: ${Math.round(bufferStock)} units (${bufferDays} days)`,
              `Average daily consumption: ${Math.round(totalPredictedDemand / 14)} units`,
              `Lead time consideration: ${productFactor.shelfLife} days shelf life`
            ],
            supplierRecommendation: product.supplierId || 'Default Supplier',
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days
            bufferDays: Math.round(bufferDays)
          });
        }
      }
    }

    return suggestions.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  private static calculateUrgency(
    currentStock: number, 
    minStock: number, 
    dailyConsumption: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const daysUntilStockout = currentStock / dailyConsumption;
    
    if (daysUntilStockout <= 1) return 'critical';
    if (daysUntilStockout <= 3) return 'high';
    if (daysUntilStockout <= 7) return 'medium';
    return 'low';
  }

  static async initializePredictiveAnalytics(): Promise<void> {
    console.log('Initializing Enhanced Predictive Analytics Service...');
    
    // Set up periodic analysis
    setInterval(async () => {
      try {
        await this.processRecurringAnalysis();
      } catch (error) {
        console.error('Error in recurring analysis:', error);
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours
    
    toast.success('Predictive analytics initialized');
  }

  private static async processRecurringAnalysis(): Promise<void> {
    const alerts = await this.generateAdvancedSupplyAlerts();
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    
    if (criticalAlerts.length > 0) {
      toast.error(`${criticalAlerts.length} critical supply alerts detected!`);
    }
    
    // Store alerts for dashboard display
    localStorage.setItem('supply_alerts', JSON.stringify(alerts));
    localStorage.setItem('last_analysis', new Date().toISOString());
  }
}
