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

// Simple HTML invoice generator without any external dependencies
const generateSimpleInvoiceHtml = (invoice: Invoice): string => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number || invoice.id}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background: white;
          color: #333;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .company-info { 
          margin-bottom: 30px; 
        }
        .customer-info { 
          margin-bottom: 30px; 
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
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
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        .total-section { 
          text-align: right; 
          font-weight: bold; 
          margin-top: 20px; 
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        .invoice-title {
          font-size: 2em;
          color: #333;
          margin: 0;
        }
        .notes {
          margin-top: 30px;
          padding: 15px;
          background: #f0f0f0;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="invoice-title">INVOICE</h1>
        </div>
        <div>
          <p><strong>Invoice #:</strong> ${invoice.number || invoice.id}</p>
          <p><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}</p>
        </div>
      </div>
      
      <div class="company-info">
        <h3>From:</h3>
        <p><strong>Milk Center</strong></p>
        <p>123 Dairy Lane, Milk City</p>
        <p>Phone: +91 98765 43210</p>
        <p>Email: info@milkcenter.com</p>
      </div>
      
      <div class="customer-info">
        <h3>Bill To:</h3>
        <p><strong>${invoice.customerName || 'Customer'}</strong></p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Rate (₹)</th>
            <th style="text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map(item => `
            <tr>
              <td>${item.description || 'Product'}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">₹${item.unitPrice?.toFixed(2) || '0.00'}</td>
              <td style="text-align: right;">₹${item.amount?.toFixed(2) || '0.00'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total-section">
        <p style="font-size: 1.2em;">Total: ₹${invoice.total?.toFixed(2) || '0.00'}</p>
      </div>
      
      ${invoice.notes ? `
      <div class="notes">
        <h3>Notes:</h3>
        <p>${invoice.notes}</p>
      </div>
      ` : ''}
    </body>
    </html>
  `;
  
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
};

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
  
  // Simplified preview generation using only HTML
  const generateInvoicePreview = async (invoice: Invoice, templateId?: string): Promise<string> => {
    try {
      console.log('Generating simple HTML preview for invoice:', invoice.id);
      const htmlPreview = generateSimpleInvoiceHtml(invoice);
      console.log('HTML preview generated successfully');
      return htmlPreview;
    } catch (error) {
      console.error('Error generating preview:', error);
      
      // Ultra-simple fallback
      const simpleFallback = `
        <html>
        <head><title>Invoice ${invoice.id}</title></head>
        <body style="padding: 20px; font-family: Arial, sans-serif;">
          <h1>Invoice ${invoice.id}</h1>
          <p><strong>Customer:</strong> ${invoice.customerName || 'Unknown'}</p>
          <p><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</p>
          <p><strong>Total:</strong> ₹${(invoice.total || 0).toFixed(2)}</p>
        </body>
        </html>
      `;
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(simpleFallback)}`;
    }
  };
  
  // Simplified download function
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('Downloading invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const htmlData = await generateInvoicePreview(invoice, templateId);
      const fileName = `invoice-${invoice.number || invoice.id}.html`;
      
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
  
  // Simplified print function
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
  
  // Simple printers function (Web fallback)
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
