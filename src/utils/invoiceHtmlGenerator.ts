
import { Invoice } from '@/types';

/**
 * Generate a clean HTML preview for invoices
 */
export function generateInvoiceHtml(invoice: Invoice, companyInfo?: any): string {
  // Format currency helper
  const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) return '₹0.00';
    return `₹${value.toFixed(2)}`;
  };

  // Format date helper
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Company info with defaults
  const company = companyInfo || {
    companyName: 'Milk Center',
    address: '123 Dairy Lane, Milk City',
    contactNumber: '+91 98765 43210',
    email: 'info@milkcenter.com',
    gstNumber: '29ABCDE1234F1Z5',
  };

  // Generate HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number || invoice.id}</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          margin: 0; 
          padding: 40px;
          background: white;
          color: #333;
          line-height: 1.5;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #eaeaea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 40px;
          border-radius: 8px;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #f5f5f5;
          padding-bottom: 20px;
        }
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }
        .invoice-id {
          font-size: 16px;
          color: #666;
        }
        .company-info, .customer-info { 
          margin-bottom: 30px; 
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #444;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 25px 0; 
        }
        th { 
          background-color: #f9f9f9; 
          padding: 12px 15px;
          text-align: left; 
          font-weight: 600;
          font-size: 14px;
          border-bottom: 2px solid #eaeaea;
          color: #555;
        }
        td { 
          padding: 12px 15px; 
          border-bottom: 1px solid #eaeaea;
          color: #333;
          font-size: 14px;
        }
        .amount-col {
          text-align: right;
        }
        .total-section { 
          text-align: right; 
          padding: 20px 15px;
          background: #f9f9f9;
          border-radius: 6px;
          margin-top: 30px;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          padding: 8px 0;
        }
        .total-label {
          font-weight: 500;
          width: 150px;
        }
        .total-value {
          width: 120px;
          font-weight: 500;
        }
        .grand-total {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          border-top: 2px solid #eaeaea;
          padding-top: 12px;
          margin-top: 12px;
        }
        .notes {
          margin-top: 40px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 6px;
          color: #666;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 13px;
          color: #999;
          border-top: 1px solid #eaeaea;
          padding-top: 20px;
        }
        @media print {
          body { 
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          .invoice-container {
            box-shadow: none;
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div>
            <h1 class="invoice-title">INVOICE</h1>
            <div class="invoice-id">
              #${invoice.number || invoice.id}
            </div>
          </div>
          <div>
            <div><strong>Date:</strong> ${formatDate(invoice.date || new Date().toISOString().slice(0, 10))}</div>
            <div><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</div>
            ${invoice.status ? `<div><strong>Status:</strong> ${invoice.status}</div>` : ''}
          </div>
        </div>
        
        <div class="company-info">
          <h3 class="section-title">From</h3>
          <div><strong>${company.companyName}</strong></div>
          <div>${company.address}</div>
          <div>Phone: ${company.contactNumber}</div>
          <div>Email: ${company.email}</div>
          ${company.gstNumber ? `<div>GST: ${company.gstNumber}</div>` : ''}
        </div>
        
        <div class="customer-info">
          <h3 class="section-title">Bill To</h3>
          <div><strong>${invoice.customerName || 'Customer'}</strong></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || []).map(item => `
              <tr>
                <td>${item.description || 'Product'}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                <td style="text-align: right;">${formatCurrency(item.amount || (item.quantity * (item.unitPrice || 0)))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <div class="total-label">Subtotal</div>
            <div class="total-value">${formatCurrency(invoice.subtotal || invoice.total)}</div>
          </div>
          
          ${invoice.discount ? `
          <div class="total-row">
            <div class="total-label">Discount</div>
            <div class="total-value">-${formatCurrency(invoice.discount)}</div>
          </div>
          ` : ''}
          
          ${invoice.taxRate ? `
          <div class="total-row">
            <div class="total-label">Tax (${invoice.taxRate}%)</div>
            <div class="total-value">${formatCurrency((invoice.total || 0) * (invoice.taxRate / 100))}</div>
          </div>
          ` : ''}
          
          <div class="total-row grand-total">
            <div class="total-label">Total</div>
            <div class="total-value">${formatCurrency(invoice.total)}</div>
          </div>
        </div>
        
        ${invoice.notes ? `
        <div class="notes">
          <h3 class="section-title">Notes</h3>
          <p>${invoice.notes}</p>
        </div>
        ` : ''}
        
        <div class="footer">
          Thank you for your business!
        </div>
      </div>
    </body>
    </html>
  `;
  
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
