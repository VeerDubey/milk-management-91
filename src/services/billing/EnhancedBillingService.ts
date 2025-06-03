
import { db, InvoiceEntity } from '../database/OfflineDatabase';
import { Invoice, Customer, Product } from '@/types';
import { toast } from 'sonner';

export interface GSTDetails {
  gstNumber: string;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  hsnCode: string;
}

export interface RecurringBilling {
  id: string;
  customerId: string;
  items: any[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextBillDate: string;
  isActive: boolean;
  autoGenerate: boolean;
  amount: number;
  description: string;
}

export interface PaymentIntegration {
  upiId?: string;
  bharatPeId?: string;
  razorpayKey?: string;
  paytmKey?: string;
  phonepeKey?: string;
  googlePayEnabled?: boolean;
}

export interface MonthlyBillSummary {
  customerId: string;
  month: number;
  year: number;
  totalQuantity: number;
  totalAmount: number;
  daysWithOrders: number;
  averageDaily: number;
  items: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalAmount: number;
    averagePrice: number;
  }>;
}

export class EnhancedBillingService {
  private static readonly GST_RATES = {
    milk: 0, // Milk is generally GST exempt
    dairy_products: 5,
    processed_foods: 12,
    beverages: 18,
    other: 18
  };

  private static readonly HSN_CODES = {
    milk: '0401',
    cheese: '0406',
    butter: '0405',
    yogurt: '0403',
    ice_cream: '2105'
  };

  static async generateMonthlyBill(customerId: string, month: number, year: number): Promise<Invoice | null> {
    try {
      const customer = await db.customers.get(customerId);
      if (!customer) {
        toast.error('Customer not found');
        return null;
      }

      const summary = await this.generateMonthlyBillSummary(customerId, month, year);
      if (!summary || summary.totalAmount === 0) {
        toast.info('No orders found for this month');
        return null;
      }

      const gstDetails = this.calculateAdvancedGST(summary.items, summary.totalAmount);
      const total = summary.totalAmount + gstDetails.totalTax;

      const invoiceData: Omit<InvoiceEntity, 'id' | 'lastModified' | 'syncStatus'> = {
        customerId,
        number: this.generateInvoiceNumber(),
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: summary.items.map(item => ({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: item.productId,
          productName: item.productName,
          description: `${item.productName} - Monthly consumption (${summary.daysWithOrders} days)`,
          quantity: item.totalQuantity,
          unitPrice: item.averagePrice,
          amount: item.totalAmount,
          hsnCode: this.getHSNCode(item.productName),
          gstRate: this.getGSTRate(item.productName)
        })),
        subtotal: summary.totalAmount,
        taxRate: gstDetails.totalTax / summary.totalAmount * 100,
        taxAmount: gstDetails.totalTax,
        total,
        status: 'sent',
        notes: `Monthly bill for ${month}/${year} - ${summary.daysWithOrders} delivery days`,
        termsAndConditions: 'Payment due within 30 days. GST as applicable. Thank you for your business.',
        gstDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        centerId: localStorage.getItem('currentCenterId') || 'default'
      };

      const savedInvoice = await db.addWithSync(db.invoices, invoiceData);
      toast.success(`Monthly bill generated for ${customer.name}`);
      return savedInvoice;
    } catch (error) {
      console.error('Error generating monthly bill:', error);
      toast.error('Failed to generate monthly bill');
      return null;
    }
  }

  static async generateMonthlyBillSummary(customerId: string, month: number, year: number): Promise<MonthlyBillSummary | null> {
    try {
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

      if (orders.length === 0) return null;

      const itemSummary = new Map();
      let totalAmount = 0;
      const daysWithOrders = new Set(orders.map(order => order.date.split('T')[0])).size;

      for (const order of orders) {
        for (const item of order.items) {
          const product = await db.products.get(item.productId);
          if (product) {
            const itemTotal = item.quantity * item.unitPrice;
            totalAmount += itemTotal;
            
            if (itemSummary.has(item.productId)) {
              const existing = itemSummary.get(item.productId);
              existing.totalQuantity += item.quantity;
              existing.totalAmount += itemTotal;
              existing.priceSum += item.unitPrice;
              existing.priceCount += 1;
            } else {
              itemSummary.set(item.productId, {
                productId: item.productId,
                productName: product.name,
                totalQuantity: item.quantity,
                totalAmount: itemTotal,
                priceSum: item.unitPrice,
                priceCount: 1
              });
            }
          }
        }
      }

      const items = Array.from(itemSummary.values()).map(item => ({
        ...item,
        averagePrice: item.priceSum / item.priceCount
      }));

      return {
        customerId,
        month,
        year,
        totalQuantity: items.reduce((sum, item) => sum + item.totalQuantity, 0),
        totalAmount,
        daysWithOrders,
        averageDaily: totalAmount / daysWithOrders,
        items
      };
    } catch (error) {
      console.error('Error generating monthly bill summary:', error);
      return null;
    }
  }

