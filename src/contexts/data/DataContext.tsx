
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfflineStorageService } from '@/services/OfflineStorageService';
import { toast } from 'sonner';

// Define types for our data
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  outstandingBalance?: number;
  lastPaymentDate?: string;
  // Add other customer properties as needed
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  // Add other product properties as needed
}

interface Order {
  id: string;
  customerId: string;
  products: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  date: string;
  status: 'pending' | 'delivered' | 'canceled';
  // Add other order properties as needed
}

interface Invoice {
  id: string;
  customerId: string;
  orderId?: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  // Add other invoice properties as needed
}

interface UISettings {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  language: string;
  // Add other UI settings as needed
}

interface DataContextType {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  invoices: Invoice[];
  uiSettings: UISettings;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  updateUISettings: (settings: Partial<UISettings>) => void;
}

// Generate a mock ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Create the context
const DataContext = createContext<DataContextType>({
  customers: [],
  products: [],
  orders: [],
  invoices: [],
  uiSettings: {
    sidebarCollapsed: false,
    darkMode: false,
    language: 'en',
  },
  addCustomer: async () => ({ id: '', name: '', phone: '' }),
  updateCustomer: async () => null,
  deleteCustomer: async () => false,
  addProduct: async () => ({ id: '', name: '', price: 0 }),
  updateProduct: async () => null,
  deleteProduct: async () => false,
  addOrder: async () => ({ 
    id: '', 
    customerId: '', 
    products: [], 
    totalAmount: 0, 
    date: new Date().toISOString(), 
    status: 'pending' 
  }),
  updateOrder: async () => null,
  deleteOrder: async () => false,
  addInvoice: async () => ({ 
    id: '', 
    customerId: '', 
    amount: 0, 
    date: new Date().toISOString(),
    dueDate: new Date().toISOString(), 
    status: 'pending' 
  }),
  updateInvoice: async () => null,
  deleteInvoice: async () => false,
  updateUISettings: () => {},
});

// Generate mock data
const generateMockData = () => {
  // Mock customers
  const mockCustomers: Customer[] = [
    { 
      id: '1', 
      name: 'Raj Sharma', 
      email: 'raj.sharma@example.com', 
      phone: '9876543210',
      address: '123 Main St, Mumbai',
      outstandingBalance: 5000,
      lastPaymentDate: '2023-02-15'
    },
    { 
      id: '2', 
      name: 'Priya Patel', 
      email: 'priya.patel@example.com', 
      phone: '8765432109',
      address: '456 Park Ave, Delhi',
      outstandingBalance: 3500,
      lastPaymentDate: '2023-04-10'
    },
    { 
      id: '3', 
      name: 'Vikram Singh', 
      email: 'vikram.singh@example.com', 
      phone: '7654321098',
      address: '789 Oak Rd, Bangalore',
      outstandingBalance: 7800,
      lastPaymentDate: '2023-01-05'
    },
    { 
      id: '4', 
      name: 'Ananya Gupta', 
      email: 'ananya.gupta@example.com', 
      phone: '6543210987',
      address: '234 Maple Dr, Chennai',
      outstandingBalance: 0,
      lastPaymentDate: '2023-05-20'
    },
    { 
      id: '5', 
      name: 'Mahesh Kumar', 
      email: 'mahesh.kumar@example.com', 
      phone: '5432109876',
      address: '567 Pine St, Hyderabad',
      outstandingBalance: 12000,
      lastPaymentDate: '2022-11-12'
    }
  ];

  // Mock products
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Full Cream Milk',
      description: 'Fresh full cream milk with high fat content',
      price: 60,
      stock: 200
    },
    {
      id: '2',
      name: 'Toned Milk',
      description: 'Milk with 3% fat content',
      price: 45,
      stock: 350
    },
    {
      id: '3',
      name: 'Double Toned Milk',
      description: 'Milk with 1.5% fat content',
      price: 40,
      stock: 280
    },
    {
      id: '4',
      name: 'Paneer',
      description: 'Fresh homemade cottage cheese',
      price: 320,
      stock: 50
    },
    {
      id: '5',
      name: 'Curd',
      description: 'Natural probiotic yogurt',
      price: 80,
      stock: 120
    }
  ];

  // Mock orders
  const mockOrders: Order[] = [
    {
      id: '1',
      customerId: '1',
      products: [
        { productId: '1', quantity: 5, price: 60 },
        { productId: '4', quantity: 1, price: 320 }
      ],
      totalAmount: 620,
      date: '2023-05-10T08:30:00Z',
      status: 'delivered'
    },
    {
      id: '2',
      customerId: '2',
      products: [
        { productId: '2', quantity: 3, price: 45 },
        { productId: '5', quantity: 2, price: 80 }
      ],
      totalAmount: 295,
      date: '2023-05-11T09:15:00Z',
      status: 'delivered'
    },
    {
      id: '3',
      customerId: '3',
      products: [
        { productId: '1', quantity: 2, price: 60 },
        { productId: '3', quantity: 4, price: 40 }
      ],
      totalAmount: 280,
      date: '2023-05-12T10:00:00Z',
      status: 'pending'
    }
  ];

  // Mock invoices
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      customerId: '1',
      orderId: '1',
      amount: 620,
      date: '2023-05-10T08:30:00Z',
      dueDate: '2023-05-24T08:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      customerId: '2',
      orderId: '2',
      amount: 295,
      date: '2023-05-11T09:15:00Z',
      dueDate: '2023-05-25T09:15:00Z',
      status: 'paid'
    },
    {
      id: '3',
      customerId: '3',
      orderId: '3',
      amount: 280,
      date: '2023-05-12T10:00:00Z',
      dueDate: '2023-05-26T10:00:00Z',
      status: 'overdue'
    }
  ];

  return { mockCustomers, mockProducts, mockOrders, mockInvoices };
};

