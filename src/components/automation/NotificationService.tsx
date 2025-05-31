import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Send, MessageSquare, Mail, Smartphone, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type NotificationType = 'sms' | 'email' | 'whatsapp';
type NotificationEvent = 'order_confirmation' | 'delivery_update' | 'payment_receipt' | 'payment_reminder' | 'low_stock';

interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  event: NotificationEvent;
  subject?: string;
  message: string;
  isActive: boolean;
  variables: string[];
}

interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  apiKeys: {
    sms: string;
    email: string;
    whatsapp: string;
  };
  defaultSender: {
    sms: string;
    email: string;
    whatsapp: string;
  };
}

export function NotificationService() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: false,
    emailEnabled: false,
    whatsappEnabled: false,
    apiKeys: { sms: '', email: '', whatsapp: '' },
    defaultSender: { sms: '', email: '', whatsapp: '' }
  });
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: NotificationType;
    event: NotificationEvent;
    subject: string;
    message: string;
    isActive: boolean;
  }>({
    name: '',
    type: 'sms',
    event: 'order_confirmation',
    subject: '',
    message: '',
    isActive: true
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedTemplates = localStorage.getItem('notificationTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Initialize with default templates
      setTemplates(getDefaultTemplates());
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('notificationTemplates', JSON.stringify(templates));
  }, [templates]);

  const getDefaultTemplates = (): NotificationTemplate[] => [
    {
      id: '1',
      name: 'Order Confirmation SMS',
      type: 'sms',
      event: 'order_confirmation',
      message: 'Hi {{customerName}}, your order #{{orderNumber}} for ₹{{amount}} has been confirmed. We will deliver it on {{deliveryDate}}. - Vikas Milk Centre',
      isActive: true,
      variables: ['customerName', 'orderNumber', 'amount', 'deliveryDate']
    },
    {
      id: '2',
      name: 'Delivery Update SMS',
      type: 'sms',
      event: 'delivery_update',
      message: 'Hi {{customerName}}, your order #{{orderNumber}} is out for delivery. Our delivery executive will reach you within {{estimatedTime}}. - Vikas Milk Centre',
      isActive: true,
      variables: ['customerName', 'orderNumber', 'estimatedTime']
    },
    {
      id: '3',
      name: 'Payment Receipt Email',
      type: 'email',
      event: 'payment_receipt',
      subject: 'Payment Received - Vikas Milk Centre',
      message: 'Dear {{customerName}},\n\nWe have received your payment of ₹{{amount}} on {{paymentDate}}.\n\nPayment Method: {{paymentMethod}}\nReference: {{referenceNumber}}\n\nThank you for your business!\n\nBest regards,\nVikas Milk Centre',
      isActive: true,
      variables: ['customerName', 'amount', 'paymentDate', 'paymentMethod', 'referenceNumber']
    }
  ];

  const eventOptions = [
    { value: 'order_confirmation' as const, label: 'Order Confirmation' },
    { value: 'delivery_update' as const, label: 'Delivery Update' },
    { value: 'payment_receipt' as const, label: 'Payment Receipt' },
    { value: 'payment_reminder' as const, label: 'Payment Reminder' },
    { value: 'low_stock' as const, label: 'Low Stock Alert' }
  ];

  const availableVariables: Record<NotificationEvent, string[]> = {
    order_confirmation: ['customerName', 'orderNumber', 'amount', 'deliveryDate', 'items'],
    delivery_update: ['customerName', 'orderNumber', 'estimatedTime', 'driverName', 'vehicleNumber'],
    payment_receipt: ['customerName', 'amount', 'paymentDate', 'paymentMethod', 'referenceNumber'],
    payment_reminder: ['customerName', 'dueAmount', 'dueDate', 'daysPastDue'],
    low_stock: ['productName', 'currentStock', 'minimumStock', 'reorderLevel']
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const templateData: NotificationTemplate = {
      id: editingTemplate?.id || `template_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      event: formData.event,
      subject: formData.subject,
      message: formData.message,
      isActive: formData.isActive,
      variables: availableVariables[formData.event] || []
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? templateData : t));
      toast.success('Template updated successfully');
    } else {
      setTemplates([...templates, templateData]);
      toast.success('Template created successfully');
    }

    resetForm();
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      event: template.event,
      subject: template.subject || '',
      message: template.message,
      isActive: template.isActive
    });
    setIsEditingTemplate(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sms',
      event: 'order_confirmation',
      subject: '',
      message: '',
      isActive: true
    });
    setEditingTemplate(null);
    setIsEditingTemplate(false);
  };

  const toggleTemplateStatus = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const sendTestNotification = (template: NotificationTemplate) => {
    toast.success(`Test ${template.type.toUpperCase()} sent using "${template.name}" template`);
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    const colors = {
      sms: 'bg-green-500/20 text-green-400',
      email: 'bg-blue-500/20 text-blue-400',
      whatsapp: 'bg-emerald-500/20 text-emerald-400'
    };
    
    return (
      <Badge className={colors[type]}>
        {getTypeIcon(type)}
        <span className="ml-1">{type.toUpperCase()}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Configure notification channels and API settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SMS Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="neo-noir-text">SMS Notifications</Label>
                <Switch
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, smsEnabled: checked})
                  }
                />
              </div>
              {settings.smsEnabled && (
                <div className="space-y-2">
                  <Input
                    placeholder="SMS API Key"
                    value={settings.apiKeys.sms}
                    onChange={(e) => 
                      setSettings({
                        ...settings, 
                        apiKeys: {...settings.apiKeys, sms: e.target.value}
                      })
                    }
                    className="neo-noir-input"
                  />
                  <Input
                    placeholder="Sender ID"
                    value={settings.defaultSender.sms}
                    onChange={(e) => 
                      setSettings({
                        ...settings, 
                        defaultSender: {...settings.defaultSender, sms: e.target.value}
                      })
                    }
                    className="neo-noir-input"
                  />
                </div>
              )}
            </div>

            {/* Email Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="neo-noir-text">Email Notifications</Label>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, emailEnabled: checked})
                  }
                />
              </div>
              {settings.emailEnabled && (
                <div className="space-y-2">
                  <Input
                    placeholder="Email API Key"
                    value={settings.apiKeys.email}
                    onChange={(e) => 
                      setSettings({
                        ...settings, 
                        apiKeys: {...settings.apiKeys, email: e.target.value}
                      })
                    }
                    className="neo-noir-input"
                  />
                  <Input
                    placeholder="From Email"
                    value={settings.defaultSender.email}
                    onChange={(e) => 
                      setSettings({
                        ...settings, 
                        defaultSender: {...settings.defaultSender, email: e.target.value}
                      })
                    }
                    className="neo-noir-input"
                  />
                </div>
              )}
            </div>

            {/* WhatsApp Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="neo-noir-text">WhatsApp Notifications</Label>
                <Switch
                  checked={settings.whatsappEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, whatsappEnabled: checked})
                  }
                />
              </div>
              {settings.whatsappEnabled && (
                <div className="space-y-2">
                  <Input
                    placeholder="WhatsApp API Key"
                    value={settings.apiKeys.whatsapp}
                    onChange={(e) => 
                      setSettings({
                        ...settings, 
                        apiKeys: {...settings.apiKeys, whatsapp: e.target.value}
                      })
                    }
                    className="neo-noir-input"
                  />
                  <Input
                    placeholder="WhatsApp Number"
                    value={settings.defaultSender.whatsapp}
                    onChange={(e) => 
                      setSettings({
                        ...settings, 
                        defaultSender: {...settings.defaultSender, whatsapp: e.target.value}
                      })
                    }
                    className="neo-noir-input"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Editor */}
      <Card className="neo-noir-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="neo-noir-text">
                {isEditingTemplate ? 'Edit Template' : 'Create New Template'}
              </CardTitle>
              <CardDescription className="neo-noir-text-muted">
                {isEditingTemplate ? 'Update template details' : 'Create a new notification template'}
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsEditingTemplate(!isEditingTemplate)}
              className="neo-noir-button-accent"
            >
              {isEditingTemplate ? 'Cancel' : 'New Template'}
            </Button>
          </div>
        </CardHeader>
        {isEditingTemplate && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter template name"
                  className="neo-noir-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="neo-noir-text">Type *</Label>
                <Select value={formData.type} onValueChange={(value: NotificationType) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="neo-noir-text">Event *</Label>
                <Select value={formData.event} onValueChange={(value: NotificationEvent) => setFormData({...formData, event: value})}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    {eventOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="neo-noir-text">Status</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <span className="neo-noir-text">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            {formData.type === 'email' && (
              <div className="space-y-2">
                <Label className="neo-noir-text">Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Enter email subject"
                  className="neo-noir-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="neo-noir-text">Message *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Enter message template with variables like {{customerName}}"
                className="neo-noir-input"
                rows={4}
              />
              <div className="text-sm neo-noir-text-muted">
                Available variables: {availableVariables[formData.event]?.map(v => `{{${v}}}`).join(', ')}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveTemplate} className="neo-noir-button-accent">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
              <Button onClick={resetForm} variant="outline" className="neo-noir-button-outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Templates List */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Notification Templates</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Manage your notification templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="neo-noir-table">
              <TableHeader>
                <TableRow className="neo-noir-table-header">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="neo-noir-table-row">
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{getTypeBadge(template.type)}</TableCell>
                    <TableCell>
                      {eventOptions.find(e => e.value === template.event)?.label}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={() => toggleTemplateStatus(template.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sendTestNotification(template)}
                          className="neo-noir-button-ghost"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTemplate(template)}
                          className="neo-noir-button-ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="neo-noir-button-ghost text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
