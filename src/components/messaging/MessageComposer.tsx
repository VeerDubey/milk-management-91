
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Users, 
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/data/DataContext';
import { MessagingService, TemplateService } from '@/services/MessagingService';

interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomer?: string;
  channel?: 'sms' | 'whatsapp' | 'email';
}

export default function MessageComposer({ 
  isOpen, 
  onClose, 
  preselectedCustomer,
  channel = 'sms' 
}: MessageComposerProps) {
  const { customers } = useData();
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'email'>(channel);
  const [recipients, setRecipients] = useState<string[]>(preselectedCustomer ? [preselectedCustomer] : []);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendMode, setSendMode] = useState<'individual' | 'bulk'>('individual');

  const templates = TemplateService.getTemplates().filter(t => t.channel === selectedChannel);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const handleAddRecipient = (customerId: string) => {
    if (!recipients.includes(customerId)) {
      setRecipients(prev => [...prev, customerId]);
    }
  };

  const handleRemoveRecipient = (customerId: string) => {
    setRecipients(prev => prev.filter(id => id !== customerId));
  };

  const validateMessage = () => {
    if (recipients.length === 0) {
      toast.error('Please select at least one recipient');
      return false;
    }

    if (!message.trim()) {
      toast.error('Message content is required');
      return false;
    }

    if (selectedChannel === 'email' && !subject.trim()) {
      toast.error('Email subject is required');
      return false;
    }

    if (selectedChannel === 'sms' && message.length > 160) {
      toast.error('SMS message exceeds 160 characters');
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateMessage()) return;

    setIsSending(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const customerId of recipients) {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) continue;

        // Apply template variables if a template was used
        let finalMessage = message;
        if (selectedTemplate) {
          const template = templates.find(t => t.id === selectedTemplate);
          if (template) {
            finalMessage = TemplateService.applyTemplate(template, {
              customerName: customer.name,
              companyName: 'Vikas Milk Centre',
              phone: customer.phone || '',
              address: customer.address || '',
              amount: customer.outstandingBalance?.toString() || '0'
            });
          }
        }

        const success = await MessagingService.sendMessage({
          recipient: {
            name: customer.name,
            phone: customer.phone,
            email: customer.email
          },
          content: selectedChannel === 'email' ? `${subject}\n\n${finalMessage}` : finalMessage,
          channel: selectedChannel
        });

        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} message(s) sent successfully`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} message(s) failed to send`);
      }

      if (successCount > 0) {
        onClose();
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Failed to send messages');
    } finally {
      setIsSending(false);
    }
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const selectedCustomers = customers.filter(c => recipients.includes(c.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getChannelIcon(selectedChannel)}
            Send {selectedChannel.toUpperCase()} Message
          </DialogTitle>
          <DialogDescription>
            Compose and send messages to your customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>Channel</Label>
            <div className="flex gap-2">
              {['sms', 'whatsapp', 'email'].map((ch) => (
                <Button
                  key={ch}
                  variant={selectedChannel === ch ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChannel(ch as any)}
                  className="flex items-center gap-2"
                >
                  {getChannelIcon(ch)}
                  {ch.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label>Recipients</Label>
            <Select onValueChange={handleAddRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select customers..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem 
                    key={customer.id} 
                    value={customer.id}
                    disabled={recipients.includes(customer.id)}
                  >
                    {customer.name} - {customer.phone || customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCustomers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCustomers.map((customer) => (
                  <Badge 
                    key={customer.id} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {customer.name}
                    <button
                      onClick={() => handleRemoveRecipient(customer.id)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject (Email only) */}
          {selectedChannel === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              {selectedChannel === 'sms' && (
                <span className={`text-sm ${message.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {message.length}/160
                </span>
              )}
            </div>
            <Textarea
              id="message"
              placeholder={`Enter your ${selectedChannel} message here...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={selectedChannel === 'email' ? 8 : 4}
            />
          </div>

          {/* Preview */}
          {message && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {selectedChannel === 'email' && subject && (
                  <div className="font-medium mb-2">Subject: {subject}</div>
                )}
                {message}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isSending || recipients.length === 0 || !message.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
