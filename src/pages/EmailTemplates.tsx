import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Mail, Send, Eye, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  category: 'order' | 'payment' | 'delivery' | 'promotion' | 'reminder';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  usageCount: number;
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Order Confirmation',
      category: 'order',
      subject: 'Order Confirmation - {{orderNumber}}',
      content: 'Dear {{customerName}},\n\nThank you for your order! Your order #{{orderNumber}} has been confirmed.\n\nOrder Details:\nTotal Amount: ₹{{amount}}\nDelivery Date: {{deliveryDate}}\n\nThank you for choosing us!\n\nBest regards,\nVikas Milk Centre',
      variables: ['customerName', 'orderNumber', 'amount', 'deliveryDate'],
      isActive: true,
      createdAt: '2024-01-15',
      usageCount: 245
    },
    {
      id: '2',
      name: 'Payment Reminder',
      category: 'reminder',
      subject: 'Payment Reminder - Due {{dueDate}}',
      content: 'Dear {{customerName}},\n\nThis is a friendly reminder that your payment of ₹{{amount}} is due on {{dueDate}}.\n\nPlease make the payment at your earliest convenience to avoid any late charges.\n\nIf you have already made the payment, please ignore this message.\n\nThank you!\n\nVikas Milk Centre',
      variables: ['customerName', 'amount', 'dueDate'],
      isActive: true,
      createdAt: '2024-01-10',
      usageCount: 156
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'order' as EmailTemplate['category'],
    subject: '',
    content: ''
  });

  const handleCreateTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      subject: formData.subject,
      content: formData.content,
      variables: extractVariables(formData.content + ' ' + formData.subject),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    setTemplates([...templates, newTemplate]);
    setFormData({ name: '', category: 'order', subject: '', content: '' });
    setIsDialogOpen(false);
    toast.success('Email template created successfully');
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
            Email Templates
          </h1>
          <p className="text-muted-foreground">Create and manage email templates for automated messaging</p>
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
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>Design a new email template for your campaigns</DialogDescription>
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
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Enter email subject with variables like {{customerName}}"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Enter your email content. Use {{variableName}} for dynamic content."
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Use double curly braces for variables: {`{{customerName}}, {{amount}}, {{orderNumber}}`}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={!formData.name || !formData.subject || !formData.content}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="aurora-card">
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Manage your email templates and track their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="aurora-table">
            <TableHeader>
              <TableRow className="aurora-table-header">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subject</TableHead>
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
                      {template.subject}
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