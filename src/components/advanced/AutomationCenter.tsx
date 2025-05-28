
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Bell, Mail, Calendar, Settings } from 'lucide-react';

const automationRules = [
  {
    id: 1,
    name: 'Low Stock Alert',
    description: 'Send notification when product stock is low',
    trigger: 'Stock level < 10 units',
    action: 'Send email + SMS alert',
    status: 'active',
    icon: Bell
  },
  {
    id: 2,
    name: 'Daily Order Summary',
    description: 'Automatically generate daily order reports',
    trigger: 'Every day at 6 PM',
    action: 'Generate & email report',
    status: 'active',
    icon: Mail
  },
  {
    id: 3,
    name: 'Customer Follow-up',
    description: 'Follow up with customers after delivery',
    trigger: '24 hours after delivery',
    action: 'Send feedback SMS',
    status: 'paused',
    icon: Clock
  },
  {
    id: 4,
    name: 'Weekly Analytics',
    description: 'Send weekly business insights',
    trigger: 'Every Monday at 9 AM',
    action: 'Generate analytics report',
    status: 'active',
    icon: Calendar
  }
];

export function AutomationCenter() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Automation Center</h2>
        <p className="text-muted-foreground">Streamline your workflow with smart automation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {automationRules.filter(r => r.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Rules</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">2.5h</div>
            <div className="text-sm text-muted-foreground">Time Saved Daily</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Tasks Automated</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Automation Rules</CardTitle>
          <Button size="sm" className="modern-button">
            <Zap className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule) => {
              const Icon = rule.icon;
              return (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {rule.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Trigger:</span> {rule.trigger} → 
                        <span className="font-medium"> Action:</span> {rule.action}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                      {rule.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