  static calculateAdvancedGST(items: any[], subtotal: number): GSTDetails {
    let totalTax = 0;
    
    for (const item of items) {
      const gstRate = this.getGSTRate(item.productName) / 100;
      totalTax += item.totalAmount * gstRate;
    }
    
    const settings = JSON.parse(localStorage.getItem('gstSettings') || '{}');
    const isInterstate = settings.isInterstate || false;
    
    return {
      gstNumber: settings.gstNumber || 'GST_REG_NUMBER',
      cgst: isInterstate ? 0 : totalTax / 2,
      sgst: isInterstate ? 0 : totalTax / 2,
      igst: isInterstate ? totalTax : 0,
      totalTax,
      hsnCode: this.getHSNCode(items[0]?.productName || 'milk')
    };
  }

  static getGSTRate(productName: string): number {
    const name = productName.toLowerCase();
    if (name.includes('milk')) return this.GST_RATES.milk;
    if (name.includes('cheese') || name.includes('butter')) return this.GST_RATES.dairy_products;
    if (name.includes('ice cream') || name.includes('beverage')) return this.GST_RATES.beverages;
    return this.GST_RATES.other;
  }

  static getHSNCode(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('milk')) return this.HSN_CODES.milk;
    if (name.includes('cheese')) return this.HSN_CODES.cheese;
    if (name.includes('butter')) return this.HSN_CODES.butter;
    if (name.includes('yogurt') || name.includes('curd')) return this.HSN_CODES.yogurt;
    if (name.includes('ice cream')) return this.HSN_CODES.ice_cream;
    return this.HSN_CODES.milk;
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
        try {
          await this.generateRecurringInvoice(bill);
          bill.nextBillDate = this.calculateNextBillDate(bill.nextBillDate, bill.frequency);
        } catch (error) {
          console.error('Failed to process recurring bill:', bill.id, error);
        }
      }
    }
    
    localStorage.setItem('recurring_billing', JSON.stringify(recurringBills));
  }

  private static calculateNextBillDate(currentDate: string, frequency: RecurringBilling['frequency']): string {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  }

  private static async generateRecurringInvoice(billing: RecurringBilling): Promise<void> {
    const customer = await db.customers.get(billing.customerId);
    if (!customer) return;

    const invoiceData: Omit<InvoiceEntity, 'id' | 'lastModified' | 'syncStatus'> = {
      customerId: billing.customerId,
      number: this.generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: billing.items,
      subtotal: billing.amount,
      taxRate: 0,
      taxAmount: 0,
      total: billing.amount,
      status: 'sent',
      notes: `Recurring billing: ${billing.description}`,
      termsAndConditions: 'Payment due within 30 days.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      centerId: localStorage.getItem('currentCenterId') || 'default'
    };

    await db.addWithSync(db.invoices, invoiceData);
    console.log('Recurring invoice generated for:', customer.name);
  }

  static generateUPIPaymentLink(amount: number, upiId: string, description: string, customerName?: string): string {
    const params = new URLSearchParams({
      pa: upiId,
      am: amount.toString(),
      cu: 'INR',
      tn: description,
      ...(customerName && { pn: customerName })
    });
    
    return `upi://pay?${params.toString()}`;
  }

  static generateQRCodeForPayment(amount: number, upiId: string, description: string): string {
    const upiLink = this.generateUPIPaymentLink(amount, upiId, description);
    // In a real implementation, you would generate a QR code from this UPI link
    return upiLink;
  }

  static async exportToTally(invoices: Invoice[]): Promise<boolean> {
    try {
      const tallyXML = this.generateTallyXML(invoices);
      
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
            <PARTYLEDGERNAME>${invoice.customerId}</PARTYLEDGERNAME>
            <AMOUNT>${invoice.total}</AMOUNT>
            ${invoice.gstDetails ? `
            <ALLINVENTORYENTRIES.LIST>
              <STOCKITEMNAME>Dairy Products</STOCKITEMNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <RATE>${invoice.subtotal}</RATE>
              <AMOUNT>${invoice.subtotal}</AMOUNT>
            </ALLINVENTORYENTRIES.LIST>
            <LEDGERENTRIES.LIST>
              <LEDGERNAME>CGST</LEDGERNAME>
              <AMOUNT>${invoice.gstDetails.cgst}</AMOUNT>
            </LEDGERENTRIES.LIST>
            <LEDGERENTRIES.LIST>
              <LEDGERNAME>SGST</LEDGERNAME>
              <AMOUNT>${invoice.gstDetails.sgst}</AMOUNT>
            </LEDGERENTRIES.LIST>
            ` : ''}
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

  static async exportToZohoBooks(invoices: Invoice[]): Promise<boolean> {
    try {
      const zohoData = invoices.map(invoice => ({
        customer_name: invoice.customerId,
        invoice_number: invoice.number,
        date: invoice.date,
        due_date: invoice.dueDate,
        line_items: invoice.items.map(item => ({
          item_name: item.productName,
          description: item.description,
          quantity: item.quantity,
          rate: item.unitPrice,
          amount: item.amount
        })),
        sub_total: invoice.subtotal,
        tax_total: invoice.taxAmount,
        total: invoice.total,
        status: invoice.status
      }));

      const csvContent = this.convertToCSV(zohoData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zoho_books_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast.success('Zoho Books export completed');
      return true;
    } catch (error) {
      console.error('Zoho Books export failed:', error);
      toast.error('Failed to export to Zoho Books');
      return false;
    }
  }

  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}
