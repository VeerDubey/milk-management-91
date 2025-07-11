
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice } from '@/types';
import { 
  generateInvoiceNumber,
  INVOICE_TEMPLATES,
  generateInvoicePreview
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
  
  // Web-only preview generation using the utility function
  const generateWebInvoicePreview = async (invoice: Invoice, templateId?: string): Promise<string> => {
    try {
      console.log('Generating web preview for invoice:', invoice.id);
      
      // Use the invoice utils function with proper context
      const htmlPreview = generateInvoicePreview(
        invoice,
        companyInfo,
        [], // products array - will be passed from context in real usage
        templateId || selectedTemplateId
      );
      
      console.log('HTML preview generated successfully');
      return htmlPreview;
    } catch (error) {
      console.error('Error generating preview:', error);
      
      // Simple fallback
      const simpleFallback = `
        <html>
        <head><title>Invoice ${invoice.id}</title></head>
        <body style="padding: 20px; font-family: Arial, sans-serif;">
          <h1>Invoice ${invoice.id}</h1>
          <p><strong>Customer:</strong> ${invoice.customerName || 'Unknown'}</p>
          <p><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</p>
          <p><strong>Total:</strong> ₹${(invoice.total || 0).toFixed(2)}</p>
          <div style="margin-top: 20px;">
            <h3>Items:</h3>
            ${(invoice.items || []).map(item => `
              <div style="margin: 5px 0;">
                ${item.description || 'Item'} - Qty: ${item.quantity} - Rate: ₹${item.unitPrice?.toFixed(2)} - Amount: ₹${item.amount?.toFixed(2)}
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `;
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(simpleFallback)}`;
    }
  };
  
  // Web-only download function
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('Downloading invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const htmlData = await generateWebInvoicePreview(invoice, templateId);
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
  
  // Web-only print function
  const printInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('Printing invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const htmlData = await generateWebInvoicePreview(invoice, templateId);
      
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
        generateInvoicePreview: generateWebInvoicePreview,
        downloadInvoice,
        printInvoice,
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
