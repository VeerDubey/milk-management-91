
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice } from '@/types';
import { 
  generateInvoiceNumber,
  INVOICE_TEMPLATES
} from '../utils/invoiceUtils';
import { generateInvoiceHtml } from '../utils/invoiceHtmlGenerator';
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
  
  // Pure web preview generation - no electron dependencies
  const generateInvoicePreview = async (invoice: Invoice, templateId?: string): Promise<string> => {
    try {
      console.log('🔄 Generating web preview for invoice:', invoice.id);
      
      // Create a safe invoice object with all required properties
      const safeInvoice: Invoice = {
        id: invoice.id || 'TEMP-001',
        customerId: invoice.customerId || 'TEMP-CUSTOMER',
        number: invoice.number || invoice.id || 'TEMP-001',
        customerName: invoice.customerName || 'Unknown Customer',
        date: invoice.date || new Date().toISOString().slice(0, 10),
        dueDate: invoice.dueDate || 'Not set',
        items: invoice.items || [],
        subtotal: invoice.subtotal || invoice.total || 0,
        taxRate: invoice.taxRate || 0,
        taxAmount: invoice.taxAmount || 0,
        total: invoice.total || 0,
        notes: invoice.notes || '',
        termsAndConditions: invoice.termsAndConditions || '',
        createdAt: invoice.createdAt || new Date().toISOString(),
        updatedAt: invoice.updatedAt || new Date().toISOString(),
        status: 'draft' as const
      };
      
      const htmlPreview = generateInvoiceHtml(safeInvoice, companyInfo);
      
      if (!htmlPreview || !htmlPreview.startsWith('data:text/html')) {
        throw new Error('HTML generation failed');
      }
      
      console.log('✅ Preview generated successfully');
      return htmlPreview;
    } catch (error) {
      console.error('❌ Preview generation failed:', error);
      
      // Ultra-simple fallback HTML
      const simpleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.number || invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #333; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Invoice ${invoice.number || invoice.id}</h1>
          </div>
          <div class="content">
            <p><strong>Customer:</strong> ${invoice.customerName || 'Unknown Customer'}</p>
            <p><strong>Date:</strong> ${invoice.date || 'Not set'}</p>
            <p><strong>Total:</strong> ₹${(invoice.total || 0).toFixed(2)}</p>
          </div>
        </body>
        </html>
      `;
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(simpleHtml)}`;
    }
  };
  
  // Pure web download - no electron
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const htmlData = await generateInvoicePreview(invoice, templateId);
      const fileName = `invoice-${invoice.number || invoice.id}.html`;
      
      const link = document.createElement('a');
      link.href = htmlData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };
  
  // Pure web print - no electron
  const printInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const htmlData = await generateInvoicePreview(invoice, templateId);
      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('Could not open print window');
      
      const htmlContent = decodeURIComponent(htmlData.split(',')[1]);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
      
      toast.success('Sent to printer');
    } catch (error) {
      console.error('Print failed:', error);
      toast.error('Print failed');
    }
  };
  
  // Web-only - no actual printer detection
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
