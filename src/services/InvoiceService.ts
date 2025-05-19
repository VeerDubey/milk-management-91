// InvoiceService.ts
import { Invoice } from "@/types";

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    customerId: "CUST-001",
    customerName: "John Doe",
    date: "2024-01-20",
    dueDate: "2024-01-30",
    items: [
      { id: "ITEM-001", productId: "PROD-001", productName: "Product A", quantity: 2, unitPrice: 50, unit: "pcs" },
      { id: "ITEM-002", productId: "PROD-002", productName: "Product B", quantity: 1, unitPrice: 100, unit: "pcs" }
    ],
    subtotal: 200,
    tax: 20,
    discount: 10,
    total: 210,
    status: "sent",
    invoiceNumber: "INV-2024-001"
  },
  {
    id: "INV-002",
    customerId: "CUST-002",
    customerName: "Jane Smith",
    date: "2024-01-15",
    dueDate: "2024-01-25",
    items: [
      { id: "ITEM-003", productId: "PROD-003", productName: "Product C", quantity: 3, unitPrice: 30, unit: "pcs" }
    ],
    subtotal: 90,
    tax: 9,
    discount: 0,
    total: 99,
    status: "paid",
    invoiceNumber: "INV-2024-002"
  },
  {
    id: "INV-003",
    customerId: "CUST-003",
    customerName: "Robert Johnson",
    date: "2024-01-10",
    dueDate: "2024-01-20",
    items: [
      { id: "ITEM-004", productId: "PROD-004", productName: "Product D", quantity: 1, unitPrice: 150, unit: "pcs" }
    ],
    subtotal: 150,
    tax: 15,
    discount: 5,
    total: 160,
    status: "overdue",
    invoiceNumber: "INV-2024-003"
  }
];

export const getInvoices = async (): Promise<Invoice[]> => {
  return mockInvoices;
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  return mockInvoices.find(invoice => invoice.id === id);
};

export const createInvoice = async (invoice: Invoice): Promise<Invoice> => {
  mockInvoices.push(invoice);
  return invoice;
};

export const updateInvoice = async (id: string, updatedInvoice: Invoice): Promise<Invoice | undefined> => {
  const index = mockInvoices.findIndex(invoice => invoice.id === id);
  if (index !== -1) {
    mockInvoices[index] = { ...mockInvoices[index], ...updatedInvoice };
    return mockInvoices[index];
  }
  return undefined;
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  const index = mockInvoices.findIndex(invoice => invoice.id === id);
  if (index !== -1) {
    mockInvoices.splice(index, 1);
    return true;
  }
  return false;
};

export const convertOrderToInvoice = (order: any): Invoice => {
  return {
    id: order.id || "",
    customerId: order.customerId || "",
    customerName: order.customerName || "",
    date: order.date || new Date().toISOString(),
    items: order.items || [],
    status: "draft", // Fixed status to use valid value from Invoice type
    subtotal: order.totalAmount || 0,
    total: order.totalAmount || 0,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    orderId: order.id
  };
};

export const createInvoiceItems = (products, quantities) => {
  const items = [];
  products.forEach((product, index) => {
    items.push({
      productId: product.id,
      quantity: quantities[index],
      unitPrice: product.price,
      // Don't include productName as it's not in the OrderItem interface
    });
  });
  return items;
};

export const createInvoice = (customer, items, date) => {
  return {
    id: `INV-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.name,
    date: date || new Date().toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // Add due date 15 days from now
    items: items,
    status: "draft",
    subtotal: calculateSubtotal(items),
    total: calculateTotal(items),
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    orderId: null
  };
};

const calculateSubtotal = (items) => {
  return items.reduce((subtotal, item) => subtotal + item.quantity * item.unitPrice, 0);
};

const calculateTotal = (items) => {
  const subtotal = calculateSubtotal(items);
  return subtotal + subtotal * 0.2; // Assuming 20% tax
};