// Create the provider
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mockCustomers, mockProducts, mockOrders, mockInvoices } = generateMockData();
  
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [uiSettings, setUISettings] = useState<UISettings>({
    sidebarCollapsed: false,
    darkMode: false,
    language: 'en',
  });

  // Load data from local storage on initialization
  useEffect(() => {
    try {
      const storedCustomers = localStorage.getItem('customers');
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));

      const storedProducts = localStorage.getItem('products');
      if (storedProducts) setProducts(JSON.parse(storedProducts));

      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));

      const storedUISettings = localStorage.getItem('uiSettings');
      if (storedUISettings) setUISettings(JSON.parse(storedUISettings));
    } catch (error) {
      console.error('Error loading data from local storage:', error);
      toast.error('Failed to load local data.');
    }
  }, []);

  // Save data to local storage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('customers', JSON.stringify(customers));
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('invoices', JSON.stringify(invoices));
      localStorage.setItem('uiSettings', JSON.stringify(uiSettings));
    } catch (error) {
      console.error('Error saving data to local storage:', error);
      toast.error('Failed to save data locally.');
    }
  }, [customers, products, orders, invoices, uiSettings]);

  // Customer CRUD operations
  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    const newCustomer = { ...customerData, id: generateId() };
    setCustomers(prev => [...prev, newCustomer]);
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'ADD_CUSTOMER',
        data: newCustomer
      });
    }
    return newCustomer;
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer | null> => {
    let updatedCustomer: Customer | null = null;
    
    setCustomers(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      
      updatedCustomer = { ...prev[index], ...customerData };
      const newCustomers = [...prev];
      newCustomers[index] = updatedCustomer as Customer;
      return newCustomers;
    });
    
    if (!OfflineStorageService.isOnline() && updatedCustomer) {
      OfflineStorageService.queueOfflineAction({
        type: 'UPDATE_CUSTOMER',
        data: { id, ...customerData }
      });
    }
    
    return updatedCustomer;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'DELETE_CUSTOMER',
        data: { id }
      });
    }
    
    return true;
  };

  // Product CRUD operations
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = { ...productData, id: generateId() };
    setProducts(prev => [...prev, newProduct]);
    
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'ADD_PRODUCT',
        data: newProduct
      });
    }
    
    return newProduct;
  };

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product | null> => {
    let updatedProduct: Product | null = null;
    
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      
      updatedProduct = { ...prev[index], ...productData };
      const newProducts = [...prev];
      newProducts[index] = updatedProduct as Product;
      return newProducts;
    });
    
    if (!OfflineStorageService.isOnline() && updatedProduct) {
      OfflineStorageService.queueOfflineAction({
        type: 'UPDATE_PRODUCT',
        data: { id, ...productData }
      });
    }
    
    return updatedProduct;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setProducts(prev => prev.filter(p => p.id !== id));
    
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'DELETE_PRODUCT',
        data: { id }
      });
    }
    
    return true;
  };

  // Order CRUD operations
  const addOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    const newOrder = { ...orderData, id: generateId() };
    setOrders(prev => [...prev, newOrder]);
    
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'ADD_ORDER',
        data: newOrder
      });
    }
    
    return newOrder;
  };

  const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order | null> => {
    let updatedOrder: Order | null = null;
    
    setOrders(prev => {
      const index = prev.findIndex(o => o.id === id);
      if (index === -1) return prev;
      
      updatedOrder = { ...prev[index], ...orderData };
      const newOrders = [...prev];
      newOrders[index] = updatedOrder as Order;
      return newOrders;
    });
    
    if (!OfflineStorageService.isOnline() && updatedOrder) {
      OfflineStorageService.queueOfflineAction({
        type: 'UPDATE_ORDER',
        data: { id, ...orderData }
      });
    }
    
    return updatedOrder;
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    setOrders(prev => prev.filter(o => o.id !== id));
    
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'DELETE_ORDER',
        data: { id }
      });
    }
    
    return true;
  };

  // Invoice CRUD operations
  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> => {
    const newInvoice = { ...invoiceData, id: generateId() };
    setInvoices(prev => [...prev, newInvoice]);
    
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'ADD_INVOICE',
        data: newInvoice
      });
    }
    
    return newInvoice;
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice | null> => {
    let updatedInvoice: Invoice | null = null;
    
    setInvoices(prev => {
      const index = prev.findIndex(i => i.id === id);
      if (index === -1) return prev;
      
      updatedInvoice = { ...prev[index], ...invoiceData };
      const newInvoices = [...prev];
      newInvoices[index] = updatedInvoice as Invoice;
      return newInvoices;
    });
    
    if (!OfflineStorageService.isOnline() && updatedInvoice) {
      OfflineStorageService.queueOfflineAction({
        type: 'UPDATE_INVOICE',
        data: { id, ...invoiceData }
      });
    }
    
    return updatedInvoice;
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    
    if (!OfflineStorageService.isOnline()) {
      OfflineStorageService.queueOfflineAction({
        type: 'DELETE_INVOICE',
        data: { id }
      });
    }
    
    return true;
  };

  // UI Settings
  const updateUISettings = (settings: Partial<UISettings>) => {
    setUISettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        products,
        orders,
        invoices,
        uiSettings,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrder,
        deleteOrder,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateUISettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
