
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '@/types';

interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  fontFamily?: string;
  primaryColor?: string;
}

interface CompanyInfo {
  companyName: string;
  address: string;
  contactNumber: string;
  email: string;
  gstNumber?: string;
  bankDetails?: string;
  logoUrl?: string;
}

interface InvoiceContextType {
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
  generateInvoicePreview: (invoice: Invoice, templateId?: string) => string;
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

const defaultInvoiceTemplates: InvoiceTemplate[] = [
  { 
    id: 'standard', 
    name: 'Standard', 
    description: 'A clean, professional invoice layout', 
    fontFamily: 'Inter', 
    primaryColor: '#3b82f6' 
  },
  { 
    id: 'modern', 
    name: 'Modern', 
    description: 'A bold, contemporary design', 
    fontFamily: 'Poppins', 
    primaryColor: '#10b981' 
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    description: 'A formal, business-oriented template', 
    fontFamily: 'Roboto', 
    primaryColor: '#6366f1' 
  },
];

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates] = useState<InvoiceTemplate[]>(defaultInvoiceTemplates);
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
  
  // Invoice CRUD operations
  const addInvoice = (invoice: Omit<Invoice, 'id'>): string => {
    const id = uuidv4();
    const newInvoice = { ...invoice, id };
    setInvoices(prev => [...prev, newInvoice]);
    return id;
  };
  
  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...data } : invoice
      )
    );
  };
  
  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  };
  
  const getInvoiceById = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
  };
  
  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...info }));
  };
  
  const downloadInvoice = async (invoiceId: string, templateId?: string) => {
    // Mock function - in a real app, this would generate and download a PDF
    console.log(`Downloading invoice ${invoiceId} with template ${templateId || selectedTemplateId}`);
    // This would typically call a service to generate and download the PDF
  };
  
  const generateInvoicePreview = (invoice: Invoice, templateId?: string): string => {
    // Mock function - in a real app, this would generate a preview URL
    console.log(`Generating preview for invoice using template ${templateId || selectedTemplateId}`);
    // This would typically return a data URL or blob URL for preview
    return '#preview-url';
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
