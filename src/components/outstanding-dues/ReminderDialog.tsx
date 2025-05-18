
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

  useEffect(() => {
    if (selectedCustomer) {
      setReminderMessage(
        `Dear ${selectedCustomer.customerName},\n\nThis is a friendly reminder that you have an outstanding balance of ₹${selectedCustomer.outstanding.toFixed(2)}.\n\nPlease arrange for payment at your earliest convenience.\n\nThank you,\nVikas Milk Centre`
      );
    }
  }, [selectedCustomer]);

  const sendReminder = () => {
    if (!selectedCustomer) return;
    
    toast.success(`Payment reminder sent to ${selectedCustomer.customerName}`);
    onOpenChange(false);
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
                <input type="checkbox" id="sms" defaultChecked />
                <label htmlFor="sms">SMS</label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="email" 
                  defaultChecked={!!selectedCustomer?.email} 
                  disabled={!selectedCustomer?.email} 
                />
                <label htmlFor="email">Email</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="whatsapp" defaultChecked />
                <label htmlFor="whatsapp">WhatsApp</label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={sendReminder}>Send Reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
