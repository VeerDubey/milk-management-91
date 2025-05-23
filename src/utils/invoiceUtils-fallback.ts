
// This is a fallback file for invoice utilities in case jsPDF is not available

import { Invoice, Product } from '@/types';

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `INV-${year}${month}-${randomPart}`;
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateDueDate = (dateStr: string, days: number = 30): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
};

export const createInvoiceFromFormData = (data: any) => {
  return {
    id: data.invoiceNumber || generateInvoiceNumber(),
    number: data.invoiceNumber,
    date: data.invoiceDate,
    dueDate: data.dueDate,
    customerId: data.customerId,
    customerName: data.customerName,
    items: data.items || [],
    subtotal: data.items ? data.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) : 0,
    taxRate: data.taxRate || 0,
    taxAmount: calculateTaxAmount(data),
    discountPercentage: data.discountPercentage || 0,
    discountAmount: calculateDiscountAmount(data),
    total: calculateTotal(data),
    notes: data.notes || '',
    terms: data.terms || '',
    status: 'pending'
  };
};

const calculateSubtotal = (data: any) => {
  if (!data.items || !Array.isArray(data.items)) return 0;
  return data.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
};

const calculateDiscountAmount = (data: any) => {
  const subtotal = calculateSubtotal(data);
  const discountPercentage = data.discountPercentage || 0;
  return (subtotal * discountPercentage) / 100;
};

const calculateTaxAmount = (data: any) => {
  const subtotal = calculateSubtotal(data);
  const discountAmount = calculateDiscountAmount(data);
  const taxRate = data.taxRate || 0;
  return ((subtotal - discountAmount) * taxRate) / 100;
};

const calculateTotal = (data: any) => {
  const subtotal = calculateSubtotal(data);
  const discountAmount = calculateDiscountAmount(data);
  const taxAmount = calculateTaxAmount(data);
  return subtotal - discountAmount + taxAmount;
};

// Mock function that returns a data URL for simple preview
export const generateInvoicePreview = (
  invoice: Invoice, 
  companyInfo: any = {}, 
  products: Product[] = [],
  templateId: string = 'standard'
) => {
  console.log('Using fallback invoice preview generator');
  
  // Create a basic HTML invoice that can be displayed
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice Preview</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; }
        .header { display: flex; justify-content: space-between; }
        .company-info { margin-bottom: 20px; }
        .invoice-info { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>${companyInfo.companyName || 'Company Name'}</h1>
          <p>${companyInfo.address || 'Company Address'}</p>
          <p>Phone: ${companyInfo.contactNumber || 'Contact Number'}</p>
          <p>Email: ${companyInfo.email || 'Email'}</p>
          <p>GST: ${companyInfo.gstNumber || 'GST Number'}</p>
        </div>
        <div class="invoice-info">
          <h2>Invoice #${invoice.number || invoice.id}</h2>
          <p>Date: ${invoice.date || 'N/A'}</p>
          <p>Due Date: ${invoice.dueDate || 'N/A'}</p>
        </div>
      </div>
      
      <h3>Customer Information</h3>
      <p>Name: ${invoice.customerName || 'Customer Name'}</p>
      
      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map((item: any) => `
            <tr>
              <td>${item.description || products.find(p => p.id === item.productId)?.name || item.productId}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice?.toFixed(2) || '0.00'}</td>
              <td>₹${item.amount?.toFixed(2) || '0.00'}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total">
            <td colspan="3">Total:</td>
            <td>₹${invoice.total?.toFixed(2) || '0.00'}</td>
          </tr>
        </tfoot>
      </table>
      
      <div>
        <h3>Notes</h3>
        <p>${invoice.notes || ''}</p>
        
        <h3>Terms & Conditions</h3>
        <p>${invoice.termsAndConditions || ''}</p>
        
        <p>Bank Details:</p>
        <p>${companyInfo.bankDetails || 'Bank Details'}</p>
      </div>
    </body>
    </html>
  `;
  
  // Convert HTML to data URL
  const encodedHtml = encodeURIComponent(html);
  return `data:text/html;charset=utf-8,${encodedHtml}`;
};

// Template definitions
export const INVOICE_TEMPLATES = [
  {
    id: 'standard',
    name: 'Standard Template',
    description: 'Clean and professional invoice template',
    previewImage: '/placeholder.svg'
  },
  {
    id: 'modern',
    name: 'Modern Template',
    description: 'Contemporary design with bold colors',
    previewImage: '/placeholder.svg'
  },
  {
    id: 'minimal',
    name: 'Minimal Template',
    description: 'Simple and elegant design',
    previewImage: '/placeholder.svg'
  }
];
