
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Users, Package, Clock, X } from 'lucide-react';
import { format, isAfter, subDays } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  action?: () => void;
  actionText?: string;
  createdAt: Date;
}

export const NotificationCenter: React.FC = () => {
  const { customers, orders, products } = useData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [customers, orders, products]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // Outstanding payments due
    const customersWithDues = customers.filter(c => (c.outstandingBalance || 0) > 1000);
    if (customersWithDues.length > 0) {
      newNotifications.push({
        id: 'outstanding-dues',
        type: 'warning',
        title: 'High Outstanding Payments',
        message: `${customersWithDues.length} customers have outstanding dues > ₹1,000`,
        action: () => {
          // Navigate to outstanding dues page
          window.location.href = '/outstanding-dues';
        },
        actionText: 'View Details',
        createdAt: new Date()
      });
    }

    // Low stock alerts
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10);
    if (lowStockProducts.length > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} products are running low on stock`,
        action: () => {
          window.location.href = '/stock-management';
        },
        actionText: 'Manage Stock',
        createdAt: new Date()
      });
    }

    // Pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 5) {
      newNotifications.push({
        id: 'pending-orders',
        type: 'info',
        title: 'Pending Orders',
        message: `You have ${pendingOrders.length} pending orders to process`,
        action: () => {
          window.location.href = '/order-list';
        },
        actionText: 'Process Orders',
        createdAt: new Date()
      });
    }

    // Old pending orders (more than 2 days)
    const oldPendingOrders = orders.filter(o => 
      o.status === 'pending' && 
      !isAfter(new Date(o.date), subDays(new Date(), 2))
    );
    if (oldPendingOrders.length > 0) {
      newNotifications.push({
        id: 'old-pending-orders',
        type: 'error',
        title: 'Urgent: Old Pending Orders',
        message: `${oldPendingOrders.length} orders are pending for more than 2 days`,
        action: () => {
          window.location.href = '/order-list';
        },
        actionText: 'View Orders',
        createdAt: new Date()
      });
    }

    // Recent high-value orders
    const recentHighValueOrders = orders.filter(o => 
      (o.total || 0) > 5000 && 
      isAfter(new Date(o.date), subDays(new Date(), 1))
    );
    if (recentHighValueOrders.length > 0) {
      newNotifications.push({
        id: 'high-value-orders',
        type: 'info',
        title: 'High Value Orders',
        message: `${recentHighValueOrders.length} high-value orders (>₹5,000) placed recently`,
        createdAt: new Date()
      });
    }

    setNotifications(newNotifications);

    // Show toast notifications for critical alerts
    newNotifications.forEach(notification => {
      if (notification.type === 'error') {
        toast.error(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      }
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4 text-accent-color" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-xl neo-noir-button-outline relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-destructive text-destructive-foreground text-xs animate-pulse">
            {notifications.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 z-50">
          <Card className="neo-noir-card border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="neo-noir-text flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {notifications.length > 0 && (
                  <Badge variant="secondary">{notifications.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-3">
              {notifications.length === 0 ? (
                <p className="neo-noir-text-muted text-center py-4">
                  No new notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="neo-noir-surface p-3 rounded-lg border border-border-color/30 relative"
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium neo-noir-text text-sm">
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="neo-noir-text-muted text-xs">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs neo-noir-text-muted">
                            {format(notification.createdAt, 'HH:mm')}
                          </span>
                          {notification.action && notification.actionText && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={notification.action}
                              className="h-6 text-xs neo-noir-button-outline"
                            >
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
