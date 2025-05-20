
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Customer } from "@/types";

interface BatchReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomers: Customer[];
  onSendReminders: (data: { 
    template: string; 
    channel: string; 
    customMessage: string;
    customers: Customer[];
  }) => void;
}

const TEMPLATES = [
  { id: "gentle", name: "Gentle Reminder", 
    content: "This is a gentle reminder that your payment of {amount} is due." },
  { id: "standard", name: "Standard Reminder", 
    content: "Your payment of {amount} was due on {dueDate}. Please settle the amount at your earliest convenience." },
  { id: "urgent", name: "Urgent Reminder", 
    content: "URGENT: Your payment of {amount} is overdue by {overdueDays} days. Please settle immediately to avoid service interruption." },
];

export function BatchReminderDialog({ 
  open, 
  onOpenChange, 
  selectedCustomers, 
  onSendReminders 
}: BatchReminderDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("gentle");
  const [selectedChannel, setSelectedChannel] = useState<string>("sms");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<string>("");
  const [customersToRemind, setCustomersToRemind] = useState<Customer[]>([]);
  
  // Update template content when selection changes
  useEffect(() => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      setSelectedTemplateContent(template.content);
      setCustomMessage(template.content);
    }
  }, [selectedTemplate]);
  
  // Update customers list when dialog opens or selection changes
  useEffect(() => {
    setCustomersToRemind(selectedCustomers);
  }, [selectedCustomers, open]);
  
  const handleSend = () => {
    if (customersToRemind.length === 0) {
      toast.error("No customers selected for reminders");
      return;
    }
    
    onSendReminders({
      template: selectedTemplate,
      channel: selectedChannel,
      customMessage,
      customers: customersToRemind
    });
    
    toast.success(`Reminders sent to ${customersToRemind.length} customers`);
    onOpenChange(false);
  };
  
  const toggleCustomer = (customerId: string) => {
    setCustomersToRemind(prev => {
      const exists = prev.some(c => c.id === customerId);
      
      if (exists) {
        return prev.filter(c => c.id !== customerId);
      } else {
        const customerToAdd = selectedCustomers.find(c => c.id === customerId);
        if (customerToAdd) {
          return [...prev, customerToAdd];
        }
      }
      
      return prev;
    });
  };
  
  const selectAll = () => {
    setCustomersToRemind([...selectedCustomers]);
  };
  
  const deselectAll = () => {
    setCustomersToRemind([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Payment Reminders</DialogTitle>
          <DialogDescription>
            Send payment reminders to selected customers with outstanding balances.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="template">Message Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="channel">Send Through</Label>
            <Select
              value={selectedChannel}
              onValueChange={setSelectedChannel}
            >
              <SelectTrigger id="channel">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="custom-message">
              Message
              <span className="ml-1 text-muted-foreground text-sm">
                (You can customize)
              </span>
            </Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your reminder message"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <Label>Selected Customers ({customersToRemind.length})</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="border rounded max-h-[200px] overflow-y-auto p-2">
              {selectedCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customers with outstanding balances
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCustomers.map(customer => (
                    <div key={customer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`customer-${customer.id}`}
                        checked={customersToRemind.some(c => c.id === customer.id)}
                        onCheckedChange={() => toggleCustomer(customer.id)}
                      />
                      <Label htmlFor={`customer-${customer.id}`} className="flex-1">
                        {customer.name}
                        <span className="text-muted-foreground text-sm ml-2">
                          (₹{customer.outstandingBalance})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={customersToRemind.length === 0}>
            Send Reminders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
