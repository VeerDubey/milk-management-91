
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  IndianRupee,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';
import StockService from '@/services/StockService';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  progress?: number;
}

export default function EnhancedMetrics() {
  const { orders, customers, products, payments } = useData();
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const stockService = StockService.getInstance();

  useEffect(() => {
    calculateMetrics();
  }, [orders, customers, products, payments]);

  const calculateMetrics = () => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    // Today's orders
    const todaysOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= startOfToday && orderDate <= endOfToday;
    });

    // Yesterday's orders for comparison
    const yesterdaysOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= startOfYesterday && orderDate <= endOfYesterday;
    });

    // Calculate today's sales
    const todaysSales = todaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const yesterdaysSales = yesterdaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const salesChange = yesterdaysSales > 0 ? ((todaysSales - yesterdaysSales) / yesterdaysSales) * 100 : 0;

    // Calculate pending dues
    const totalDues = customers.reduce((sum, customer) => sum + (customer.outstandingBalance || 0), 0);

    // Stock alerts
    const activeAlerts = stockService.getActiveAlerts();
    const lowStockCount = activeAlerts.filter(alert => alert.alertType === 'low_stock').length;

    // Total products with low stock percentage
    const totalProducts = products.length;
    const lowStockPercentage = totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0;

    // Active customers (those with orders in last 30 days)
    const thirtyDaysAgo = subDays(today, 30);
    const activeCustomersSet = new Set(
      orders
        .filter(order => new Date(order.date) >= thirtyDaysAgo)
        .map(order => order.customerId)
    );
    const activeCustomersCount = activeCustomersSet.size;
    const customerEngagement = customers.length > 0 ? (activeCustomersCount / customers.length) * 100 : 0;

    const newMetrics: MetricCard[] = [
      {
        title: "Today's Sales",
        value: `₹${todaysSales.toLocaleString()}`,
        change: salesChange,
        changeLabel: 'vs yesterday',
        icon: <IndianRupee className="h-4 w-4" />,
        color: 'text-green-600'
      },
      {
        title: "Today's Orders",
        value: todaysOrders.length,
        change: ((todaysOrders.length - yesterdaysOrders.length) / Math.max(yesterdaysOrders.length, 1)) * 100,
        changeLabel: 'vs yesterday',
        icon: <ShoppingCart className="h-4 w-4" />,
        color: 'text-blue-600'
      },
      {
        title: "Outstanding Dues",
        value: `₹${totalDues.toLocaleString()}`,
        icon: <TrendingUp className="h-4 w-4" />,
        color: totalDues > 0 ? 'text-red-600' : 'text-green-600'
      },
      {
        title: "Stock Alerts",
        value: activeAlerts.length,
        progress: 100 - lowStockPercentage,
        icon: <AlertTriangle className="h-4 w-4" />,
        color: activeAlerts.length > 0 ? 'text-orange-600' : 'text-green-600'
      },
      {
        title: "Active Customers",
        value: `${activeCustomersCount}/${customers.length}`,
        progress: customerEngagement,
        icon: <Users className="h-4 w-4" />,
        color: 'text-purple-600'
      },
      {
        title: "Total Products",
        value: products.length,
        progress: Math.max(0, 100 - lowStockPercentage),
        icon: <Package className="h-4 w-4" />,
        color: 'text-indigo-600'
      }
    ];

    setMetrics(newMetrics);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <div className={metric.color}>
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            
            {metric.change !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {metric.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={metric.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
                {metric.changeLabel && (
                  <span className="text-muted-foreground">{metric.changeLabel}</span>
                )}
              </div>
            )}

            {metric.progress !== undefined && (
              <div className="mt-2">
                <Progress value={metric.progress} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {metric.progress.toFixed(0)}% healthy
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
