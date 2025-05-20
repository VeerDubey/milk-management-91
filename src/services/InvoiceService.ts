
import { Invoice, OrderItem } from "@/types";
import { generateInvoiceNumber } from "@/utils/invoiceUtils";

/**
 * Creates an invoice from an order
 */
export const createInvoice = (orderId: string, customerId: string, customerName: string, items: OrderItem[]): Invoice => {
  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Create invoice object
  return {
    id: `INV-${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(),
    customerId,
    number: generateInvoiceNumber(),
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    items: items.map(item => ({
      productId: item.productId,
      description: item.productName || "Product",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice
    })),
    status: "draft",
    subtotal: total,
    taxRate: 0,
    taxAmount: 0,
    total,
    notes: "",
    termsAndConditions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Additional fields for compatibility 
    orderId,
    customerName,
    amount: total
  };
};

/**
 * Creates an invoice from form data
 */
export const createInvoiceFromForm = (formData: {
  customerId: string;
  customerName: string;
  items: OrderItem[];
  date?: string;
  notes?: string;
}): Invoice => {
  // Calculate total
  const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  const date = formData.date || new Date().toISOString();
  const dueDate = new Date(new Date(date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(); // 15 days from now
  
  // Create invoice object
  return {
    id: `INV-${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(),
    customerId: formData.customerId,
    number: generateInvoiceNumber(),
    date,
    dueDate,
    items: formData.items.map(item => ({
      productId: item.productId,
      description: item.productName || "Product",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice
    })),
    status: "draft",
    subtotal: total,
    taxRate: 0,
    taxAmount: 0,
    total,
    notes: formData.notes || "",
    termsAndConditions: "",
    createdAt: date,
    updatedAt: date,
    // Additional fields for compatibility
    customerName: formData.customerName,
    amount: total
  };
};

/**
 * Creates a new blank invoice
 */
export const createBlankInvoice = (): Invoice => {
  const today = new Date().toISOString();
  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(); // 15 days from now
  
  return {
    id: `INV-${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(),
    customerId: "",
    number: generateInvoiceNumber(),
    date: today,
    dueDate,
    items: [],
    status: "draft",
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    notes: "",
    termsAndConditions: "",
    createdAt: today,
    updatedAt: today,
    // Additional fields for compatibility
    amount: 0
  };
};

/**
 * Service class for invoices
 */
class InvoiceService {
  /**
   * Creates a new invoice
   */
  static createInvoice(data: any): Invoice {
    return {
      id: data.id,
      customerId: data.customerId,
      number: generateInvoiceNumber(),
      date: data.date,
      dueDate: new Date(new Date(data.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      items: data.items.map((item: any) => ({
        productId: item.productId,
        description: item.productName || "Product",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice
      })),
      status: "draft",
      subtotal: data.total,
      taxRate: 0,
      taxAmount: 0,
      total: data.total,
      invoiceNumber: generateInvoiceNumber(),
      notes: "",
      termsAndConditions: "",
      createdAt: data.date,
      updatedAt: data.date,
      // Additional fields for compatibility
      orderId: data.orderId,
      customerName: data.customerName,
      amount: data.total
    };
  }
}

export default InvoiceService;
