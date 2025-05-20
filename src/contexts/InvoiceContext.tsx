import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Invoice, OrderItem } from '@/types';
import { INVOICE_TEMPLATES } from '@/utils/invoiceUtils';
import { toast } from 'sonner';

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  fontFamily?: string;
  primaryColor?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface CompanyInfo {
  companyName: string;
  address: string;
  contactNumber: string;
  email: string;
  gstNumber?: string;
  bankDetails?: string;
  logoUrl?: string;
}

export interface OrderData {
  customerId: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  date: string;
  notes?: string;
}

export interface PaymentAmount {
  amount: number;
  method: 'cash' | 'bank' | 'upi' | 'other';
  date: string;
}

export interface InvoiceContextType {
  invoices: Invoice[];
  templates: InvoiceTemplate[];
  selectedTemplateId: string;
  companyInfo: CompanyInfo;
  colorScheme: string;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  setSelectedTemplateId: (templateId: string) => void;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  setColorScheme: (scheme: string) => void;
  downloadInvoice: (invoiceId: string, templateId?: string) => Promise<void>;
  generateInvoicePreview: (invoice: Invoice, templateId?: string) => Promise<string>;
  calculateInvoiceTotal: (items: OrderItem[]) => number;
}

const defaultCompanyInfo: CompanyInfo = {
  companyName: 'Vikas Milk Centre',
  address: '123 Dairy Road, Mumbai, Maharashtra',
  contactNumber: '+91 9876543210',
  email: 'info@vikasmilkcentre.com',
  gstNumber: 'GSTIN12345678',
  bankDetails: 'Bank: SBI\nAccount: 123456789\nIFSC: SBIN0001234',
  logoUrl: '/lovable-uploads/94882b07-d7b1-4949-8dcb-7a750fd17c6b.png'
};

// Export the context directly
export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates] = useState<InvoiceTemplate[]>(INVOICE_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('standard');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [colorScheme, setColorScheme] = useState<string>('blue');
  
  // Load data from localStorage on initial load
  useEffect(() => {
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      try {
        setInvoices(JSON.parse(storedInvoices));
      } catch (e) {
        console.error('Failed to parse stored invoices', e);
      }
    }
    
    const storedCompanyInfo = localStorage.getItem('companyInfo');
    if (storedCompanyInfo) {
      try {
        setCompanyInfo(JSON.parse(storedCompanyInfo));
      } catch (e) {
        console.error('Failed to parse stored company info', e);
      }
    }
    
    const storedTemplate = localStorage.getItem('selectedInvoiceTemplate');
    if (storedTemplate) {
      setSelectedTemplateId(storedTemplate);
    }
    
    const storedColorScheme = localStorage.getItem('invoiceColorScheme');
    if (storedColorScheme) {
      setColorScheme(storedColorScheme);
    }
  }, []);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);
  
  useEffect(() => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
  }, [companyInfo]);
  
  useEffect(() => {
    localStorage.setItem('selectedInvoiceTemplate', selectedTemplateId);
  }, [selectedTemplateId]);
  
  useEffect(() => {
    localStorage.setItem('invoiceColorScheme', colorScheme);
  }, [colorScheme]);
  
  // Calculate invoice total from items
  const calculateInvoiceTotal = (items: OrderItem[]): number => {
    return items.reduce((total, item) => total + (item.quantity * (item.unitPrice || 0)), 0);
  };
  
  // Invoice CRUD operations
  const addInvoice = (invoice: Omit<Invoice, 'id'>): string => {
    const id = uuidv4();
    
    // Calculate total if not provided
    let total = invoice.total;
    if (!total && invoice.items) {
      total = calculateInvoiceTotal(invoice.items);
    }
    
    const newInvoice = { 
      ...invoice, 
      id,
      total: total || 0 // Ensure we always have a total
    };
    
    setInvoices(prev => [...prev, newInvoice as Invoice]);
    toast.success("Invoice added successfully");
    return id;
  };
  
  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...data } : invoice
      )
    );
    toast.success("Invoice updated successfully");
  };
  
  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    toast.success("Invoice deleted successfully");
  };
  
  const getInvoiceById = (id: string): Invoice | undefined => {
    return invoices.find(invoice => invoice.id === id);
  };
  
  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...info }));
  };
  
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<void> => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) {
      console.error(`Invoice with ID ${invoiceId} not found`);
      toast.error("Invoice not found");
      return;
    }
    
    try {
      // In a real app, this would generate and download a PDF
      console.log(`Downloading invoice ${invoiceId} with template ${templateId || selectedTemplateId}`);
      toast.success("Invoice downloaded successfully");
      // This would typically call a service to generate and download the PDF
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice");
    }
  };
  
  const generateInvoicePreview = async (invoice: Invoice, templateId?: string): Promise<string> => {
    // Mock function - in a real app, this would generate a preview URL
    // For now, we simulate a brief delay to simulate PDF rendering
    return new Promise((resolve) => {
      console.log(`Generating preview for invoice using template ${templateId || selectedTemplateId}`);
      setTimeout(() => {
        // This would typically return a data URL or blob URL for preview
        resolve('#preview-url');
      }, 1000);
    });
  };
  
  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        templates,
        selectedTemplateId,
        companyInfo,
        colorScheme,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
        setSelectedTemplateId,
        updateCompanyInfo,
        setColorScheme,
        downloadInvoice,
        generateInvoicePreview,
        calculateInvoiceTotal
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice(): InvoiceContextType {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}

// Create a named export for backward compatibility
export const useInvoices = useInvoice;
