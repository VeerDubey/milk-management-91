
import { db } from '../database/OfflineDatabase';
import { Invoice, Customer, Product } from '@/types';
import { toast } from 'sonner';

export interface GSTDetails {
  gstNumber: string;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

export interface RecurringBilling {
  id: string;
  customerId: string;
  items: any[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextBillDate: string;
  isActive: boolean;
  autoGenerate: boolean;
}

export interface PaymentIntegration {
  upiId?: string;
  bharatPeId?: string;
  razorpayKey?: string;
  paytmKey?: string;
}

export class AdvancedBillingService {
  private static readonly GST_RATES = {
    milk: 0, // Milk is generally GST exempt
    dairy_products: 5,
    processed_foods: 12,
    other: 18
  };

  static async generateMonthlyBill(customerId: string, month: number, year: number): Promise<Invoice | null> {
    try {
      const customer = await db.customers.get(customerId);
      if (!customer) {
        toast.error('Customer not found');
        return null;
      }

      // Get all orders for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const orders = await db.orders
        .where('customerId')
        .equals(customerId)
        .and(order => {
          const orderDate = new Date(order.date);
          return orderDate >= startDate && orderDate <= endDate;
        })
        .toArray();

      if (orders.length === 0) {
        toast.info('No orders found for this month');
        return null;
      }

      // Calculate totals
      let subtotal = 0;
      const invoiceItems = [];

      for (const order of orders) {
        for (const item of order.items) {
          const product = await db.products.get(item.productId);
          if (product) {
            const itemTotal = item.quantity * item.unitPrice;
            subtotal += itemTotal;
            
            invoiceItems.push({
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId: item.productId,
              productName: product.name,
              description: `${product.name} - Monthly consumption`,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: itemTotal
            });
          }
        }
      }

      const gstDetails = this.calculateGST(invoiceItems, subtotal);
      const total = subtotal + gstDetails.totalTax;

      const invoice: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        number: this.generateInvoiceNumber(),
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: invoiceItems,
        subtotal,
        taxRate: gstDetails.totalTax / subtotal * 100,
        taxAmount: gstDetails.totalTax,
        total,
        status: 'sent',
        notes: `Monthly bill for ${month}/${year}`,
        termsAndConditions: 'Payment due within 30 days. GST as applicable.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.addWithSync(db.invoices, invoice);
      toast.success('Monthly bill generated successfully');
      return invoice;
    } catch (error) {
      console.error('Error generating monthly bill:', error);
      toast.error('Failed to generate monthly bill');
      return null;
    }
  }

  static calculateGST(items: any[], subtotal: number): GSTDetails {
    // Simplified GST calculation - in reality, this would be more complex
    const gstRate = 0.05; // 5% for dairy products
    const totalTax = subtotal * gstRate;
    
    return {
      gstNumber: 'GST_REG_NUMBER', // Should come from settings
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      igst: 0, // For interstate sales
      totalTax
    };
  }

  static generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `VMC${year}${month}${sequence}`;
  }

  static async setupRecurringBilling(billing: Omit<RecurringBilling, 'id'>): Promise<string> {
    const id = `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const recurringBilling: RecurringBilling = { ...billing, id };
    
    // Store in local database (in a real app, this would be a proper table)
    const existing = JSON.parse(localStorage.getItem('recurring_billing') || '[]');
    existing.push(recurringBilling);
    localStorage.setItem('recurring_billing', JSON.stringify(existing));
    
    toast.success('Recurring billing setup successfully');
    return id;
  }

  static async processRecurringBills(): Promise<void> {
    const recurringBills = JSON.parse(localStorage.getItem('recurring_billing') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    for (const bill of recurringBills) {
      if (bill.isActive && bill.autoGenerate && bill.nextBillDate <= today) {
        // Generate invoice
        // Update next bill date based on frequency
        // This is a simplified version
        console.log('Processing recurring bill:', bill.id);
      }
    }
  }

  static generateUPIPaymentLink(amount: number, upiId: string, description: string): string {
    const params = new URLSearchParams({
      pa: upiId,
      am: amount.toString(),
      cu: 'INR',
      tn: description
    });
    
    return `upi://pay?${params.toString()}`;
  }

  static async exportToTally(invoices: Invoice[]): Promise<boolean> {
    try {
      // Generate Tally-compatible XML format
      const tallyXML = this.generateTallyXML(invoices);
      
      // Create downloadable file
      const blob = new Blob([tallyXML], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tally_export_${new Date().toISOString().split('T')[0]}.xml`;
      a.click();
      
      toast.success('Tally export completed');
      return true;
    } catch (error) {
      console.error('Tally export failed:', error);
      toast.error('Failed to export to Tally');
      return false;
    }
  }

  private static generateTallyXML(invoices: Invoice[]): string {
    // Simplified Tally XML generation
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Vikas Milk Centre</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>`;

    for (const invoice of invoices) {
      xml += `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${invoice.date}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${invoice.number}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${invoice.customerName || 'Customer'}</PARTYLEDGERNAME>
            <AMOUNT>${invoice.total}</AMOUNT>
          </VOUCHER>
        </TALLYMESSAGE>`;
    }

    xml += `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    return xml;
  }
}
