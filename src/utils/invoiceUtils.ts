
import { Invoice, OrderItem } from "@/types";
import { format } from "date-fns";

// Invoice template definitions
export const INVOICE_TEMPLATES = [
  {
    id: "standard",
    name: "Standard Invoice",
    description: "Classic invoice format with company details",
    previewImage: "standard-invoice.png",
    primaryColor: "#4f46e5",
    fontFamily: "Arial",
    showHeader: true,
    showFooter: true
  },
  {
    id: "modern",
    name: "Modern Invoice", 
    description: "Clean, contemporary design",
    previewImage: "modern-invoice.png",
    primaryColor: "#0ea5e9",
    fontFamily: "Helvetica",
    showHeader: true,
    showFooter: false
  },
  {
    id: "simple",
    name: "Simple Invoice",
    description: "Streamlined format with essentials",
    previewImage: "simple-invoice.png",
    primaryColor: "#f59e0b",
    fontFamily: "Calibri",
    showHeader: false,
    showFooter: true
  }
];

// Function to generate a random invoice number
export const generateInvoiceNumber = () => {
  const prefix = "INV";
  const timestamp = Date.now().toString().substring(7);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${randomNum}`;
};

// Simple HTML-based invoice preview generator
export const generateInvoicePreview = (
  invoice: Invoice,
  companyInfo: any = {},
  products: any[] = [],
  templateId: string = "standard"
) => {
  try {
    console.log('Generating HTML invoice preview for:', invoice.id);
    
    const template = INVOICE_TEMPLATES.find(t => t.id === templateId) || INVOICE_TEMPLATES[0];
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body { 
            font-family: ${template.fontFamily}, sans-serif; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.6; 
            color: #333;
          }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
            border-bottom: 2px solid ${template.primaryColor};
            padding-bottom: 20px;
          }
          .company-info h1 { 
            margin: 0 0 10px 0; 
            color: ${template.primaryColor}; 
            font-size: 24px;
          }
          .company-info p { margin: 5px 0; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { 
            margin: 0 0 10px 0; 
            color: ${template.primaryColor}; 
            font-size: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: ${template.primaryColor}; 
            color: white; 
            font-weight: bold;
          }
          .total-row { 
            font-weight: bold; 
            background-color: #f8f9fa; 
            border-top: 2px solid ${template.primaryColor};
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              <h1>${companyInfo.companyName || 'Company Name'}</h1>
              <p>${companyInfo.address || 'Company Address'}</p>
              <p>Phone: ${companyInfo.contactNumber || 'Contact Number'}</p>
              <p>Email: ${companyInfo.email || 'Email'}</p>
              <p>GST: ${companyInfo.gstNumber || 'GST Number'}</p>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.number || invoice.id}</p>
              <p><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}</p>
            </div>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customerName || 'Customer Name'}</strong></p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || []).map((item: any) => {
                const product = products.find((p: any) => p.id === item.productId);
                return `
                  <tr>
                    <td>${product?.name || item.description || item.productId || 'Item'}</td>
                    <td style="text-align: center;">${item.quantity || 0}</td>
                    <td style="text-align: right;">₹${(item.unitPrice || 0).toFixed(2)}</td>
                    <td style="text-align: right;">₹${(item.amount || 0).toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td style="text-align: right;"><strong>₹${(invoice.total || 0).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          ${invoice.notes ? `
            <div style="margin-top: 20px;">
              <h4>Notes:</h4>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
          
          ${invoice.termsAndConditions ? `
            <div style="margin-top: 20px;">
              <h4>Terms & Conditions:</h4>
              <p>${invoice.termsAndConditions}</p>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
    
    // Convert HTML to data URL
    const encodedHtml = encodeURIComponent(html);
    return `data:text/html;charset=utf-8,${encodedHtml}`;
    
  } catch (error) {
    console.error('Error in generateInvoicePreview:', error);
    // Return minimal fallback
    const fallbackHtml = `<html><body><h2>Invoice ${invoice.id}</h2><p>Total: ₹${(invoice.total || 0).toFixed(2)}</p></body></html>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`;
  }
};

// Function to format date for input
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Function to generate due date
export const generateDueDate = (dateStr: string, days: number = 30): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
};

// Function to create invoice from form data
export const createInvoiceFromFormData = (data: any): Invoice => {
  const currentDate = new Date().toISOString();
  
  return {
    id: data.invoiceNumber || generateInvoiceNumber(),
    number: data.invoiceNumber || generateInvoiceNumber(),
    date: data.invoiceDate || currentDate,
    dueDate: data.dueDate || generateDueDate(data.invoiceDate || currentDate),
    customerId: data.customerId || '',
    items: (data.items || []).map((item: any) => ({
      productId: item.productId,
      description: item.description || 'Product',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || item.rate || 0,
      amount: item.amount || (item.quantity * (item.unitPrice || item.rate || 0))
    })),
    subtotal: (data.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
    taxRate: data.taxRate || 0,
    taxAmount: 0,
    total: (data.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
    status: 'draft',
    notes: data.notes || '',
    termsAndConditions: data.terms || '',
    createdAt: currentDate,
    updatedAt: currentDate,
    customerName: data.customerName || '',
    amount: (data.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
    orderId: data.orderId || `ORD-${Date.now()}`
  };
};
