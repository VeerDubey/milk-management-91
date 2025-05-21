
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice, Customer, Product } from '@/types';
import { 
  generateInvoicePreview, 
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
  companyName: 'Your Company Name',
  address: '123 Business Street, City, State, ZIP',
  contactNumber: '+91 98765 43210',
  email: 'info@yourcompany.com',
  gstNumber: 'GST1234567890',
  bankDetails: 'Bank: YourBank, Acc #: 1234567890, IFSC: ABCD0001234',
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
    setInvoices([...invoices, newInvoice]);
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
  
  // Function to generate PDF preview
  const generateInvoicePreviewImpl = async (invoice: Invoice, templateId?: string): Promise<string> => {
    try {
      // Mock data for demo - in a real app, we'd fetch these from the contexts
      const products: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Use specified template or fallback to selected template
      const templateToUse = templateId || selectedTemplateId;
      
      // Generate and return the PDF preview
      return generateInvoicePreview(
        invoice,
        companyInfo,
        products,
        templateToUse
      );
    } catch (error) {
      console.error('Error generating preview:', error);
      throw new Error('Failed to generate preview');
    }
  };
  
  // Function to download invoice
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const pdfData = await generateInvoicePreviewImpl(invoice, templateId);
      
      // When running in Electron
      if (window.electron && typeof window.electron === 'object') {
        if (window.electron.invoke) {
          const result = await window.electron.invoke('download-invoice', pdfData, `invoice-${invoice.id}.pdf`);
          if (!result.success) {
            throw new Error(result.error || 'Failed to download invoice');
          }
          toast.success('Invoice downloaded successfully');
        } else {
          // Fallback for web browsers
          const link = document.createElement('a');
          link.href = pdfData;
          link.download = `invoice-${invoice.id}.pdf`;
          link.click();
          toast.success('Invoice downloaded successfully');
        }
      } 
      // When running in web browser
      else {
        const link = document.createElement('a');
        link.href = pdfData;
        link.download = `invoice-${invoice.id}.pdf`;
        link.click();
        toast.success('Invoice downloaded successfully');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
      throw error;
    }
  };
  
  // Function to print invoice
  const printInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    try {
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const pdfData = await generateInvoicePreviewImpl(invoice, templateId);
      
      // When running in Electron
      if (window.electron && typeof window.electron === 'object') {
        if (window.electron.invoke) {
          const result = await window.electron.invoke('print-invoice', pdfData);
          if (!result.success) {
            throw new Error(result.error || 'Failed to print invoice');
          }
          toast.success('Invoice sent to printer');
        } else {
          // Fallback for web browsers
          const printWindow = window.open(pdfData, '_blank');
          if (!printWindow) {
            throw new Error('Pop-up blocked. Please allow pop-ups to print.');
          }
          
          printWindow.addEventListener('load', () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          });
          
          toast.success('Invoice print dialog opened');
        }
      } 
      // When running in web browser
      else {
        // Open in a new tab for printing
        const printWindow = window.open(pdfData, '_blank');
        if (!printWindow) {
          throw new Error('Pop-up blocked. Please allow pop-ups to print.');
        }
        
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
        
        toast.success('Invoice print dialog opened');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print invoice');
      throw error;
    }
  };
  
  // Function to get available printers (Electron only)
  const getPrinters = async (): Promise<{success: boolean, printers: any[]}> => {
    if (window.electron && typeof window.electron === 'object' && window.electron.invoke) {
      try {
        return await window.electron.invoke('get-printers');
      } catch (error) {
        console.error('Error getting printers:', error);
        return { success: false, printers: [] };
      }
    }
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
