
import { Product, StockEntry, StockTransaction } from '@/types';
import ConfigService from './ConfigService';

export interface StockMovement {
  id: string;
  productId: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  date: string;
  batchNumber?: string;
  expiryDate?: string;
  rate: number;
  reason?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  alertType: 'low_stock' | 'expiry_warning' | 'negative_stock';
  currentStock: number;
  threshold?: number;
  expiryDate?: string;
  message: string;
  createdAt: string;
}

class StockService {
  private static instance: StockService;
  private movements: StockMovement[] = [];
  private alerts: StockAlert[] = [];
  private config = ConfigService.getInstance();

  private constructor() {
    this.loadData();
  }

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }

  private loadData(): void {
    const savedMovements = localStorage.getItem('stock_movements');
    const savedAlerts = localStorage.getItem('stock_alerts');

    if (savedMovements) {
      try {
        this.movements = JSON.parse(savedMovements);
      } catch (error) {
        console.error('Error loading stock movements:', error);
      }
    }

    if (savedAlerts) {
      try {
        this.alerts = JSON.parse(savedAlerts);
      } catch (error) {
        console.error('Error loading stock alerts:', error);
      }
    }
  }

  private saveData(): void {
    localStorage.setItem('stock_movements', JSON.stringify(this.movements));
    localStorage.setItem('stock_alerts', JSON.stringify(this.alerts));
  }

  // FIFO Logic Implementation
  calculateFIFOCost(productId: string, quantityToConsume: number): number {
    const inboundMovements = this.movements
      .filter(m => m.productId === productId && m.movementType === 'in')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let remainingQuantity = quantityToConsume;
    let totalCost = 0;

    for (const movement of inboundMovements) {
      if (remainingQuantity <= 0) break;

      const availableQuantity = Math.min(movement.quantity, remainingQuantity);
      totalCost += availableQuantity * movement.rate;
      remainingQuantity -= availableQuantity;
    }

    return totalCost;
  }

  // Get current stock for a product
  getCurrentStock(productId: string): number {
    return this.movements
      .filter(m => m.productId === productId)
      .reduce((total, movement) => {
        return movement.movementType === 'in' 
          ? total + movement.quantity 
          : total - movement.quantity;
      }, 0);
  }

  // Record stock movement
  recordMovement(movement: Omit<StockMovement, 'id'>): string {
    const newMovement: StockMovement = {
      ...movement,
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.movements.push(newMovement);
    this.checkStockAlerts(movement.productId);
    this.saveData();

    return newMovement.id;
  }

  // Check and generate alerts
  private checkStockAlerts(productId: string): void {
    const currentStock = this.getCurrentStock(productId);
    const threshold = this.config.getConfig().stockSettings.lowStockThreshold;

    // Remove existing alerts for this product
    this.alerts = this.alerts.filter(alert => alert.productId !== productId);

    // Low stock alert
    if (currentStock <= threshold) {
      this.alerts.push({
        id: `alert_${Date.now()}`,
        productId,
        productName: '', // Will be filled by calling component
        alertType: 'low_stock',
        currentStock,
        threshold,
        message: `Stock is low (${currentStock} units remaining)`,
        createdAt: new Date().toISOString()
      });
    }

    // Negative stock alert
    if (currentStock < 0) {
      this.alerts.push({
        id: `alert_${Date.now()}_neg`,
        productId,
        productName: '',
        alertType: 'negative_stock',
        currentStock,
        message: `Negative stock detected (${currentStock} units)`,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Get all active alerts
  getActiveAlerts(): StockAlert[] {
    return this.alerts.filter(alert => {
      const alertDate = new Date(alert.createdAt);
      const now = new Date();
      const daysDiff = (now.getTime() - alertDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7; // Show alerts for 7 days
    });
  }

  // Get stock movements for a product
  getProductMovements(productId: string, limit?: number): StockMovement[] {
    const movements = this.movements
      .filter(m => m.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return limit ? movements.slice(0, limit) : movements;
  }

  // Stock adjustment
  performStockAdjustment(productId: string, adjustmentQuantity: number, reason: string): void {
    this.recordMovement({
      productId,
      movementType: 'adjustment',
      quantity: Math.abs(adjustmentQuantity),
      date: new Date().toISOString(),
      rate: 0,
      reason
    });
  }

  // Clear old alerts
  clearOldAlerts(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    this.alerts = this.alerts.filter(alert => 
      new Date(alert.createdAt) > cutoffDate
    );
    this.saveData();
  }
}

export default StockService;
