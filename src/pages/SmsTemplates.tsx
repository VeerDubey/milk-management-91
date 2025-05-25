
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageSquare, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: string;
  createdAt: string;
}

export default function SmsTemplates() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([
    {
      id: '1',
      name: 'Payment Reminder',
      content: 'Dear {customer_name}, your outstanding amount is ₹{amount}. Please pay by {due_date}.',
      variables: ['customer_name', 'amount', 'due_date'],
      category: 'Payment',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Order Confirmation',
      content: 'Hi {customer_name}, your order #{order_id} has been confirmed. Total: ₹{total}',
      variables: ['customer_name', 'order_id', 'total'],
      category: 'Order',
      createdAt: new Date().toISOString()
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'General'
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const variables = extractVariables(newTemplate.content);
    const template: SmsTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      content: newTemplate.content,
      variables,
      category: newTemplate.category,
      createdAt: new Date().toISOString()
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', content: '', category: 'General' });
    setIsCreating(false);
    toast.success('SMS template created successfully');
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted successfully');
  };

  const previewTemplate = (template: SmsTemplate) => {
    const previewContent = template.content.replace(/\{([^}]+)\}/g, (match, variable) => {
      switch (variable) {
        case 'customer_name': return 'John Doe';
        case 'amount': return '500';
        case 'due_date': return '2024-01-15';
        case 'order_id': return 'ORD001';
        case 'total': return '1200';
        default: return `[${variable}]`;
      }
    });
    
    toast.info(`Preview: ${previewContent}`, { duration: 5000 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
          <p className="text-muted-foreground">Create and manage SMS templates for customer communication</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New SMS Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Input
                  id="template-category"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Message Content</Label>
              <Textarea
                id="template-content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your SMS message. Use {variable_name} for dynamic content."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Use variables like {'{customer_name}'}, {'{amount}'}, {'{order_id}'} for dynamic content
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate}>Create Template</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => previewTemplate(template)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{template.content}</p>
              {template.variables.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">Variables:</span>
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
