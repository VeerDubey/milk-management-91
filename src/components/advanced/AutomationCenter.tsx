
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Settings, PlayCircle } from 'lucide-react';

export function AutomationCenter() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Automation Center</h2>
        <p className="text-muted-foreground">Workflow automation and smart triggers</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Reorder Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Automatically create purchase orders when stock levels are low
            </p>
            <Button className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configure Rules
            </Button>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Delivery Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Send automated SMS/WhatsApp notifications to customers
            </p>
            <Button className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Setup Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
