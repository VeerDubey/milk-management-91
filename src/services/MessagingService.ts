
import { toast } from "sonner";

type MessageChannel = "whatsapp" | "email" | "sms";
type MessageTemplate = {
  id: string;
  name: string;
  content: string;
  channel: MessageChannel;
};

interface SendMessageParams {
  recipient: {
    name: string;
    phone?: string;
    email?: string;
  };
  content: string;
  channel: MessageChannel;
}

export class MessagingService {
  private static mockDelay = 1000;

  static async sendWhatsApp(params: SendMessageParams): Promise<boolean> {
    try {
      if (!params.recipient.phone) {
        throw new Error("Phone number is required for WhatsApp");
      }
      
      console.log("Sending WhatsApp message:", params);
      // In a real implementation, this would call a WhatsApp API
      // For now, we'll simulate a delay and return success
      await new Promise(resolve => setTimeout(resolve, this.mockDelay));
      return true;
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      return false;
    }
  }

  static async sendEmail(params: SendMessageParams): Promise<boolean> {
    try {
      if (!params.recipient.email) {
        throw new Error("Email is required for email messages");
      }
      
      console.log("Sending email:", params);
      // In a real implementation, this would call an email API
      // For now, we'll simulate a delay and return success
      await new Promise(resolve => setTimeout(resolve, this.mockDelay));
      return true;
    }
    catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  static async sendSMS(params: SendMessageParams): Promise<boolean> {
    try {
      if (!params.recipient.phone) {
        throw new Error("Phone number is required for SMS");
      }
      
      console.log("Sending SMS:", params);
      // In a real implementation, this would call an SMS API
      // For now, we'll simulate a delay and return success
      await new Promise(resolve => setTimeout(resolve, this.mockDelay));
      return true;
    }
    catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  }

  static async sendMessage(params: SendMessageParams): Promise<boolean> {
    try {
      switch (params.channel) {
        case "whatsapp":
          return await this.sendWhatsApp(params);
        case "email":
          return await this.sendEmail(params);
        case "sms":
          return await this.sendSMS(params);
        default:
          throw new Error(`Unsupported channel: ${params.channel}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}

// Default message templates
export const defaultTemplates: MessageTemplate[] = [
  {
    id: "payment-reminder",
    name: "Payment Reminder",
    content: "Dear {customerName},\n\nThis is a friendly reminder that you have an outstanding balance of ₹{amount}. Please arrange for payment at your earliest convenience.\n\nThank you,\n{companyName}",
    channel: "email"
  },
  {
    id: "delivery-notification",
    name: "Delivery Notification",
    content: "Dear {customerName},\n\nYour order #{orderId} has been dispatched and will be delivered today. Thank you for your business.\n\n{companyName}",
    channel: "sms"
  },
  {
    id: "whatsapp-reminder",
    name: "WhatsApp Payment Reminder",
    content: "Hi {customerName}, just a quick reminder about your pending payment of ₹{amount}. Please settle at your earliest convenience. Thanks, {companyName}",
    channel: "whatsapp"
  }
];

// Template management functions
export class TemplateService {
  private static readonly STORAGE_KEY = "message_templates";

  static getTemplates(): MessageTemplate[] {
    try {
      const templatesJson = localStorage.getItem(this.STORAGE_KEY);
      if (!templatesJson) {
        // Initialize with default templates if none exist
        this.saveTemplates(defaultTemplates);
        return defaultTemplates;
      }
      return JSON.parse(templatesJson);
    } catch (error) {
      console.error("Error loading templates:", error);
      return defaultTemplates;
    }
  }

  static saveTemplates(templates: MessageTemplate[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error("Error saving templates:", error);
    }
  }

  static addTemplate(template: Omit<MessageTemplate, "id">): MessageTemplate {
    const templates = this.getTemplates();
    const newTemplate = {
      ...template,
      id: crypto.randomUUID()
    };
    templates.push(newTemplate);
    this.saveTemplates(templates);
    return newTemplate;
  }

  static updateTemplate(template: MessageTemplate): boolean {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index === -1) return false;
    
    templates[index] = template;
    this.saveTemplates(templates);
    return true;
  }

  static deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    if (filteredTemplates.length === templates.length) return false;
    
    this.saveTemplates(filteredTemplates);
    return true;
  }

  static applyTemplate(template: MessageTemplate, data: Record<string, string>): string {
    let content = template.content;
    
    // Replace all placeholders with data values
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{${key}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return content;
  }
}
