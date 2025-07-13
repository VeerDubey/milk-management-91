
import { toast } from 'sonner';

export interface PaymentRecord {
  id: string;
  customerId: string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'cheque' | 'bank_transfer' | 'card';
  referenceNumber?: string;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  chequeDetails?: {
    chequeNumber: string;
    bankName: string;
    chequeDate: string;
  };
  upiDetails?: {
    transactionId: string;
    upiId: string;
  };
}

export interface PaymentSummary {
  totalReceived: number;
  pendingAmount: number;
  todaysCollection: number;
  methodWiseBreakdown: Record<string, number>;
  overduePayments: number;
}

class PaymentService {
  private storageKey = 'payment_records';

  getPayments(): PaymentRecord[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  addPayment(payment: Omit<PaymentRecord, 'id'>): PaymentRecord {
    const payments = this.getPayments();
    const newPayment: PaymentRecord = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    payments.push(newPayment);
    localStorage.setItem(this.storageKey, JSON.stringify(payments));
    
    toast.success(`Payment of ₹${payment.amount} recorded successfully`);
    return newPayment;
  }

  updatePaymentStatus(paymentId: string, status: PaymentRecord['status'], approvedBy?: string): void {
    const payments = this.getPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex !== -1) {
      payments[paymentIndex].status = status;
      if (approvedBy) {
        payments[paymentIndex].approvedBy = approvedBy;
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(payments));
      toast.success(`Payment status updated to ${status}`);
    }
  }

  getPaymentSummary(customerId?: string, dateRange?: { from: string; to: string }): PaymentSummary {
    let payments = this.getPayments();
    
    if (customerId) {
      payments = payments.filter(p => p.customerId === customerId);
    }
    
    if (dateRange) {
      payments = payments.filter(p => 
        p.date >= dateRange.from && p.date <= dateRange.to
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const completedPayments = payments.filter(p => p.status === 'completed');
    
    return {
      totalReceived: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      todaysCollection: completedPayments.filter(p => p.date === today).reduce((sum, p) => sum + p.amount, 0),
      methodWiseBreakdown: this.getMethodWiseBreakdown(completedPayments),
      overduePayments: payments.filter(p => p.status === 'pending' && p.date < today).length
    };
  }

  private getMethodWiseBreakdown(payments: PaymentRecord[]): Record<string, number> {
    return payments.reduce((breakdown, payment) => {
      breakdown[payment.paymentMethod] = (breakdown[payment.paymentMethod] || 0) + payment.amount;
      return breakdown;
    }, {} as Record<string, number>);
  }

  exportPayments(dateRange?: { from: string; to: string }): string {
    let payments = this.getPayments();
    
    if (dateRange) {
      payments = payments.filter(p => 
        p.date >= dateRange.from && p.date <= dateRange.to
      );
    }

    const headers = [
      'Date', 'Customer ID', 'Amount', 'Method', 'Status', 'Reference', 'Notes'
    ];
    
    const rows = payments.map(payment => [
      payment.date,
      payment.customerId,
      payment.amount.toString(),
      payment.paymentMethod,
      payment.status,
      payment.referenceNumber || '',
      payment.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
}

export const paymentService = new PaymentService();
