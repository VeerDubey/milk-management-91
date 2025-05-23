
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice } from '@/types';
import { 
  generateInvoiceNumber,
  INVOICE_TEMPLATES
} from '../utils/invoiceUtils';
import { toast } from 'sonner';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  templates: typeof INVOICE_TEMPLATES;
  companyInfo: {
    companyName: string;
    address: string;
    contactNumber: string;
    email: string;
    gstNumber: string;
    bankDetails: string;
    logoUrl?: string;
  };
  setCompanyInfo: (info: Partial<InvoiceContextType['companyInfo']>) => void;
  generateInvoicePreview: (invoice: Invoice, templateId?: string) => Promise<string>;
  downloadInvoice: (invoiceId: string, templateId?: string) => Promise<void>;
  printInvoice: (invoiceId: string, templateId?: string) => Promise<void>;
  getPrinters: () => Promise<{success: boolean, printers: any[]}>;
}

const defaultCompanyInfo = {
  companyName: 'Milk Center',
  address: '123 Dairy Lane, Milk City',
  contactNumber: '+91 98765 43210',
  email: 'info@milkcenter.com',
  gstNumber: '29ABCDE1234F1Z5',
  bankDetails: 'Bank Name: ABC Bank\nAccount Number: 1234567890\nIFSC Code: ABCD0001234',
  logoUrl: ''
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const saved = localStorage.getItem('selectedInvoiceTemplate');
    return saved || 'standard';
  });
  
  const [companyInfo, setCompanyInfoState] = useState(() => {
    const saved = localStorage.getItem('companyInfo');
    return saved ? JSON.parse(saved) : defaultCompanyInfo;
  });
  
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);
  
  useEffect(() => {
    localStorage.setItem('selectedInvoiceTemplate', selectedTemplateId);
  }, [selectedTemplateId]);
  
  useEffect(() => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
  }, [companyInfo]);
  
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = {
      ...invoice,
      id: invoice.number || generateInvoiceNumber()
    };
    setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
    return newInvoice;
  };
  
  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, ...invoiceData } : invoice
      )
    );
  };
  
  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
  };
  
  const getInvoiceById = (id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  };
  
  const setCompanyInfo = (info: Partial<InvoiceContextType['companyInfo']>) => {
    setCompanyInfoState(prev => ({ ...prev, ...info }));
  };
  
  // Simplified function to generate HTML invoice preview
  const generateInvoicePreview = async (invoice: Invoice, templateId?: string): Promise<string> => {
    try {
      console.log('Generating simplified HTML preview for invoice:', invoice.id);
      
      // Get products from localStorage
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Create HTML preview directly
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
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
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 20px;
            }
            .company-info h1 { 
              margin: 0 0 10px 0; 
              color: #4f46e5; 
              font-size: 24px;
            }
            .company-info p { margin: 5px 0; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { 
              margin: 0 0 10px 0; 
              color: #4f46e5; 
              font-size: 20px;
            }
            .customer-section { 
              margin: 20px 0; 
              padding: 15px; 
              background-color: #f8f9fa; 
              border-radius: 5px;
            }
            .customer-section h3 { margin: 0 0 10px 0; color: #555; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #4f46e5; 
              color: white; 
              font-weight: bold;
            }
            .total-row { 
              font-weight: bold; 
              background-color: #f8f9fa; 
              border-top: 2px solid #4f46e5;
            }
            .footer { 
              margin-top: 30px; 
              padding: 20px; 
              background-color: #f8f9fa; 
              border-radius: 5px; 
              font-size: 14px; 
            }
            .footer h4 { margin: 0 0 10px 0; color: #555; }
            @media print {
              body { margin: 0; }
              .invoice-container { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <h1>${companyInfo.companyName}</h1>
                <p>${companyInfo.address}</p>
                <p>Phone: ${companyInfo.contactNumber}</p>
                <p>Email: ${companyInfo.email}</p>
                <p>GST: ${companyInfo.gstNumber}</p>
              </div>
              <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${invoice.number || invoice.id}</p>
                <p><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}</p>
                <p><strong>Status:</strong> ${invoice.status || 'Draft'}</p>
              </div>
            </div>
            
            <div class="customer-section">
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
                  <td colspan="3" style="text-align: right;"><strong>Total Amount:</strong></td>
                  <td style="text-align: right;"><strong>₹${(invoice.total || 0).toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <div class="footer">
              ${invoice.notes ? `
                <h4>Notes:</h4>
                <p>${invoice.notes}</p>
              ` : ''}
              
              ${invoice.termsAndConditions ? `
                <h4>Terms & Conditions:</h4>
                <p>${invoice.termsAndConditions}</p>
              ` : ''}
              
              <h4>Bank Details:</h4>
              <p style="white-space: pre-line;">${companyInfo.bankDetails}</p>
              
              <p style="text-align: center; margin-top: 20px; color: #666;">
                Thank you for your business!
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Convert HTML to data URL
      const encodedHtml = encodeURIComponent(html);
      return `data:text/html;charset=utf-8,${encodedHtml}`;
      
    } catch (error) {
      console.error('Error generating preview:', error);
      
      // Ultra-simple fallback
      const fallbackHtml = `
        <html>
        <body style="padding: 20px; font-family: Arial;">
          <h2>Invoice ${invoice.id}</h2>
          <p>Total: ₹${(invoice.total || 0).toFixed(2)}</p>
          <p>Customer: ${invoice.customerName || 'Unknown'}</p>
          <p>Date: ${invoice.date || new Date().toLocaleDateString()}</p>
        </body>
        </html>
      `;
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`;
    }
  };
  
  // Function to download invoice
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('Downloading invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const htmlData = await generateInvoicePreview(invoice, templateId);
      const fileName = `invoice-${invoice.id}.html`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = htmlData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };
  
  // Function to print invoice
  const printInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('Printing invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const htmlData = await generateInvoicePreview(invoice, templateId);
      
      // Open in new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(decodeURIComponent(htmlData.split(',')[1]));
        printWindow.document.close();
        printWindow.print();
      }
      
      toast.success('Invoice sent to printer');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print invoice');
    }
  };
  
  // Function to get available printers (Web fallback)
  const getPrinters = async (): Promise<{success: boolean, printers: any[]}> => {
    return { success: false, printers: [] };
  };
  
  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
        selectedTemplateId,
        setSelectedTemplateId,
        templates: INVOICE_TEMPLATES,
        companyInfo,
        setCompanyInfo,
        generateInvoicePreview,
        downloadInvoice,
        printInvoice,
        getPrinters,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
}
