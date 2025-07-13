
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, TrendingDown, X } from 'lucide-react';
import StockService, { StockAlert } from '@/services/StockService';
import { useData } from '@/contexts/data/DataContext';

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const { products } = useData();
  const stockService = StockService.getInstance();

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    const activeAlerts = stockService.getActiveAlerts();
    
    // Enrich alerts with product names
    const enrichedAlerts = activeAlerts.map(alert => {
      const product = products.find(p => p.id === alert.productId);
      return {
        ...alert,
        productName: product?.name || 'Unknown Product'
      };
    });

    setAlerts(enrichedAlerts);
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type: StockAlert['alertType']) => {
    switch (type) {
      case 'low_stock':
        return <Package className="h-4 w-4" />;
      case 'negative_stock':
        return <TrendingDown className="h-4 w-4" />;
      case 'expiry_warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: StockAlert['alertType']) => {
    switch (type) {
      case 'low_stock':
        return 'warning';
      case 'negative_stock':
        return 'destructive';
      case 'expiry_warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Stock Alerts
          <Badge variant="secondary">{visibleAlerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleAlerts.map((alert) => (
          <Alert key={alert.id} variant={getAlertVariant(alert.alertType)}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.alertType)}
                <div>
                  <AlertDescription>
                    <strong>{alert.productName}</strong> - {alert.message}
                  </AlertDescription>
                  {alert.currentStock !== undefined && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Current Stock: {alert.currentStock} units
                      {alert.threshold && ` (Threshold: ${alert.threshold})`}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
