
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceTemplate } from '@/types';

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
  selectedTemplate: string;
  companyInfo: CompanyInfo;
  colorScheme: string;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  setSelectedTemplate: (templateId: string) => void;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  setColorScheme: (scheme: string) => void;
}

const defaultCompanyInfo: CompanyInfo = {
  companyName: 'Vikas Milk Centre',
  address: '123 Dairy Road, Mumbai, Maharashtra',
  contactNumber: '+91 9876543210',
  email: 'info@vikasmilkcentre.com',
  gstNumber: 'GSTIN12345678',
  bankDetails: 'Bank: SBI\nAccount: 123456789\nIFSC: SBIN0001234',
};

const defaultInvoiceTemplates: InvoiceTemplate[] = [
  { id: 'standard', name: 'Standard', thumbnail: '/assets/invoice-standard.png' },
  { id: 'modern', name: 'Modern', thumbnail: '/assets/invoice-modern.png' },
  { id: 'professional', name: 'Professional', thumbnail: '/assets/invoice-professional.png'  },
];

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates] = useState<InvoiceTemplate[]>(defaultInvoiceTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
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
      setSelectedTemplate(storedTemplate);
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
    localStorage.setItem('selectedInvoiceTemplate', selectedTemplate);
  }, [selectedTemplate]);
  
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
  
  const getInvoice = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
  };
  
  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...info }));
  };
  
  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        templates,
        selectedTemplate,
        companyInfo,
        colorScheme,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        setSelectedTemplate,
        updateCompanyInfo,
        setColorScheme,
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
