
import { Customer, Product, Order, Payment } from '@/types';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

export interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalPayments: number;
  outstandingAmount: number;
  profitMargin: number;
  cashFlow: Array<{
    date: string;
    income: number;
    expenses: number;
    netFlow: number;
  }>;
  ageingAnalysis: {
    current: number;
    days30: number;
    days60: number;
    days90Plus: number;
  };
}

export interface InventoryReport {
  totalStockValue: number;
  lowStockItems: number;
  expiringItems: number;
  stockTurnover: number;
  brandWiseStock: Array<{
    brand: string;
    totalValue: number;
    items: number;
  }>;
  movementAnalysis: Array<{
    productId: string;
    productName: string;
    opening: number;
    purchased: number;
    sold: number;
    closing: number;
    turnoverRate: number;
  }>;
}

class ReportingService {
  generateSalesReport(
    customers: Customer[],
    products: Product[],
    orders: Order[],
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): SalesReport {
    const now = new Date();
    const startDate = this.getPeriodStartDate(now, period);
    const endDate = now;
    
    const periodOrders = orders.filter(order => {
      const orderDate = parseISO(order.date);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const totalSales = periodOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const totalOrders = periodOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      period: this.formatPeriod(startDate, endDate),
      totalSales,
      totalOrders,
      averageOrderValue,
      topProducts: this.getTopProducts(periodOrders, products),
      topCustomers: this.getTopCustomers(periodOrders, customers),
      dailyBreakdown: this.getDailyBreakdown(periodOrders)
    };
  }

  generateFinancialReport(
    customers: Customer[],
    orders: Order[],
    payments: Payment[],
    period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): FinancialReport {
    const now = new Date();
    const startDate = this.getPeriodStartDate(now, period);
    const endDate = now;

    const periodOrders = orders.filter(order => {
      const orderDate = parseISO(order.date);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const periodPayments = payments.filter(payment => {
      const paymentDate = parseISO(payment.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    const totalRevenue = periodOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const totalPayments = periodPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingAmount = customers.reduce((sum, customer) => sum + (customer.outstandingBalance || customer.balance || 0), 0);

    return {
      period: this.formatPeriod(startDate, endDate),
      totalRevenue,
      totalPayments,
      outstandingAmount,
      profitMargin: this.calculateProfitMargin(periodOrders),
      cashFlow: this.getCashFlowAnalysis(periodOrders, periodPayments),
      ageingAnalysis: this.getAgeingAnalysis(customers, orders)
    };
  }

  generateInventoryReport(products: Product[]): InventoryReport {
    const totalStockValue = products.reduce((sum, product) => 
      sum + ((product.stock || 0) * product.price), 0
    );

    const lowStockItems = products.filter(product => 
      (product.stock || 0) <= (product.minStock || product.minStockLevel || 10)
    ).length;

    // Since expiryDate doesn't exist in Product type, we'll skip expiring items for now
    const expiringItems = 0;

    return {
      totalStockValue,
      lowStockItems,
      expiringItems,
      stockTurnover: this.calculateStockTurnover(products),
      brandWiseStock: this.getBrandWiseStock(products),
      movementAnalysis: this.getMovementAnalysis(products)
    };
  }

  private getPeriodStartDate(endDate: Date, period: string): Date {
    switch (period) {
      case 'daily':
        return new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      case 'weekly':
        const startOfWeek = new Date(endDate);
        startOfWeek.setDate(endDate.getDate() - endDate.getDay());
        return startOfWeek;
      case 'monthly':
        return startOfMonth(endDate);
      case 'quarterly':
        const quarterStart = new Date(endDate.getFullYear(), Math.floor(endDate.getMonth() / 3) * 3, 1);
        return quarterStart;
      case 'yearly':
        return new Date(endDate.getFullYear(), 0, 1);
      default:
        return startOfMonth(endDate);
    }
  }

  private formatPeriod(startDate: Date, endDate: Date): string {
    return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
  }

  private getTopProducts(orders: Order[], products: Product[]) {
    const productSales = new Map<string, { quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
        productSales.set(item.productId, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.quantity * (item.unitPrice || item.price || 0))
        });
      });
    });

    return Array.from(productSales.entries())
      .map(([productId, stats]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          productName: product?.name || 'Unknown Product',
          quantitySold: stats.quantity,
          revenue: stats.revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private getTopCustomers(orders: Order[], customers: Customer[]) {
    const customerStats = new Map<string, { orders: number; spent: number }>();
    
    orders.forEach(order => {
      if (order.customerId) {
        const existing = customerStats.get(order.customerId) || { orders: 0, spent: 0 };
        customerStats.set(order.customerId, {
          orders: existing.orders + 1,
          spent: existing.spent + (order.totalAmount || order.total || 0)
        });
      }
    });

    return Array.from(customerStats.entries())
      .map(([customerId, stats]) => {
        const customer = customers.find(c => c.id === customerId);
        return {
          customerId,
          customerName: customer?.name || 'Unknown Customer',
          totalOrders: stats.orders,
          totalSpent: stats.spent
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  private getDailyBreakdown(orders: Order[]) {
    const dailyStats = new Map<string, { sales: number; orders: number }>();
    
    orders.forEach(order => {
      const date = order.date.split('T')[0];
      const existing = dailyStats.get(date) || { sales: 0, orders: 0 };
      dailyStats.set(date, {
        sales: existing.sales + (order.totalAmount || order.total || 0),
        orders: existing.orders + 1
      });
    });

    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateProfitMargin(orders: Order[]): number {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const estimatedCost = totalRevenue * 0.7; // Assuming 30% margin
    return totalRevenue > 0 ? ((totalRevenue - estimatedCost) / totalRevenue) * 100 : 0;
  }

  private getCashFlowAnalysis(orders: Order[], payments: Payment[]) {
    const dailyFlow = new Map<string, { income: number; expenses: number }>();
    
    orders.forEach(order => {
      const date = order.date.split('T')[0];
      const existing = dailyFlow.get(date) || { income: 0, expenses: 0 };
      dailyFlow.set(date, {
        ...existing,
        income: existing.income + (order.totalAmount || order.total || 0)
      });
    });

    payments.forEach(payment => {
      const date = payment.date.split('T')[0];
      const existing = dailyFlow.get(date) || { income: 0, expenses: 0 };
      dailyFlow.set(date, {
        ...existing,
        expenses: existing.expenses + payment.amount
      });
    });

    return Array.from(dailyFlow.entries())
      .map(([date, flow]) => ({
        date,
        income: flow.income,
        expenses: flow.expenses,
        netFlow: flow.income - flow.expenses
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getAgeingAnalysis(customers: Customer[], orders: Order[]) {
    const now = new Date();
    let current = 0, days30 = 0, days60 = 0, days90Plus = 0;

    customers.forEach(customer => {
      const customerOrders = orders.filter(o => o.customerId === customer.id);
      const lastOrderDate = customerOrders.length > 0 
        ? parseISO(customerOrders[customerOrders.length - 1].date)
        : null;

      const outstandingBalance = customer.outstandingBalance || customer.balance || 0;
      if (!lastOrderDate || !outstandingBalance) return;

      const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastOrder <= 30) current += outstandingBalance;
      else if (daysSinceLastOrder <= 60) days30 += outstandingBalance;
      else if (daysSinceLastOrder <= 90) days60 += outstandingBalance;
      else days90Plus += outstandingBalance;
    });

    return { current, days30, days60, days90Plus };
  }

  private calculateStockTurnover(products: Product[]): number {
    const totalStockValue = products.reduce((sum, product) => sum + ((product.stock || 0) * product.price), 0);
    const averageStock = totalStockValue / products.length;
    return averageStock > 0 ? totalStockValue / averageStock : 0;
  }

  private getBrandWiseStock(products: Product[]) {
    const brandStats = new Map<string, { totalValue: number; items: number }>();
    
    products.forEach(product => {
      // Use category as brand since brand property doesn't exist
      const brand = product.category || 'Unknown';
      const existing = brandStats.get(brand) || { totalValue: 0, items: 0 };
      brandStats.set(brand, {
        totalValue: existing.totalValue + ((product.stock || 0) * product.price),
        items: existing.items + 1
      });
    });

    return Array.from(brandStats.entries())
      .map(([brand, stats]) => ({ brand, ...stats }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }

  private getMovementAnalysis(products: Product[]) {
    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      opening: (product.stock || 0) + 0, // Estimated opening since sold/purchased don't exist
      purchased: 0, // Not available in Product type
      sold: 0, // Not available in Product type
      closing: product.stock || 0,
      turnoverRate: (product.stock || 0) > 0 ? 0 : 0 // Simplified since we don't have sold data
    }));
  }

  exportReport(reportData: any, filename: string): string {
    const csvContent = this.convertToCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    window.URL.revokeObjectURL(url);
    return csvContent;
  }

  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const rows = data.map(item => 
        headers.map(header => `"${item[header] || ''}"`).join(',')
      );
      
      return [headers.join(','), ...rows].join('\n');
    }
    
    // Handle object data
    const entries = Object.entries(data);
    return entries.map(([key, value]) => `"${key}","${value}"`).join('\n');
  }
}

export const reportingService = new ReportingService();
