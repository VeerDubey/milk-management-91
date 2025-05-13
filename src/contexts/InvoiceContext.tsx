
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { InvoiceService } from '@/services/InvoiceService';
import { Invoice } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Define the context types
interface InvoiceContextType {
  // Basic invoice functionality
  createInvoice: Function | null;
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => boolean;
  getInvoiceById: (id: string) => Invoice | undefined;
  
  // Company info
  companyInfo: {
    companyName: string;
    address: string;
    contactNumber: string;
    email: string;
    gstNumber: string;
    bankDetails: string;
    logoUrl?: string;
  };
  updateCompanyInfo: (info: any) => void;
  
  // Template management
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  
  // Invoice operations
  downloadInvoice: (invoiceId: string, templateId?: string) => Promise<boolean>;
  generateInvoicePreview: (invoice: Invoice, templateId?: string) => string;
  createInvoiceFromOrder: (orderId: string, customerId: string) => Invoice | null;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

interface InvoiceProviderProps {
  children: ReactNode;
  products?: any[];
  customers?: any[];
  orders?: any[];
}

export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({ 
  children,
  products = [],
  customers = [],
  orders = []
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companyInfo, setCompanyInfo] = useState(() => InvoiceService.getCompanyInfo());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("standard");
  const [createInvoice, setCreateInvoice] = useState<Function | null>(null);
  
  // Load invoices from localStorage on mount
  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem('invoices');
      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      }
    } catch (error) {
      console.error('Error loading invoices from localStorage:', error);
    }
  }, []);
  
  // Save invoices to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error saving invoices to localStorage:', error);
    }
  }, [invoices]);
  
  // Add a new invoice
  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    toast.success(`Invoice ${invoice.id} created successfully`);
  };
  
  // Update an existing invoice
  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === id ? { ...inv, ...invoiceData } : inv
      )
    );
    toast.success(`Invoice ${id} updated`);
  };
  
  // Delete an invoice
  const deleteInvoice = (id: string): boolean => {
    try {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  };
  
  // Get invoice by ID
  const getInvoiceById = (id: string): Invoice | undefined => {
    return invoices.find(inv => inv.id === id);
  };
  
  // Update company information
  const updateCompanyInfo = (info: any) => {
    setCompanyInfo(prev => ({ ...prev, ...info }));
    InvoiceService.saveCompanyInfo({ ...companyInfo, ...info });
  };
  
  // Download invoice as PDF
  const downloadInvoice = async (invoiceId: string, templateId?: string): Promise<boolean> => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) {
      toast.error(`Invoice ${invoiceId} not found`);
      return false;
    }
    
    try {
      const success = await InvoiceService.downloadInvoice(
        invoice,
        companyInfo,
        products || [],
        templateId || selectedTemplateId
      );
      
      if (success) {
        toast.success(`Invoice ${invoiceId} downloaded successfully`);
      }
      
      return success;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
      return false;
    }
  };
  
  // Generate invoice preview
  const generateInvoicePreview = (invoice: Invoice, templateId?: string): string => {
    return InvoiceService.generatePreviewUrl(
      invoice,
      companyInfo,
      products || [],
      templateId || selectedTemplateId
    );
  };
  
  // Create invoice from order
  const createInvoiceFromOrder = (orderId: string, customerId: string): Invoice | null => {
    try {
      const order = orders?.find(o => o.id === orderId);
      const customer = customers?.find(c => c.id === customerId);
      
      if (!order || !customer) {
        toast.error(`Order or customer not found`);
        return null;
      }
      
      // Generate a new invoice from the order
      const invoice = {
        id: `INV-${Date.now().toString().substring(7)}-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: order.id,
        customerName: customer.name,
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: order.totalAmount || 0,
        status: "Pending",
        items: order.items || []
      };
      
      // Add the new invoice to the state
      addInvoice(invoice);
      return invoice;
    } catch (error) {
      console.error('Error creating invoice from order:', error);
      toast.error('Failed to create invoice from order');
      return null;
    }
  };
  
  const value = {
    createInvoice,
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    companyInfo,
    updateCompanyInfo,
    selectedTemplateId,
    setSelectedTemplateId,
    downloadInvoice,
    generateInvoicePreview,
    createInvoiceFromOrder
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
};

// Export the useInvoice hook
export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};

// Also export a hook with the plural name for backward compatibility
export const useInvoices = useInvoice;
