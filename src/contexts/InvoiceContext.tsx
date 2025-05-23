
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice, Customer, Product } from '@/types';
import { 
  generateInvoicePreview, 
  generateInvoiceNumber,
  INVOICE_TEMPLATES
} from '../utils/invoiceUtils';
import { toast } from 'sonner';
import { ElectronService } from '@/services/ElectronService';

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
  
  // Function to generate PDF preview with better error handling
  const generateInvoicePreviewImpl = async (invoice: Invoice, templateId?: string): Promise<string> => {
    try {
      console.log('Generating invoice preview for invoice:', invoice.id);
      
      // Get products and company info from localStorage as fallback
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Use specified template or fallback to selected template
      const templateToUse = templateId || selectedTemplateId;
      console.log('Using template:', templateToUse);
      
      // Try to generate preview using the utility function
      const previewResult = generateInvoicePreview(
        invoice,
        companyInfo,
        products,
        templateToUse
      );
      
      // Handle different return types from generateInvoicePreview
      if (typeof previewResult === 'string') {
        // Already a data URL string
        return previewResult;
      }
      
      // If it's a Promise, await it
      if (previewResult && typeof previewResult === 'object' && 'then' in previewResult) {
        return await previewResult;
      }
      
      // Fallback: create a simple HTML preview
      const fallbackHtml = `
        <html>
        <head><title>Invoice ${invoice.id}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Invoice ${invoice.number || invoice.id}</h1>
          <p>Customer: ${invoice.customerName || 'Unknown'}</p>
          <p>Date: ${invoice.date || 'N/A'}</p>
          <p>Total: ₹${(invoice.total || 0).toFixed(2)}</p>
          <p style="color: #666; font-size: 12px;">Preview generated in fallback mode</p>
        </body>
        </html>
      `;
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`;
      
    } catch (error) {
      console.error('Error generating preview:', error);
      
      // Last resort fallback
      const errorHtml = `
        <html>
        <head><title>Invoice Preview Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Preview Unavailable</h2>
          <p>Unable to generate invoice preview at this time.</p>
          <p>Invoice ID: ${invoice.id}</p>
          <p>Total: ₹${(invoice.total || 0).toFixed(2)}</p>
        </body>
        </html>
      `;
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`;
    }
  };
  
  // Function to download invoice
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('Downloading invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const pdfData = await generateInvoicePreviewImpl(invoice, templateId);
      const fileName = `invoice-${invoice.id}.pdf`;
      
      const result = await ElectronService.downloadInvoice(pdfData, fileName);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to download invoice');
      }
      
      console.log('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };
  
  // Function to print invoice
  const printInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('Printing invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const pdfData = await generateInvoicePreviewImpl(invoice, templateId);
      
      const result = await ElectronService.printInvoice(pdfData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to print invoice');
      }
      
      console.log('Invoice sent to printer');
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  };
  
  // Function to get available printers (Electron only)
  const getPrinters = async (): Promise<{success: boolean, printers: any[]}> => {
    return await ElectronService.getPrinters();
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
        generateInvoicePreview: generateInvoicePreviewImpl,
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
