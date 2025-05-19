
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Mail, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EmailTemplates = () => {
  // Sample templates
  const [templates, setTemplates] = useState([
    {
      id: "1",
      name: "Payment Reminder",
      subject: "Payment Reminder for Invoice #[INVOICE_NUMBER]",
      content: "Dear [Customer Name],\n\nThis is a reminder that invoice #[INVOICE_NUMBER] for Rs.[AMOUNT] is due on [DUE_DATE].\n\nPlease arrange for payment at your earliest convenience.\n\nThank you,\nVikas Milk Center"
    },
    {
      id: "2",
      name: "Order Confirmation",
      subject: "Your Order #[ORDER_NUMBER] has been confirmed",
      content: "Dear [Customer Name],\n\nYour order #[ORDER_NUMBER] has been confirmed and will be delivered on [DELIVERY_DATE].\n\nOrder Details:\n[ORDER_DETAILS]\n\nThank you for your business.\n\nRegards,\nVikas Milk Center"
    },
    {
      id: "3",
      name: "Monthly Statement",
      subject: "Your Monthly Statement for [MONTH]",
      content: "Dear [Customer Name],\n\nPlease find attached your monthly statement for the period of [START_DATE] to [END_DATE].\n\nTotal amount: Rs.[TOTAL_AMOUNT]\nPaid: Rs.[PAID_AMOUNT]\nOutstanding: Rs.[OUTSTANDING_AMOUNT]\n\nPlease contact us if you have any questions.\n\nRegards,\nVikas Milk Center"
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: ""
  });

  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    name: string;
    subject: string;
    content: string;
  } | null>(null);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast.error("Please fill in all fields");
      return;
    }

    const templateId = `template-${Date.now()}`;
    const template = {
      id: templateId,
      ...newTemplate
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: "", subject: "", content: "" });
    setShowNewDialog(false);
    toast.success(`Template "${template.name}" created successfully`);
  };

  const handleEditTemplate = () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.subject || !editingTemplate.content) {
      toast.error("Please fill in all fields");
      return;
    }

    setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setEditingTemplate(null);
    setShowEditDialog(false);
    toast.success("Template updated successfully");
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Template deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
        <p className="text-muted-foreground">
          Create and manage email templates for quick communications
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>
                Create a new email template for quick communications.
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
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="Your Payment is Due"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Dear [Customer Name],\n\nThis is a reminder that..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Available placeholders:</p>
                <ul className="list-disc list-inside">
                  <li>[Customer Name] - Customer's name</li>
                  <li>[INVOICE_NUMBER] - Invoice number</li>
                  <li>[AMOUNT] - Invoice amount</li>
                  <li>[DUE_DATE] - Due date</li>
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
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
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
              <CardDescription>{template.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground whitespace-pre-line max-h-[150px] overflow-hidden">
                {template.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Make changes to your email template.
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
                <Label htmlFor="edit-subject">Email Subject</Label>
                <Input
                  id="edit-subject"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Email Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                  className="min-h-[200px]"
                />
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

export default EmailTemplates;
