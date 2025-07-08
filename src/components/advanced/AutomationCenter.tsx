import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Zap, Settings, PlayCircle, Clock, Mail, MessageSquare, Bell, Bot } from 'lucide-react';

export function AutomationCenter() {
  const [automations, setAutomations] = useState([
    {
      id: '1',
      name: 'Low Stock Alert',
      description: 'Send notifications when products fall below minimum stock',
      isActive: true,
      trigger: 'Stock Level',
      action: 'Send Email',
      lastRun: '2 hours ago'
    },
    {
      id: '2',
      name: 'Payment Reminder',
      description: 'Automatically send payment reminders to customers',
      isActive: true,
      trigger: 'Due Date',
      action: 'Send SMS',
      lastRun: '1 day ago'
    },
    {
      id: '3',
      name: 'Order Confirmation',
      description: 'Send order confirmation emails automatically',
      isActive: false,
      trigger: 'New Order',
      action: 'Send Email',
      lastRun: 'Never'
    }
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(automation => 
      automation.id === id 
        ? { ...automation, isActive: !automation.isActive }
        : automation
    ));
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'send email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'send sms':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Automation Center</h2>
        <p className="text-muted-foreground">Set up smart workflows and automated triggers</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Automations</p>
                <p className="text-2xl font-bold text-primary">{automations.filter(a => a.isActive).length}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold text-blue-500">{automations.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold text-green-500">1,247</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold text-orange-500">45h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Automations */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Workflows</CardTitle>
            <Button size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Manage All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.map((automation) => (
              <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getActionIcon(automation.action)}
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{automation.name}</h4>
                    <p className="text-sm text-muted-foreground">{automation.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Trigger: {automation.trigger}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Action: {automation.action}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last run: {automation.lastRun}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}