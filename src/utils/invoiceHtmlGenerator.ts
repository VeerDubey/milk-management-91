
import { Invoice } from '@/types';

/**
 * Generate a bulletproof HTML preview for invoices
 */
export function generateInvoiceHtml(invoice: Invoice, companyInfo?: any): string {
  console.log('Generating HTML for invoice:', invoice.id);
  
  // Ensure we have safe values
  const safeInvoice = {
    id: invoice.id || 'N/A',
    number: invoice.number || invoice.id || 'N/A',
    customerName: invoice.customerName || 'Unknown Customer',
    date: invoice.date || new Date().toISOString().slice(0, 10),
    dueDate: invoice.dueDate || 'Not set',
    total: invoice.total || 0,
    items: invoice.items || [],
    notes: invoice.notes || '',
    status: invoice.status || 'Draft'
  };
  
  const safeCompany = companyInfo || {
    companyName: 'Milk Center',
    address: '123 Dairy Lane, Milk City',
    contactNumber: '+91 98765 43210',
    email: 'info@milkcenter.com',
    gstNumber: '29ABCDE1234F1Z5'
  };
  
  // Format currency safely
  const formatCurrency = (value: number): string => {
    try {
      return `₹${value.toFixed(2)}`;
    } catch (e) {
      return '₹0.00';
    }
  };
  
  // Format date safely
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    } catch (e) {
      return dateString;
    }
  };
  
  // Generate items table rows
  const itemsHtml = safeInvoice.items.map((item, index) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const amount = item.amount || (quantity * unitPrice);
    
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description || `Item ${index + 1}`}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(unitPrice)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(amount)}</td>
      </tr>
    `;
  }).join('');
  
  // Generate complete HTML
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${safeInvoice.number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 40px 20px; 
          background: white;
        }
        .invoice-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 40px; 
          border-bottom: 3px solid #007bff; 
          padding-bottom: 20px; 
        }
        .invoice-title { 
          font-size: 36px; 
          font-weight: bold; 
          color: #007bff; 
          margin: 0; 
        }
        .invoice-number { 
          font-size: 18px; 
          color: #666; 
          margin-top: 5px; 
        }
        .invoice-dates { 
          text-align: right; 
          font-size: 14px; 
        }
        .invoice-dates div { 
          margin-bottom: 5px; 
        }
        .company-section, .customer-section { 
          margin-bottom: 30px; 
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: #007bff; 
          margin-bottom: 10px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
        }
        .company-info, .customer-info { 
          background: #f8f9fa; 
          padding: 15px; 
          border-radius: 5px; 
          border-left: 4px solid #007bff; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .items-table th { 
          background: #007bff; 
          color: white; 
          padding: 12px 8px; 
          text-align: left; 
          font-weight: bold; 
        }
        .items-table th:nth-child(2), .items-table th:nth-child(3), .items-table th:nth-child(4) { 
          text-align: right; 
        }
        .total-section { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 5px; 
          margin-top: 30px; 
          border: 2px solid #007bff; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 5px 0; 
          font-size: 18px; 
          font-weight: bold; 
        }
        .notes-section { 
          margin-top: 40px; 
          padding: 20px; 
          background: #fff3cd; 
          border-radius: 5px; 
          border-left: 4px solid #ffc107; 
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          color: #666; 
          font-size: 14px; 
          border-top: 1px solid #ddd; 
          padding-top: 20px; 
        }
        @media print {
          body { padding: 20px; }
          .invoice-header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <h1 class="invoice-title">INVOICE</h1>
          <div class="invoice-number">#${safeInvoice.number}</div>
        </div>
        <div class="invoice-dates">
          <div><strong>Date:</strong> ${formatDate(safeInvoice.date)}</div>
          <div><strong>Due Date:</strong> ${formatDate(safeInvoice.dueDate)}</div>
          <div><strong>Status:</strong> ${safeInvoice.status}</div>
        </div>
      </div>
      
      <div class="company-section">
        <div class="section-title">From</div>
        <div class="company-info">
          <div><strong>${safeCompany.companyName}</strong></div>
          <div>${safeCompany.address}</div>
          <div>Phone: ${safeCompany.contactNumber}</div>
          <div>Email: ${safeCompany.email}</div>
          ${safeCompany.gstNumber ? `<div>GST: ${safeCompany.gstNumber}</div>` : ''}
        </div>
      </div>
      
      <div class="customer-section">
        <div class="section-title">Bill To</div>
        <div class="customer-info">
          <div><strong>${safeInvoice.customerName}</strong></div>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #666;">No items</td></tr>'}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <span>Total Amount:</span>
          <span>${formatCurrency(safeInvoice.total)}</span>
        </div>
      </div>
      
      ${safeInvoice.notes ? `
      <div class="notes-section">
        <div class="section-title">Notes</div>
        <p>${safeInvoice.notes}</p>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
  
  console.log('✅ HTML generation completed successfully');
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
