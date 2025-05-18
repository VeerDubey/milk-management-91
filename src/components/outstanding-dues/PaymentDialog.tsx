
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

type CustomerType = {
  customerId: string;
  customerName: string;
  outstanding: number;
};

type PaymentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: CustomerType | null;
};

export const PaymentDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedCustomer 
}: PaymentDialogProps) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  useEffect(() => {
    if (selectedCustomer) {
      setPaymentAmount(selectedCustomer.outstanding.toString());
      setPaymentNotes('');
      setPaymentMethod('cash');
    }
  }, [selectedCustomer]);

  const recordPayment = () => {
    if (!selectedCustomer) return;
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    toast.success(`Payment of ₹${amount.toFixed(2)} recorded for ${selectedCustomer.customerName}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Customer: {selectedCustomer?.customerName}</p>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Outstanding Amount:</span>
              <span className="font-medium">₹{selectedCustomer?.outstanding.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Amount (₹)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input
              placeholder="Optional notes"
              value={paymentNotes}
              onChange={e => setPaymentNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={recordPayment}>Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
