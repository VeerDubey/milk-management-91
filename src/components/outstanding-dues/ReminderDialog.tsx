
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessagingService } from '@/services/MessagingService';

type CustomerType = {
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  outstanding: number;
};

type ReminderDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: CustomerType | null;
};

export const ReminderDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedCustomer 
}: ReminderDialogProps) => {
  const [reminderMessage, setReminderMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCustomer) {
      setReminderMessage(
        `Dear ${selectedCustomer.customerName},\n\nThis is a friendly reminder that you have an outstanding balance of ₹${selectedCustomer.outstanding.toFixed(2)}.\n\nPlease arrange for payment at your earliest convenience.\n\nThank you,\nVikas Milk Centre`
      );
      
      // Set default channels based on available contact info
      const availableChannels = [];
      if (selectedCustomer.phone) {
        availableChannels.push('sms', 'whatsapp');
      }
      if (selectedCustomer.email) {
        availableChannels.push('email');
      }
      setChannels(availableChannels);
    }
  }, [selectedCustomer]);

  const toggleChannel = (channel: string) => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
    );
  };

  const sendReminder = async () => {
    if (!selectedCustomer || channels.length === 0) return;
    
    setIsSending(true);
    try {
      let success = false;
      
      for (const channel of channels) {
        if ((channel === 'email' && !selectedCustomer.email) || 
            ((channel === 'sms' || channel === 'whatsapp') && !selectedCustomer.phone)) {
          continue;
        }
        
        const result = await MessagingService.sendMessage({
          recipient: {
            name: selectedCustomer.customerName,
            phone: selectedCustomer.phone,
            email: selectedCustomer.email,
          },
          content: reminderMessage,
          channel: channel as any
        });
        
        if (result) success = true;
      }
      
      if (success) {
        toast.success(`Payment reminder sent to ${selectedCustomer.customerName}`);
        onOpenChange(false);
      } else {
        toast.error("Failed to send reminder through any channel");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">To: {selectedCustomer?.customerName}</p>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span>Phone: {selectedCustomer?.phone}</span>
              {selectedCustomer?.email && <span>Email: {selectedCustomer?.email}</span>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reminder Message</label>
            <textarea 
              className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2"
              value={reminderMessage}
              onChange={e => setReminderMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Send via</label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="sms" 
                  checked={channels.includes('sms')} 
                  onChange={() => toggleChannel('sms')}
                  disabled={!selectedCustomer?.phone}
                />
                <label htmlFor="sms">SMS</label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="email" 
                  checked={channels.includes('email')} 
                  onChange={() => toggleChannel('email')}
                  disabled={!selectedCustomer?.email} 
                />
                <label htmlFor="email">Email</label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="whatsapp" 
                  checked={channels.includes('whatsapp')}
                  onChange={() => toggleChannel('whatsapp')}
                  disabled={!selectedCustomer?.phone}
                />
                <label htmlFor="whatsapp">WhatsApp</label>
              </div>
            </div>
            {channels.length === 0 && (
              <p className="text-sm text-amber-500">
                Please select at least one delivery method
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={sendReminder} 
            disabled={isSending || channels.length === 0}
          >
            {isSending ? 'Sending...' : 'Send Reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
