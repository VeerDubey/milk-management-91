
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Invoice } from "@/types";
import { INVOICE_TEMPLATES, generateInvoicePreview as generatePreview } from "@/utils/invoiceUtils";
import { toast } from "sonner";

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  generateInvoicePreview: (invoice: Invoice, templateId?: string) => string;
  downloadInvoice: (invoiceId: string) => Promise<void>;
  companyInfo: {
    companyName: string;
    address: string;
    contactNumber: string;
    email: string;
    gstNumber: string;
    bankDetails: string;
    logoUrl?: string;
  };
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  templates: typeof INVOICE_TEMPLATES;
}

interface CompanyInfo {
  companyName: string;
  address: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
  bankDetails: string;
  logoUrl?: string;
}

const defaultCompanyInfo: CompanyInfo = {
  companyName: "Your Business Name",
  address: "123 Business St, City, State, ZIP",
  contactNumber: "+91 9876543210",
  email: "contact@yourbusiness.com",
  gstNumber: "29ABCDE1234F1Z5",
  bankDetails: "Bank: HDFC Bank, Acc: 12345678901, IFSC: HDFC0001234"
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const savedInvoices = localStorage.getItem("invoices");
    return savedInvoices ? JSON.parse(savedInvoices) : [];
  });
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    const savedInfo = localStorage.getItem("companyInfo");
    return savedInfo ? JSON.parse(savedInfo) : defaultCompanyInfo;
  });
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return localStorage.getItem("selectedInvoiceTemplate") || "standard";
  });

  React.useEffect(() => {
    localStorage.setItem("invoices", JSON.stringify(invoices));
  }, [invoices]);
  
  React.useEffect(() => {
    localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
  }, [companyInfo]);
  
  React.useEffect(() => {
    localStorage.setItem("selectedInvoiceTemplate", selectedTemplateId);
  }, [selectedTemplateId]);

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice]);
    return invoice.id;
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...invoiceData } : invoice
      )
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
  };

  const generateInvoicePreview = (invoice: Invoice, templateId?: string) => {
    try {
      const products = invoice.items.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
        description: `${item.quantity} ${item.unit}` 
      }));
      
      // Use the selected template or the provided template ID
      const templateToUse = templateId || selectedTemplateId;
      
      return generatePreview(
        invoice,
        companyInfo,
        products,
        templateToUse
      );
    } catch (error) {
      console.error("Error generating invoice preview:", error);
      toast.error("Failed to generate invoice preview");
      return "";
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }
      
      const pdfUrl = generateInvoicePreview(invoice);
      
      // Create a temporary link to download the PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Invoice-${invoice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...info }));
  };

  const value = {
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    generateInvoicePreview,
    downloadInvoice,
    companyInfo,
    updateCompanyInfo,
    selectedTemplateId,
    setSelectedTemplateId,
    templates: INVOICE_TEMPLATES
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoices must be used within an InvoiceProvider");
  }
  return context;
};
