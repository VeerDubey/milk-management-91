
/**
 * Fallback utilities for invoice generation when jspdf is not available
 */

import { Invoice } from '@/types';

// Generate a simple HTML preview for invoices when PDF generation fails
export const generateFallbackPreview = (invoice: Invoice): string => {
  // Create a simple HTML invoice
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number || invoice.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info { margin-bottom: 20px; }
        .customer-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>INVOICE</h2>
        <div>
          <p><strong>Invoice #:</strong> ${invoice.number || invoice.id}</p>
          <p><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}</p>
        </div>
      </div>
      
      <div class="company-info">
        <h3>From:</h3>
        <p>Milk Center</p>
        <p>123 Dairy Lane, Milk City</p>
      </div>
      
      <div class="customer-info">
        <h3>To:</h3>
        <p>${invoice.customerName || 'Customer'}</p>
      </div>
      
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
          ${(invoice.items || []).map(item => `
            <tr>
              <td>${item.description || 'Product'}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice?.toFixed(2) || '0.00'}</td>
              <td>₹${item.amount?.toFixed(2) || '0.00'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        <p>Total: ₹${invoice.total?.toFixed(2) || '0.00'}</p>
      </div>
      
      <div>
        <h3>Notes:</h3>
        <p>${invoice.notes || ''}</p>
      </div>
    </body>
    </html>
  `;
  
  // Return as data URL
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
};

// Simple utility for currency formatting
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '₹0.00';
  return `₹${value.toFixed(2)}`;
};

// Exports for compatibility with other code
export const exportToHtml = (invoice: Invoice): string => {
  return generateFallbackPreview(invoice);
};

export const exportToPdf = (): null => {
  console.warn('PDF export is not available in this environment');
  return null;
};
