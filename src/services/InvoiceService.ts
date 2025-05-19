
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
    customerName,
    orderId,
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    items: items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      productName: item.productName,
      unit: item.unit
    })),
    status: "draft",
    total
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
    customerName: formData.customerName,
    date,
    dueDate,
    items: formData.items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      productName: item.productName,
      unit: item.unit
    })),
    status: "draft",
    total,
    notes: formData.notes
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
    customerName: "",
    date: today,
    dueDate,
    items: [],
    status: "draft",
    total: 0
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
      customerName: data.customerName,
      date: data.date,
      dueDate: new Date(new Date(data.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      items: data.items,
      status: "draft",
      total: data.total,
      invoiceNumber: generateInvoiceNumber(),
      orderId: data.orderId
    };
  }
}

export default InvoiceService;
