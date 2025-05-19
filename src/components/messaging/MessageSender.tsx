
import React, { useState, useEffect } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Send, MessageSquare, Mail, Phone } from 'lucide-react';

interface MessageSenderProps {
  recipient: {
    name: string;
    phone?: string;
    email?: string;
  };
  initialMessage?: string;
  onSent?: () => void;
  onCancel?: () => void;
}

export const MessageSender = ({ 
  recipient, 
  initialMessage = "", 
  onSent, 
  onCancel 
}: MessageSenderProps) => {
  const { 
    templates, 
    selectedTemplate, 
    setSelectedTemplate, 
    sendMessage, 
    isSending 
  } = useMessaging();
  
  const [message, setMessage] = useState(initialMessage);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  
  // Initialize channels based on available recipient info
  useEffect(() => {
    const channels: string[] = [];
    if (recipient.email) channels.push('email');
    if (recipient.phone) {
      channels.push('sms');
      channels.push('whatsapp');
    }
    setSelectedChannels(channels);
  }, [recipient]);
  
  // Update message when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const content = selectedTemplate.content
        .replace(/{customerName}/g, recipient.name)
        .replace(/{companyName}/g, 'Your Company'); // This should come from company settings
      setMessage(content);
    }
  }, [selectedTemplate, recipient]);
  
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId) || null;
    setSelectedTemplate(template);
  };
  
  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel)
        ? prev.filter(ch => ch !== channel)
        : [...prev, channel]
    );
  };
  
  const handleSend = async () => {
    if (selectedChannels.length === 0) {
      return;
    }
    
    const success = await sendMessage(
      recipient,
      message,
      selectedChannels as any[]
    );
    
    if (success && onSent) {
      onSent();
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Message</CardTitle>
        <CardDescription>
          Send a message to {recipient.name} via multiple channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <Label htmlFor="template" className="mb-1">Message Template</Label>
            <Select 
              value={selectedTemplate?.id || ""} 
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="w-full sm:max-w-[200px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No template</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Send via</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="whatsapp" 
                checked={selectedChannels.includes('whatsapp')}
                onCheckedChange={() => handleChannelToggle('whatsapp')}
                disabled={!recipient.phone}
              />
              <Label htmlFor="whatsapp" className="flex items-center cursor-pointer">
                <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="email" 
                checked={selectedChannels.includes('email')}
                onCheckedChange={() => handleChannelToggle('email')}
                disabled={!recipient.email}
              />
              <Label htmlFor="email" className="flex items-center cursor-pointer">
                <Mail className="h-4 w-4 mr-1" /> Email
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sms" 
                checked={selectedChannels.includes('sms')}
                onCheckedChange={() => handleChannelToggle('sms')}
                disabled={!recipient.phone}
              />
              <Label htmlFor="sms" className="flex items-center cursor-pointer">
                <Phone className="h-4 w-4 mr-1" /> SMS
              </Label>
            </div>
          </div>
          
          {selectedChannels.length === 0 && (
            <p className="text-sm text-amber-500">
              Please select at least one delivery method
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="recipient">To</Label>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <span className="font-medium">{recipient.name}</span>
            </div>
            {recipient.phone && (
              <div className="text-sm text-muted-foreground flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1" /> {recipient.phone}
              </div>
            )}
            {recipient.email && (
              <div className="text-sm text-muted-foreground flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1" /> {recipient.email}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea 
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[180px]"
            placeholder="Enter your message here..."
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{message.length} characters</span>
            {selectedChannels.includes('sms') && (
              <span>SMS: ~{Math.ceil(message.length / 160)} message(s)</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          className="ml-auto" 
          onClick={handleSend} 
          disabled={isSending || message.trim() === '' || selectedChannels.length === 0}
        >
          {isSending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Send Message</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
