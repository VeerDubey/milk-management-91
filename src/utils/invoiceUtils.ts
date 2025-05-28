
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Invoice } from '@/types';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `INV${year}${month}${timestamp}`;
};

export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const generateDueDate = (invoiceDate: string, daysToAdd: number = 15): string => {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + daysToAdd);
  return formatDateForInput(date);
};

export const createInvoiceFromFormData = (formData: any): Invoice => {
  const subtotal = formData.items.reduce((sum: number, item: any) => sum + item.amount, 0);
  const discountAmount = (subtotal * (formData.discountPercentage || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * (formData.taxRate || 0)) / 100;
  const total = afterDiscount + taxAmount;

  return {
    id: formData.invoiceNumber,
    number: formData.invoiceNumber,
    customerId: formData.customerId,
    customerName: formData.customerName,
    date: formData.invoiceDate,
    dueDate: formData.dueDate,
    items: formData.items.map((item: any) => ({
      id: `item-${Date.now()}-${Math.random()}`,
      productId: item.productId,
      productName: item.productName || '',
      quantity: item.quantity,
      unitPrice: item.rate,
      unit: 'unit',
      amount: item.amount
    })),
    subtotal: subtotal,
    taxAmount: taxAmount,
    discountAmount: discountAmount,
    total: total,
    status: 'draft',
    notes: formData.notes || '',
    termsAndConditions: formData.terms || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const INVOICE_TEMPLATES = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Clean and professional template'
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with colors'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean layout'
  }
};

export const generateInvoicePreview = (
  invoice: Invoice,
  companyInfo: any,
  products: any[] = [],
  templateId: string = 'standard'
): string => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info { text-align: left; }
        .invoice-info { text-align: right; }
        .customer-info { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total-row { font-weight: bold; }
        .notes { margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h2>${companyInfo?.companyName || 'Your Company'}</h2>
          <p>${companyInfo?.address || 'Your Address'}</p>
          <p>${companyInfo?.contactNumber || 'Your Phone'}</p>
        </div>
        <div class="invoice-info">
          <h1>INVOICE</h1>
          <p>Invoice #: ${invoice.number}</p>
          <p>Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}</p>
          <p>Due Date: ${format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
        </div>
      </div>
      
      <div class="customer-info">
        <h3>Bill To:</h3>
        <p>${invoice.customerName}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice?.toFixed(2)}</td>
              <td>₹${item.amount?.toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td>₹${invoice.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      ${invoice.notes ? `<div class="notes"><h4>Notes:</h4><p>${invoice.notes}</p></div>` : ''}
      ${invoice.termsAndConditions ? `<div class="notes"><h4>Terms & Conditions:</h4><p>${invoice.termsAndConditions}</p></div>` : ''}
    </body>
    </html>
  `;
  
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
};

export const generateInvoicePdf = (invoiceData: any) => {
  const doc = new jsPDF();
  (doc as any).autoTable = autoTable.bind(doc);
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(139, 92, 246);
  doc.text('INVOICE', 20, 30);
  
  // Company info (you can customize this)
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Vikas Milk Centre', 20, 45);
  doc.text('Your Address Here', 20, 55);
  doc.text('Phone: Your Phone Number', 20, 65);
  
  // Invoice details
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 140, 45);
  doc.text(`Date: ${format(new Date(invoiceData.date), 'dd/MM/yyyy')}`, 140, 55);
  doc.text(`Due Date: ${format(new Date(invoiceData.dueDate), 'dd/MM/yyyy')}`, 140, 65);
  
  // Customer info
  doc.text('Bill To:', 20, 85);
  doc.text(invoiceData.customer.name, 20, 95);
  if (invoiceData.customer.address) {
    doc.text(invoiceData.customer.address, 20, 105);
  }
  if (invoiceData.customer.phone) {
    doc.text(`Phone: ${invoiceData.customer.phone}`, 20, 115);
  }
  
  // Items table
  const headers = ['Description', 'Quantity', 'Unit Price', 'Amount'];
  const data = invoiceData.items.map((item: any) => [
    item.productName,
    item.quantity.toString(),
    `₹${item.unitPrice.toFixed(2)}`,
    `₹${(item.quantity * item.unitPrice).toFixed(2)}`
  ]);
  
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 130,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Subtotal: ₹${invoiceData.subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Total: ₹${invoiceData.total.toFixed(2)}`, 140, finalY + 10);
  
  // Notes
  if (invoiceData.notes) {
    doc.text('Notes:', 20, finalY + 20);
    doc.text(invoiceData.notes, 20, finalY + 30);
  }
  
  // Terms
  if (invoiceData.termsAndConditions) {
    doc.text('Terms & Conditions:', 20, finalY + 45);
    doc.text(invoiceData.termsAndConditions, 20, finalY + 55);
  }
  
  const filename = `invoice-${invoiceData.invoiceNumber}.pdf`;
  doc.save(filename);
};

export const printInvoice = (invoiceData: any) => {
  const doc = new jsPDF();
  (doc as any).autoTable = autoTable.bind(doc);
  
  // Generate the same PDF content as above
  generateInvoicePdf(invoiceData);
  
  // Print instead of download
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
