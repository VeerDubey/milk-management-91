
import { Invoice, OrderItem } from "@/types";
import { format } from "date-fns";

// Fallback for when PDF generation fails
const generateHTMLPreview = (
  invoice: Invoice,
  companyInfo: any,
  products: any[]
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info h1 { margin: 0; color: #333; }
        .invoice-info { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        .notes { margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; }
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
          <p>Date: ${invoice.date || new Date().toLocaleDateString()}</p>
          <p>Due Date: ${invoice.dueDate || 'N/A'}</p>
          <p>Status: ${invoice.status || 'Draft'}</p>
        </div>
      </div>
      
      <div class="customer-info">
        <h3>Bill To:</h3>
        <p><strong>${invoice.customerName || 'Customer Name'}</strong></p>
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
          ${(invoice.items || []).map((item: any) => {
            const product = products.find(p => p.id === item.productId);
            return `
              <tr>
                <td>${product?.name || item.description || item.productId || 'Item'}</td>
                <td>${item.quantity || 0}</td>
                <td>₹${(item.unitPrice || 0).toFixed(2)}</td>
                <td>₹${(item.amount || 0).toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
            <td><strong>₹${(invoice.total || 0).toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      ${invoice.notes ? `
        <div class="notes">
          <h4>Notes:</h4>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}
      
      ${invoice.termsAndConditions ? `
        <div class="notes">
          <h4>Terms & Conditions:</h4>
          <p>${invoice.termsAndConditions}</p>
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; font-size: 12px; color: #666;">
        <p>Bank Details: ${companyInfo.bankDetails || 'Bank Details Not Available'}</p>
      </div>
    </body>
    </html>
  `;
  
  // Convert HTML to data URL
  const encodedHtml = encodeURIComponent(html);
  return `data:text/html;charset=utf-8,${encodedHtml}`;
};

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

// Function to generate invoice preview - with fallback to HTML
export const generateInvoicePreview = (
  invoice: Invoice,
  companyInfo: any = {},
  products: any[] = [],
  templateId: string = "standard"
) => {
  try {
    console.log('Generating invoice preview for:', invoice.id);
    
    // Try to use jsPDF if available
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import of PDF utils
        import('./pdfUtils').then(pdfModule => {
          return pdfModule.generatePdfPreview(
            ["Item", "Quantity", "Rate", "Amount"],
            (invoice.items || []).map((item: any) => {
              const product = products.find(p => p.id === item.productId);
              return [
                product?.name || item.description || item.productId || 'Item',
                (item.quantity || 0).toString(),
                `₹${(item.unitPrice || 0).toFixed(2)}`,
                `₹${(item.amount || 0).toFixed(2)}`
              ];
            }),
            {
              title: companyInfo.companyName || 'Invoice',
              subtitle: `Invoice #${invoice.number || invoice.id}`,
              dateInfo: `Date: ${invoice.date || new Date().toLocaleDateString()}`,
              additionalInfo: [
                { label: "Customer", value: invoice.customerName || "Unknown" },
                { label: "Status", value: invoice.status || "Draft" }
              ]
            }
          );
        }).catch(() => {
          // PDF generation failed, use HTML fallback
          return generateHTMLPreview(invoice, companyInfo, products);
        });
      } catch (pdfError) {
        console.warn('PDF generation failed, using HTML fallback:', pdfError);
        return generateHTMLPreview(invoice, companyInfo, products);
      }
    }
    
    // Fallback to HTML preview
    return generateHTMLPreview(invoice, companyInfo, products);
    
  } catch (error) {
    console.error('Error in generateInvoicePreview:', error);
    return generateHTMLPreview(invoice, companyInfo, products);
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
    // Additional compatibility fields
    customerName: data.customerName || '',
    amount: (data.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
    orderId: data.orderId || `ORD-${Date.now()}`
  };
};
