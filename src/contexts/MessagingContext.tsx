
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TemplateService, defaultTemplates, MessagingService } from '../services/MessagingService';
import { toast } from 'sonner';

type MessageChannel = "whatsapp" | "email" | "sms";
type MessageTemplate = {
  id: string;
  name: string;
  content: string;
  channel: MessageChannel;
};

interface MessagingContextType {
  templates: MessageTemplate[];
  selectedTemplate: MessageTemplate | null;
  setSelectedTemplate: (template: MessageTemplate | null) => void;
  addTemplate: (template: Omit<MessageTemplate, "id">) => void;
  updateTemplate: (template: MessageTemplate) => void;
  deleteTemplate: (id: string) => void;
  sendMessage: (recipient: any, content: string, channels: MessageChannel[]) => Promise<boolean>;
  applyTemplate: (templateId: string, data: Record<string, string>) => string;
  isSending: boolean;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Load templates on mount
  useEffect(() => {
    const loadedTemplates = TemplateService.getTemplates();
    setTemplates(loadedTemplates);
  }, []);

  const addTemplate = (template: Omit<MessageTemplate, "id">) => {
    const newTemplate = TemplateService.addTemplate(template);
    setTemplates(prev => [...prev, newTemplate]);
    toast.success(`Template "${template.name}" created`);
    return newTemplate;
  };

  const updateTemplate = (template: MessageTemplate) => {
    const success = TemplateService.updateTemplate(template);
    if (success) {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(template);
      }
      toast.success(`Template "${template.name}" updated`);
    }
    return success;
  };

  const deleteTemplate = (id: string) => {
    const success = TemplateService.deleteTemplate(id);
    if (success) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      toast.success("Template deleted");
    }
    return success;
  };

  const applyTemplate = (templateId: string, data: Record<string, string>): string => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return "";
    
    return TemplateService.applyTemplate(template, data);
  };

  const sendMessage = async (
    recipient: {name: string, phone?: string, email?: string},
    content: string,
    channels: MessageChannel[]
  ): Promise<boolean> => {
    try {
      setIsSending(true);
      let success = false;
      
      for (const channel of channels) {
        // Skip channels that don't have required contact info
        if ((channel === 'email' && !recipient.email) || 
            ((channel === 'sms' || channel === 'whatsapp') && !recipient.phone)) {
          continue;
        }
        
        const result = await MessagingService.sendMessage({
          recipient,
          content,
          channel
        });
        
        if (result) success = true;
      }
      
      if (success) {
        toast.success(`Message sent to ${recipient.name}`);
      } else {
        toast.error("Failed to send message through any channel");
      }
      
      return success;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast.error("Error sending message");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MessagingContext.Provider value={{
      templates,
      selectedTemplate,
      setSelectedTemplate,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      sendMessage,
      applyTemplate,
      isSending
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging(): MessagingContextType {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
