
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SMSTemplates = () => {
  // Sample templates
  const [templates, setTemplates] = useState([
    {
      id: "1",
      name: "Payment Reminder",
      content: "Dear [Customer], this is a reminder that your payment of Rs.[Amount] is due. Please arrange for payment at your earliest. Thank you, Vikas Milk Center"
    },
    {
      id: "2",
      name: "Order Confirmation",
      content: "Dear [Customer], your order for [Products] has been confirmed for delivery on [Date]. Thank you, Vikas Milk Center"
    },
    {
      id: "3",
      name: "Delivery Notification",
      content: "Dear [Customer], your order has been dispatched and will be delivered today. Thank you for choosing Vikas Milk Center."
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: ""
  });

  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    name: string;
    content: string;
  } | null>(null);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const calculateSMSCount = (content: string) => {
    return Math.ceil(content.length / 160) || 1;
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error("Please fill in all fields");
      return;
    }

    const templateId = `sms-${Date.now()}`;
    const template = {
      id: templateId,
      ...newTemplate
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: "", content: "" });
    setShowNewDialog(false);
    toast.success(`SMS Template "${template.name}" created successfully`);
  };

  const handleEditTemplate = () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.content) {
      toast.error("Please fill in all fields");
      return;
    }

    setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setEditingTemplate(null);
    setShowEditDialog(false);
    toast.success("SMS Template updated successfully");
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Template deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
        <p className="text-muted-foreground">
          Create and manage SMS templates for quick communications
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span className="text-muted-foreground">{templates.length} templates</span>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create SMS Template</DialogTitle>
              <DialogDescription>
                Create a new SMS template for quick communications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Payment Reminder"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">SMS Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Dear [Customer], your payment is due..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{newTemplate.content.length} characters</span>
                  <span>SMS count: {calculateSMSCount(newTemplate.content)}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Available placeholders:</p>
                <ul className="list-disc list-inside">
                  <li>[Customer] - Customer's name</li>
                  <li>[Amount] - Payment amount</li>
                  <li>[Date] - Delivery/due date</li>
                  <li>[Products] - Product list</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const smsCount = calculateSMSCount(template.content);
          
          return (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {template.name}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowEditDialog(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <span>SMS Template</span>
                  <Badge variant="outline" className="ml-2">
                    {smsCount} SMS{smsCount > 1 ? "s" : ""}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {template.content}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {template.content.length} characters
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit SMS Template</DialogTitle>
            <DialogDescription>
              Make changes to your SMS template.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">SMS Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                  className="min-h-[100px]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{editingTemplate.content.length} characters</span>
                  <span>SMS count: {calculateSMSCount(editingTemplate.content)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMSTemplates;
