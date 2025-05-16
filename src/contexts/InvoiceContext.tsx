import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Invoice as TypesInvoice, OrderItem } from "@/types";

// Define a local invoice type that extends the global one with what we need
interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number; // Using totalAmount internally
  total?: number; // For compatibility with TypesInvoice
  amount?: number; // For compatibility with TypesInvoice
  notes?: string;
  terms?: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  discountPercentage?: number;
  taxRate?: number;
  templateId?: string;
  invoiceNumber: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  colorScheme: string;
  primaryColor: string;
  fontFamily: string;
  description?: string;
  headerStyle?: string;
  bodyStyle?: string;
  footerStyle?: string;
}

interface CompanyInfo {
  companyName: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  gstNumber?: string;
  bankDetails?: string;
  logoUrl?: string;
}

interface InvoiceContextType {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  createInvoice: (invoiceData: Omit<Invoice, "id">) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  calculateTotal: (items: OrderItem[]) => number;
  generateInvoiceNumber: () => string;
  templates: InvoiceTemplate[];
  currentTemplate: InvoiceTemplate | null;
  setCurrentTemplate: (template: InvoiceTemplate | null) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  downloadInvoice: (invoiceId: string) => Promise<void>;
  generateInvoicePreview: (invoice: Invoice, templateId?: string) => string;
  getInvoiceById: (id: string) => Invoice | undefined;
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: CompanyInfo) => void;
}

const defaultTemplates: InvoiceTemplate[] = [
  {
    id: "default",
    name: "Default",
    colorScheme: "blue",
    primaryColor: "#2563eb",
    fontFamily: "Inter",
    description: "Simple and clean invoice template",
  },
  {
    id: "professional",
    name: "Professional",
    colorScheme: "gray",
    primaryColor: "#4b5563",
    fontFamily: "Montserrat",
    description: "Elegant business invoice template",
  },
  {
    id: "modern",
    name: "Modern",
    colorScheme: "green",
    primaryColor: "#10b981",
    fontFamily: "Poppins",
    description: "Contemporary invoice design",
  },
];

const defaultInvoice: Invoice = {
  id: "",
  customerId: "", // Added missing required field
  customerName: "",
  date: new Date().toISOString().split("T")[0],
  items: [],
  totalAmount: 0,
  subtotal: 0, // Added missing required field
  invoiceNumber: "", // Added missing required field
  notes: "",
  terms: "Payment due within 30 days",
  status: "draft",
  discountPercentage: 0,
  taxRate: 0,
};

const defaultCompanyInfo: CompanyInfo = {
  companyName: "Your Company Name",
  address: "",
  contactNumber: "",
  email: "",
  gstNumber: "",
  bankDetails: "",
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [templates] = useState<InvoiceTemplate[]>(defaultTemplates);
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate | null>(defaultTemplates[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplates[0].id);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + (item.price || item.quantity * item.unitPrice), 0);
  };

  const calculateFinalTotal = (invoice: Invoice) => {
    const subtotal = calculateTotal(invoice.items);
    
    // Apply discount if present
    const discountAmount = invoice.discountPercentage ? 
      subtotal * (invoice.discountPercentage / 100) : 0;
    
    const afterDiscount = subtotal - discountAmount;
    
    // Apply tax if present
    const taxAmount = invoice.taxRate ? 
      afterDiscount * (invoice.taxRate / 100) : 0;
    
    return afterDiscount + taxAmount;
  };

  const createInvoice = (invoiceData: Omit<Invoice, "id">) => {
    const newInvoice = {
      ...invoiceData,
      id: uuidv4(),
      totalAmount: calculateFinalTotal({ ...invoiceData, id: "" })
    };
    
    setInvoices((prev) => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (invoice: Invoice) => {
    const updatedInvoice = {
      ...invoice,
      totalAmount: calculateFinalTotal(invoice)
    };
    
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoice.id ? updatedInvoice : i))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  };

  const generateInvoiceNumber = () => {
    const prefix = "INV";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${year}${month}-${random}`;
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
  };

  const getInvoiceById = (id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  };

  // Mock function for downloading invoice
  const downloadInvoice = async (invoiceId: string) => {
    return new Promise<void>((resolve) => {
      // Mock download delay
      setTimeout(() => {
        console.log(`Downloading invoice ${invoiceId}`);
        resolve();
      }, 1000);
    });
  };

  // Mock function for generating invoice preview
  const generateInvoicePreview = (invoice: Invoice, templateId?: string) => {
    // This would normally generate an HTML preview or PDF data URL
    // For now just return a placeholder
    return `data:text/html,<html><body><h1>Invoice Preview for ${invoice.id}</h1><p>Using template: ${templateId || selectedTemplateId}</p></body></html>`;
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        currentInvoice,
        setCurrentInvoice,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        calculateTotal,
        generateInvoiceNumber,
        templates,
        currentTemplate,
        setCurrentTemplate,
        selectedTemplateId,
        setSelectedTemplateId,
        downloadInvoice,
        generateInvoicePreview,
        getInvoiceById,
        companyInfo,
        updateCompanyInfo,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
};
