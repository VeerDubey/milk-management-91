
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Truck,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

export const BusinessIntelligence = () => {
  const kpis = [
    {
      title: 'Revenue',
      value: '₹2,45,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Active Customers',
      value: '1,247',
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Products Sold',
      value: '8,450',
      change: '-2.1%',
      trend: 'down',
      icon: Package,
      color: 'warning'
    },
    {
      title: 'Delivery Routes',
      value: '24',
      change: '+8.3%',
      trend: 'up',
      icon: Truck,
      color: 'secondary'
    }
  ];

  const insights = [
    {
      title: 'Peak Sales Hours',
      description: 'Most sales occur between 7-9 AM and 5-7 PM',
      action: 'Optimize staffing'
    },
    {
      title: 'Top Products',
      description: 'Full cream milk accounts for 65% of total sales',
      action: 'Stock management'
    },
    {
      title: 'Route Efficiency',
      description: 'Route A has 15% higher delivery time than average',
      action: 'Route optimization'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={kpi.title} className="aurora-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`h-4 w-4 text-${kpi.trend === 'up' ? 'success' : 'destructive'}`} />
                      <span className={`text-sm text-${kpi.trend === 'up' ? 'success' : 'destructive'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-${kpi.color}/20`}>
                    <IconComponent className={`h-6 w-6 text-${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Interactive chart will be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-secondary" />
              Product Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Product breakdown chart</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Insights */}
      <Card className="aurora-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient-aurora">Business Insights</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50">
                <div className="space-y-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                <Badge variant="outline" className="aurora-button text-xs">
                  {insight.action}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
