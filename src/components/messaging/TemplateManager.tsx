
import React, { useState } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Mail, Phone, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

type MessageChannel = "whatsapp" | "email" | "sms";
type MessageTemplate = {
  id: string;
  name: string;
  content: string;
  channel: MessageChannel;
};

export const TemplateManager = () => {
  const { 
    templates, 
    addTemplate, 
    updateTemplate, 
    deleteTemplate 
  } = useMessaging();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Omit<MessageTemplate, "id">>({
    name: "",
    content: "",
    channel: "email",
  });

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) return;
    addTemplate(newTemplate);
    setNewTemplate({ name: "", content: "", channel: "email" });
    setIsAddDialogOpen(false);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.content) return;
    updateTemplate(editingTemplate);
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id);
      if (editingTemplate?.id === id) {
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
      }
    }
  };

  const getChannelIcon = (channel: MessageChannel) => {
    switch (channel) {
      case "whatsapp": return <MessageSquare className="h-4 w-4 mr-2" />;
      case "email": return <Mail className="h-4 w-4 mr-2" />;
      case "sms": return <Phone className="h-4 w-4 mr-2" />;
    }
  };

  const getChannelLabel = (channel: MessageChannel) => {
    switch (channel) {
      case "whatsapp": return "WhatsApp";
      case "email": return "Email";
      case "sms": return "SMS";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Create and manage message templates</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable message template for customer communication.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Payment Reminder"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-channel">Primary Channel</Label>
                <Select
                  value={newTemplate.channel}
                  onValueChange={value => setNewTemplate({ ...newTemplate, channel: value as MessageChannel })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" /> Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" /> SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.content}
                  onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Enter your template content here..."
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground">
                  Available placeholders: {"{customerName}"}, {"{amount}"}, {"{companyName}"}, {"{date}"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTemplate} disabled={!newTemplate.name || !newTemplate.content}>
                <Save className="h-4 w-4 mr-2" /> Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No templates found. Create your first template to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center">
                    {getChannelIcon(template.channel)}
                    <span className="font-medium">{template.name}</span>
                    <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {getChannelLabel(template.channel)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template.content}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update your message template
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-template-name">Template Name</Label>
                  <Input
                    id="edit-template-name"
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-template-channel">Primary Channel</Label>
                  <Select
                    value={editingTemplate.channel}
                    onValueChange={value => setEditingTemplate({ ...editingTemplate, channel: value as MessageChannel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" /> Email
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" /> SMS
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-template-content">Template Content</Label>
                  <Textarea
                    id="edit-template-content"
                    value={editingTemplate.content}
                    onChange={e => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    className="min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available placeholders: {"{customerName}"}, {"{amount}"}, {"{companyName}"}, {"{date}"}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate} disabled={!editingTemplate?.name || !editingTemplate?.content}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
