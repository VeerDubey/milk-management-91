
import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface OrderItem {
  productId: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  terms?: string;
  status?: string;
  discountPercentage?: number;
  taxRate?: number;
  templateId?: string;
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
}

interface InvoiceTemplate {
  id: string;
  name: string;
  colorScheme: string;
  headerStyle?: string;
  bodyStyle?: string;
  footerStyle?: string;
}

const defaultTemplates: InvoiceTemplate[] = [
  {
    id: "default",
    name: "Default",
    colorScheme: "blue",
  },
  {
    id: "professional",
    name: "Professional",
    colorScheme: "gray",
  },
  {
    id: "modern",
    name: "Modern",
    colorScheme: "green",
  },
];

const defaultInvoice: Invoice = {
  id: "",
  customerName: "",
  date: new Date().toISOString().split("T")[0],
  items: [],
  totalAmount: 0,
  notes: "",
  terms: "Payment due within 30 days",
  status: "draft",
  discountPercentage: 0,
  taxRate: 0,
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [templates] = useState<InvoiceTemplate[]>(defaultTemplates);
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate | null>(defaultTemplates[0]);

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
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
