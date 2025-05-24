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
  
  // Bulletproof web-only preview generation
  const generateInvoicePreview = async (invoice: Invoice, templateId?: string): Promise<string> => {
    try {
      console.log('🔄 Starting bulletproof preview generation for invoice:', invoice.id);
      
      // Validate invoice data with fallbacks and proper typing
      const safeInvoice: Invoice = {
        ...invoice,
        id: invoice.id || 'TEMP-001',
        number: invoice.number || invoice.id || 'TEMP-001',
        customerName: invoice.customerName || 'Unknown Customer',
        date: invoice.date || new Date().toISOString().slice(0, 10),
        dueDate: invoice.dueDate || 'Not set',
        total: invoice.total || 0,
        items: invoice.items || [],
        notes: invoice.notes || '',
        status: (invoice.status && ['draft', 'sent', 'paid', 'overdue', 'canceled'].includes(invoice.status)) 
          ? invoice.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled'
          : 'draft'
      };
      
      console.log('✅ Invoice validation passed, generating HTML...');
      const htmlPreview = generateInvoiceHtml(safeInvoice, companyInfo);
      
      if (!htmlPreview || !htmlPreview.startsWith('data:text/html')) {
        throw new Error('HTML generation failed');
      }
      
      console.log('✅ HTML preview generated successfully');
      return htmlPreview;
    } catch (error) {
      console.error('❌ Preview generation failed:', error);
      
      // Ultra-simple fallback that will always work
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .info { margin: 10px 0; }
            .total { font-size: 18px; font-weight: bold; background: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Invoice ${invoice.number || invoice.id}</h1>
            <p class="info">Date: ${invoice.date || new Date().toLocaleDateString()}</p>
          </div>
          <div class="info">
            <strong>Customer:</strong> ${invoice.customerName || 'Unknown Customer'}
          </div>
          <div class="info">
            <strong>Items:</strong> ${(invoice.items || []).length} item(s)
          </div>
          <div class="total">
            Total Amount: ₹${(invoice.total || 0).toFixed(2)}
          </div>
          <div style="margin-top: 30px; padding: 20px; background: #e8f4f8; border-radius: 5px;">
            <p><strong>Note:</strong> This is a simplified preview. The full invoice template could not be loaded.</p>
          </div>
        </body>
        </html>
      `;
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`;
    }
  };
  
  // Simple web-only download function
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('📥 Starting download for invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      const htmlData = await generateInvoicePreview(invoice, templateId);
      const fileName = `invoice-${invoice.number || invoice.id}.html`;
      
      // Create and trigger download
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
  
  // Simple web-only print function
  const printInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      console.log('🖨️ Starting print for invoice:', invoiceId);
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      const htmlData = await generateInvoicePreview(invoice, templateId);
      
      // Open in new window and print
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }
      
      const htmlContent = decodeURIComponent(htmlData.split(',')[1]);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = function() {
        printWindow.print();
      };
      
      toast.success('Invoice sent to printer');
    } catch (error) {
      console.error('Print failed:', error);
      toast.error('Print failed');
    }
  };
  
  // Web-only printers function (returns empty array)
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
