import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, MessageSquare, Send, Eye, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SmsTemplate {
  id: string;
  name: string;
  category: 'order' | 'payment' | 'delivery' | 'promotion' | 'reminder';
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  usageCount: number;
}

export default function SmsTemplates() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([
    {
      id: '1',
      name: 'Order Confirmation',
      category: 'order',
      content: 'Dear {{customerName}}, your order #{{orderNumber}} has been confirmed. Total: ₹{{amount}}. Thank you!',
      variables: ['customerName', 'orderNumber', 'amount'],
      isActive: true,
      createdAt: '2024-01-15',
      usageCount: 156
    },
    {
      id: '2',
      name: 'Payment Reminder',
      category: 'reminder',
      content: 'Hi {{customerName}}, your payment of ₹{{amount}} is due on {{dueDate}}. Please make payment to avoid late charges.',
      variables: ['customerName', 'amount', 'dueDate'],
      isActive: true,
      createdAt: '2024-01-10',
      usageCount: 89
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'order' as SmsTemplate['category'],
    content: ''
  });

  const handleCreateTemplate = () => {
    const newTemplate: SmsTemplate = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      content: formData.content,
      variables: extractVariables(formData.content),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    setTemplates([...templates, newTemplate]);
    setFormData({ name: '', category: 'order', content: '' });
    setIsDialogOpen(false);
    toast.success('SMS template created successfully');
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return [...new Set(matches)];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            SMS Templates
          </h1>
          <p className="text-muted-foreground">Create and manage SMS templates for automated messaging</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="aurora-button">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create SMS Template</DialogTitle>
              <DialogDescription>Design a new SMS template for your messaging campaigns</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Enter your SMS message. Use {{variableName}} for dynamic content."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Use double curly braces for variables: {`{{customerName}}, {{amount}}, {{orderNumber}}`}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={!formData.name || !formData.content}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="aurora-card">
        <CardHeader>
          <CardTitle>SMS Templates</CardTitle>
          <CardDescription>Manage your SMS templates and track their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="aurora-table">
            <TableHeader>
              <TableRow className="aurora-table-header">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} className="aurora-table-row">
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-sm text-muted-foreground">
                      {template.content}
                    </div>
                  </TableCell>
                  <TableCell>{template.usageCount}</TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}