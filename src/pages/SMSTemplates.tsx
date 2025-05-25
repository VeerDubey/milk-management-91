
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MessageSquare, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateService } from '@/services/MessagingService';

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

export default function SMSTemplates() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const allTemplates = TemplateService.getTemplates();
      const smsTemplates = allTemplates
        .filter(t => t.channel === 'sms')
        .map(t => ({
          id: t.id,
          name: t.name,
          content: t.content,
          variables: extractVariables(t.content)
        }));
      setTemplates(smsTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleAddNew = () => {
    setEditingTemplate(null);
    setFormData({ name: '', content: '' });
    setDialogOpen(true);
  };

  const handleEdit = (template: SMSTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Template name and content are required');
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing
        TemplateService.updateTemplate({
          id: editingTemplate.id,
          name: formData.name,
          content: formData.content,
          channel: 'sms'
        });
        toast.success('Template updated successfully');
      } else {
        // Add new
        TemplateService.addTemplate({
          name: formData.name,
          content: formData.content,
          channel: 'sms'
        });
        toast.success('Template added successfully');
      }

      loadTemplates();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleDelete = (id: string) => {
    try {
      TemplateService.deleteTemplate(id);
      loadTemplates();
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Template copied to clipboard');
  };

  const commonVariables = [
    '{customerName}',
    '{companyName}',
    '{amount}',
    '{orderId}',
    '{date}',
    '{phone}',
    '{address}'
  ];

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + variable
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
          <p className="text-muted-foreground">Create and manage SMS templates for communication</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Templates
          </CardTitle>
          <CardDescription>
            Manage your SMS message templates with dynamic variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate text-sm text-muted-foreground">
                      {template.content.substring(0, 100)}
                      {template.content.length > 100 && '...'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyTemplate(template.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit SMS Template' : 'Add SMS Template'}
            </DialogTitle>
            <DialogDescription>
              Create reusable SMS templates with dynamic variables
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="e.g., Payment Reminder"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateContent">Message Content</Label>
              <Textarea
                id="templateContent"
                placeholder="Enter your SMS message template here..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
              <div className="text-sm text-muted-foreground">
                Character count: {formData.content.length}/160
              </div>
            </div>

            <div className="space-y-2">
              <Label>Common Variables</Label>
              <div className="flex flex-wrap gap-2">
                {commonVariables.map((variable) => (
                  <Button
                    key={variable}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable}
                  </Button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Click to add variables to your template
              </div>
            </div>

            {formData.content && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {formData.content.replace(/\{([^}]+)\}/g, '<$1>')}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTemplate ? 'Update' : 'Add'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
