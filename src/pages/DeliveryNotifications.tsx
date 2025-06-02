
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Mail, MessageCircle, Send, Plus, Clock, User, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useData } from '@/contexts/data/DataContext';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  trigger: 'delivery_scheduled' | 'delivery_started' | 'delivery_completed' | 'delivery_delayed' | 'custom';
  subject?: string;
  message: string;
  isActive: boolean;
  createdAt: Date;
}

interface NotificationLog {
  id: string;
  customerId: string;
  customerName: string;
  type: 'email' | 'sms';
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: Date;
  templateUsed?: string;
}

export default function DeliveryNotifications() {
  const { customers } = useData();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Delivery Scheduled',
      type: 'both',
      trigger: 'delivery_scheduled',
      subject: 'Your Delivery is Scheduled',
      message: 'Dear {customerName}, your delivery has been scheduled for {deliveryDate} between {timeSlot}. Thank you for choosing Vikas Milk Centre.',
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Delivery Started',
      type: 'sms',
      trigger: 'delivery_started',
      message: 'Hi {customerName}, our delivery person is on the way to your location. ETA: {estimatedTime}. Vikas Milk Centre',
      isActive: true,
      createdAt: new Date()
    }
  ]);

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkMessageType, setBulkMessageType] = useState<'email' | 'sms'>('sms');

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'sms' as 'email' | 'sms' | 'both',
    trigger: 'custom' as NotificationTemplate['trigger'],
    subject: '',
    message: '',
    isActive: true
  });

  const triggerOptions = [
    { value: 'delivery_scheduled', label: 'Delivery Scheduled' },
    { value: 'delivery_started', label: 'Delivery Started' },
    { value: 'delivery_completed', label: 'Delivery Completed' },
    { value: 'delivery_delayed', label: 'Delivery Delayed' },
    { value: 'custom', label: 'Custom' }
  ];

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast.error('Please fill all required fields');
      return;
    }

    const template: NotificationTemplate = {
      id: `template-${Date.now()}`,
      ...newTemplate,
      createdAt: new Date()
    };

    setTemplates(prev => [...prev, template]);
    setShowCreateTemplate(false);
    setNewTemplate({
      name: '',
      type: 'sms',
      trigger: 'custom',
      subject: '',
      message: '',
      isActive: true
    });
    toast.success('Template created successfully');
  };

  const sendBulkNotification = () => {
    if (selectedCustomers.length === 0 || !bulkMessage.trim()) {
      toast.error('Please select customers and enter a message');
      return;
    }

    const newLogs: NotificationLog[] = selectedCustomers.map(customerId => {
      const customer = customers.find(c => c.id === customerId);
      return {
        id: `log-${Date.now()}-${customerId}`,
        customerId,
        customerName: customer?.name || 'Unknown',
        type: bulkMessageType,
        message: bulkMessage,
        status: 'sent',
        sentAt: new Date()
      };
    });

    setNotificationLogs(prev => [...newLogs, ...prev]);
    setSelectedCustomers([]);
    setBulkMessage('');
    toast.success(`Bulk ${bulkMessageType} sent to ${selectedCustomers.length} customers`);
  };

  const sendTestNotification = (template: NotificationTemplate) => {
    const testLog: NotificationLog = {
      id: `test-${Date.now()}`,
      customerId: 'test',
      customerName: 'Test Customer',
      type: template.type === 'both' ? 'sms' : template.type,
      message: template.message.replace('{customerName}', 'Test Customer'),
      status: 'sent',
      sentAt: new Date(),
      templateUsed: template.name
    };

    setNotificationLogs(prev => [testLog, ...prev]);
    toast.success('Test notification sent');
  };

  const toggleTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    setSelectedCustomers(customers.map(c => c.id));
  };

  const deselectAllCustomers = () => {
    setSelectedCustomers([]);
  };

  const getStatusColor = (status: NotificationLog['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: 'email' | 'sms') => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Delivery Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage customer notifications for deliveries via SMS and Email
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowCreateTemplate(true)}
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Templates */}
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Settings className="h-5 w-5" />
              Notification Templates
            </CardTitle>
            <CardDescription>
              Manage automated notification templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline">
                        {template.trigger.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={() => toggleTemplate(template.id)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTestNotification(template)}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type === 'both' ? 'sms' : template.type)}
                      <span className="text-sm text-muted-foreground">
                        {template.type.toUpperCase()}
                      </span>
                    </div>
                    
                    {template.subject && (
                      <div>
                        <span className="text-sm font-medium">Subject: </span>
                        <span className="text-sm">{template.subject}</span>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-sm font-medium">Message: </span>
                      <p className="text-sm text-muted-foreground">{template.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Notifications */}
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Send className="h-5 w-5" />
              Send Bulk Notifications
            </CardTitle>
            <CardDescription>
              Send notifications to multiple customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={bulkMessageType} onValueChange={(value: any) => setBulkMessageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Customers ({selectedCustomers.length} selected)</Label>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={selectAllCustomers}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={deselectAllCustomers}>
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {customers.map(customer => (
                  <div key={customer.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => toggleCustomerSelection(customer.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{customer.name} - {customer.area}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={sendBulkNotification}
              className="w-full aurora-button"
              disabled={selectedCustomers.length === 0 || !bulkMessage.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Send to {selectedCustomers.length} Customers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notification Logs */}
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-aurora">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            Track sent notifications and delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationLogs.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No notifications sent</h3>
              <p className="text-muted-foreground">
                Start sending notifications to see them here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {log.customerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(log.type)}
                        {log.type.toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(log.sentAt, 'dd/MM HH:mm')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Template Form */}
      {showCreateTemplate && (
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle>Create Notification Template</CardTitle>
            <CardDescription>Design a reusable notification template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newTemplate.type} onValueChange={(value: any) => 
                  setNewTemplate(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select value={newTemplate.trigger} onValueChange={(value: any) => 
                  setNewTemplate(prev => ({ ...prev, trigger: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(newTemplate.type === 'email' || newTemplate.type === 'both') && (
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={newTemplate.message}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter message (use {customerName}, {deliveryDate}, {timeSlot} for placeholders)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Available placeholders: {'{customerName}'}, {'{deliveryDate}'}, {'{timeSlot}'}, {'{estimatedTime}'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newTemplate.isActive}
                onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={createTemplate} className="aurora-button">
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
