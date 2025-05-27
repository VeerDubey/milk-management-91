
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Bell, 
  Download, 
  FileText,
  Settings,
  Users,
  Package,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';

export const AdvancedFeatures = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Comprehensive business insights and reporting',
      icon: TrendingUp,
      status: 'active',
      color: 'primary'
    },
    {
      id: 'inventory',
      title: 'Smart Inventory Management',
      description: 'AI-powered stock predictions and alerts',
      icon: Package,
      status: 'beta',
      color: 'secondary'
    },
    {
      id: 'routing',
      title: 'Route Optimization',
      description: 'Optimize delivery routes for efficiency',
      icon: Truck,
      status: 'coming-soon',
      color: 'warning'
    },
    {
      id: 'notifications',
      title: 'Smart Notifications',
      description: 'Real-time alerts and reminders',
      icon: Bell,
      status: 'active',
      color: 'success'
    },
    {
      id: 'reports',
      title: 'Custom Reports',
      description: 'Generate detailed business reports',
      icon: FileText,
      status: 'active',
      color: 'primary'
    },
    {
      id: 'dashboard',
      title: 'Executive Dashboard',
      description: 'High-level business overview',
      icon: BarChart3,
      status: 'active',
      color: 'secondary'
    }
  ];

  const handleFeatureToggle = (featureId: string) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);
    toast.success(`${features.find(f => f.id === featureId)?.title} ${activeFeature === featureId ? 'disabled' : 'enabled'}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case 'beta':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Beta</Badge>;
      case 'coming-soon':
        return <Badge className="bg-muted/20 text-muted-foreground border-muted/30">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gradient-aurora">Advanced Features</h2>
        <p className="text-muted-foreground">Unlock the full potential of your dairy business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          const isActive = activeFeature === feature.id;
          
          return (
            <Card 
              key={feature.id} 
              className={`aurora-card cursor-pointer transition-all duration-300 hover:scale-105 ${
                isActive ? 'glow-primary' : ''
              }`}
              onClick={() => handleFeatureToggle(feature.id)}
            >
              <CardHeader className="text-center space-y-4">
                <div className={`mx-auto w-12 h-12 rounded-full bg-${feature.color}/20 flex items-center justify-center`}>
                  <IconComponent className={`h-6 w-6 text-${feature.color}`} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  {getStatusBadge(feature.status)}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  {feature.description}
                </p>
                <Button 
                  size="sm" 
                  variant={isActive ? "default" : "outline"}
                  className={isActive ? "aurora-button" : ""}
                  disabled={feature.status === 'coming-soon'}
                >
                  {isActive ? 'Disable' : 'Enable'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeFeature && (
        <Card className="aurora-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-gradient-aurora">
              {features.find(f => f.id === activeFeature)?.title} Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Settings
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
