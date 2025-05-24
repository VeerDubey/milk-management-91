
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Edit, Trash2, MessageSquare, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface SMSTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  variables: string[];
  category: string;
  createdAt: string;
}

export default function SMSTemplates() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<SMSTemplate>>({
    name: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    // Load templates from localStorage
    const saved = localStorage.getItem('smsTemplates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading SMS templates:', error);
      }
    } else {
      // Set default templates
      const defaultTemplates: SMSTemplate[] = [
        {
          id: '1',
          name: 'Order Confirmation',
          subject: 'Order Confirmed',
          message: 'Dear {customerName}, your order #{orderId} for ₹{amount} has been confirmed. Expected delivery: {deliveryDate}. Thank you!',
          variables: ['customerName', 'orderId', 'amount', 'deliveryDate'],
          category: 'orders',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Payment Reminder',
          subject: 'Payment Due',
          message: 'Hi {customerName}, your payment of ₹{amount} is due on {dueDate}. Please make the payment to avoid any inconvenience.',
          variables: ['customerName', 'amount', 'dueDate'],
          category: 'payments',
          createdAt: new Date().toISOString()
        }
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('smsTemplates', JSON.stringify(defaultTemplates));
    }
  }, []);
  
  const extractVariables = (message: string): string[] => {
    const matches = message.match(/{([^}]+)}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };
  
  const handleSave = () => {
    if (!currentTemplate.name || !currentTemplate.message) {
      toast.error('Please fill required fields');
      return;
    }
    
    const variables = extractVariables(currentTemplate.message);
    
    if (editingId) {
      // Update existing template
      const updatedTemplates = templates.map(template =>
        template.id === editingId
          ? { ...template, ...currentTemplate, variables }
          : template
      );
      setTemplates(updatedTemplates);
      localStorage.setItem('smsTemplates', JSON.stringify(updatedTemplates));
      toast.success('Template updated successfully');
    } else {
      // Create new template
      const newTemplate: SMSTemplate = {
        ...currentTemplate as SMSTemplate,
        id: `sms-${Date.now()}`,
        variables,
        createdAt: new Date().toISOString()
      };
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem('smsTemplates', JSON.stringify(updatedTemplates));
      toast.success('Template created successfully');
    }
    
    resetForm();
  };
  
  const handleEdit = (template: SMSTemplate) => {
    setCurrentTemplate(template);
    setEditingId(template.id);
  };
  
  const handleDelete = (id: string) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('smsTemplates', JSON.stringify(updatedTemplates));
    toast.success('Template deleted successfully');
  };
  
  const resetForm = () => {
    setCurrentTemplate({
      name: '',
      subject: '',
      message: '',
      category: 'general'
    });
    setEditingId(null);
  };
  
  const previewMessage = (message: string) => {
    return message.replace(/{([^}]+)}/g, (match, variable) => {
      const sampleData: Record<string, string> = {
        customerName: 'John Doe',
        orderId: 'ORD001',
        amount: '500.00',
        deliveryDate: '2024-01-15',
        dueDate: '2024-01-20',
        productName: 'Milk 1L'
      };
      return sampleData[variable] || match;
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
          <p className="text-muted-foreground">Create and manage SMS message templates</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {editingId ? 'Update' : 'Save'} Template
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              {editingId ? 'Edit Template' : 'Create Template'}
            </CardTitle>
            <CardDescription>
              Use variables like {'{customerName}'} for dynamic content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={currentTemplate.name || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Order Confirmation"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={currentTemplate.subject || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="SMS subject line"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={currentTemplate.message || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your SMS message with variables like {customerName}"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={currentTemplate.category || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., orders, payments, general"
              />
            </div>
            
            {currentTemplate.message && (
              <div className="space-y-2">
                <Label>Detected Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {extractVariables(currentTemplate.message).map((variable, index) => (
                    <Badge key={index} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {showPreview && currentTemplate.message && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{previewMessage(currentTemplate.message)}</p>
                </div>
              </div>
            )}
            
            {editingId && (
              <Button variant="outline" onClick={resetForm} className="w-full">
                Cancel Edit
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
            <CardDescription>
              Manage your SMS templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.subject && (
                        <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {template.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.variables.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {template.variables.length} variables
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {templates.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No templates created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Common Variables</CardTitle>
          <CardDescription>
            Use these variables in your templates for dynamic content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'customerName', 'orderId', 'amount', 'deliveryDate',
              'dueDate', 'productName', 'quantity', 'phoneNumber',
              'address', 'companyName', 'invoiceNumber', 'paymentMethod'
            ].map((variable) => (
              <div key={variable} className="text-center">
                <Badge variant="outline" className="cursor-pointer" 
                  onClick={() => {
                    const newMessage = (currentTemplate.message || '') + `{${variable}}`;
                    setCurrentTemplate(prev => ({ ...prev, message: newMessage }));
                  }}
                >
                  {variable}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
