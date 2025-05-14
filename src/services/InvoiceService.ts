import { Invoice, Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MOCK_INVOICES: Invoice[] = [
  {
    id: uuidv4(),
    orderId: 'ORD-20231115-1234',
    customerId: 'cust001',
    customerName: 'John Doe',
    date: '2023-11-15',
    subtotal: 200.00,
    total: 220.00,
    amount: 220.00, // Alias for total for backward compatibility
    status: 'paid',
    items: [
      { id: uuidv4(), productId: 'prod001', productName: 'Product A', quantity: 2, unitPrice: 50.00, unit: 'pcs' },
      { id: uuidv4(), productId: 'prod002', productName: 'Product B', quantity: 1, unitPrice: 100.00, unit: 'pcs' },
    ],
    invoiceNumber: 'INV-20231115-0001'
  },
  {
    id: uuidv4(),
    orderId: 'ORD-20231110-5678',
    customerId: 'cust002',
    customerName: 'Jane Smith',
    date: '2023-11-10',
    subtotal: 150.00,
    total: 165.00,
    amount: 165.00, // Alias for total for backward compatibility
    status: 'pending',
    items: [
      { id: uuidv4(), productId: 'prod003', productName: 'Product C', quantity: 3, unitPrice: 50.00, unit: 'pcs' },
    ],
    invoiceNumber: 'INV-20231110-0002'
  },
  {
    id: uuidv4(),
    orderId: 'ORD-20231105-9012',
    customerId: 'cust001',
    customerName: 'John Doe',
    date: '2023-11-05',
    subtotal: 100.00,
    total: 110.00,
    amount: 110.00, // Alias for total for backward compatibility
    status: 'cancelled',
    items: [
      { id: uuidv4(), productId: 'prod002', productName: 'Product B', quantity: 1, unitPrice: 100.00, unit: 'pcs' },
    ],
    invoiceNumber: 'INV-20231105-0003'
  },
];

// Function to fetch all invoices
export const getAllInvoices = (): Invoice[] => {
  return MOCK_INVOICES;
};

// Function to fetch a single invoice by ID
export const getInvoiceById = (id: string): Invoice | undefined => {
  return MOCK_INVOICES.find(invoice => invoice.id === id);
};

// Function to create a new invoice
export const createInvoice = (invoice: Invoice): Invoice => {
  const newInvoice = { ...invoice, id: uuidv4() };
  MOCK_INVOICES.push(newInvoice);
  return newInvoice;
};

// Function to update an existing invoice
export const updateInvoice = (id: string, updatedInvoice: Invoice): Invoice | undefined => {
  const index = MOCK_INVOICES.findIndex(invoice => invoice.id === id);
  if (index !== -1) {
    MOCK_INVOICES[index] = { ...updatedInvoice, id: id };
    return MOCK_INVOICES[index];
  }
  return undefined;
};

// Function to delete an invoice by ID
export const deleteInvoice = (id: string): boolean => {
  const index = MOCK_INVOICES.findIndex(invoice => invoice.id === id);
  if (index !== -1) {
    MOCK_INVOICES.splice(index, 1);
    return true;
  }
  return false;
};

// Function to generate a PDF for an invoice (mock implementation)
export const generateInvoicePDF = async (invoiceId: string): Promise<string> => {
  // In a real application, this function would use a library like jsPDF
  // to generate a PDF document from the invoice data.
  // For this mock, we'll just return a dummy base64 string.
  return new Promise((resolve) => {
    setTimeout(() => {
      const dummyPDF = 'data:application/pdf;base64,SGVsbG8gV29ybGQ=';
      resolve(dummyPDF);
    }, 500);
  });
};

// Function to create an invoice from an existing order
export const createInvoiceFromOrder = (order: Order): Invoice => {
  return {
    id: uuidv4(),
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    date: order.date,
    subtotal: order.total,
    total: order.total,
    amount: order.total, // For backward compatibility
    status: 'draft',
    items: order.items,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
  };
};
