
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Calendar, 
  FileText,
  Settings,
  Zap,
  Star,
  Target
} from 'lucide-react';
import { OrderSummarySheet } from '../reports/OrderSummarySheet';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CustomerInsights } from './CustomerInsights';
import { InventoryPredictor } from './InventoryPredictor';
import { AutomationCenter } from './AutomationCenter';
import { PerformanceMetrics } from './PerformanceMetrics';

const features = [
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Comprehensive data insights and trends',
    icon: BarChart3,
    badge: 'Premium',
    color: 'from-purple-500 to-blue-500'
  },
  {
    id: 'customer-insights',
    title: 'Customer Intelligence',
    description: 'Deep customer behavior analysis',
    icon: Users,
    badge: 'AI Powered',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'inventory-prediction',
    title: 'Smart Inventory',
    description: 'AI-driven demand forecasting',
    icon: Package,
    badge: 'Smart',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'automation',
    title: 'Automation Center',
    description: 'Workflow automation and triggers',
    icon: Zap,
    badge: 'Automation',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'performance',
    title: 'Performance Metrics',
    description: 'KPI tracking and optimization',
    icon: Target,
    badge: 'Pro',
    color: 'from-pink-500 to-purple-500'
  },
  {
    id: 'reports',
    title: 'Advanced Reports',
    description: 'Comprehensive reporting suite',
    icon: FileText,
    badge: 'Enterprise',
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function AdvancedFeatures() {
  const [activeFeature, setActiveFeature] = useState('analytics');
  
  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'customer-insights':
        return <CustomerInsights />;
      case 'inventory-prediction':
        return <InventoryPredictor />;
      case 'automation':
        return <AutomationCenter />;
      case 'performance':
        return <PerformanceMetrics />;
      case 'reports':
        return <OrderSummarySheet />;
      default:
        return <AnalyticsDashboard />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient">Advanced Features</h1>
        <p className="text-muted-foreground">
          Unlock the full potential of your milk management system
        </p>
      </div>
      
      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id}
              className={`modern-card cursor-pointer transition-all duration-300 ${
                activeFeature === feature.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Active Feature Content */}
      <Card className="modern-card">
        <CardContent className="p-6">
          {renderFeatureContent()}
        </CardContent>
      </Card>
    </div>
  );
}
