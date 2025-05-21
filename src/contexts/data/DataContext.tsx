
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfflineStorageService } from '@/services/OfflineStorageService';
import { toast } from 'sonner';

// Define types for our data
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  outstandingBalance?: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  area?: string;
  isActive?: boolean;
  // Add other customer properties as needed
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
  // Add other product properties as needed
}

export interface Order {
  id: string;
  customerId: string;
  products: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  date: string;
  status: 'pending' | 'delivered' | 'canceled';
  vehicleId?: string;
  salesmanId?: string;
  items?: Array<any>; // For compatibility with existing code
  total?: number; // For compatibility with existing code
  // Add other order properties as needed
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  notes?: string;
  // Add other payment properties as needed
}

export interface Invoice {
  id: string;
  customerId: string;
  orderId?: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  // Add other invoice properties as needed
}

export interface CustomerProductRate {
  id: string;
  customerId: string;
  productId: string;
  rate: number;
  effectiveFrom: string;
  // Add other properties as needed
}

export interface SupplierProductRate {
  id: string;
  supplierId: string;
  productId: string;
  rate: number;
  effectiveFrom: string;
  // Add other properties as needed
}

export interface Supplier {
  id: string;
  name: string;
  // Add other properties as needed
}

export interface Vehicle {
  id: string;
  name: string;
  // Add other properties as needed
}

export interface Salesman {
  id: string;
  name: string;
  // Add other properties as needed
}

export interface UISettings {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  language: string;
  // Add other UI settings as needed
}

export interface DataContextType {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[]; // Added payments to DataContextType
  customerProductRates: CustomerProductRate[]; // Added for compatibility
  supplierProductRates: SupplierProductRate[]; // Added for compatibility
  suppliers: Supplier[]; // Added for compatibility 
  vehicles: Vehicle[]; // Added for compatibility
  salesmen: Salesman[]; // Added for compatibility
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
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment> | Payment; // Added for flexibility with different return types
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<Payment | null> | void;
  deletePayment: (id: string) => Promise<boolean> | void;
  deleteMultiplePayments: (ids: string[]) => void; // Added for compatibility
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  updateUISettings: (settings: Partial<UISettings>) => void;
  // Added for compatibility with existing code
  addCustomerProductRate: (rate: Omit<CustomerProductRate, 'id'>) => void;
  updateCustomerProductRate: (id: string, rate: Partial<CustomerProductRate>) => void;
  deleteCustomerProductRate?: (id: string) => void;
  getCustomerProductRates?: (customerId: string) => CustomerProductRate[];
  getProductRateForCustomer?: (customerId: string, productId: string) => number;
  addSupplierProductRate?: (rate: Omit<SupplierProductRate, 'id'>) => void;
  updateSupplierProductRate?: (id: string, rate: Partial<SupplierProductRate>) => void;
  deleteSupplierProductRate?: (id: string) => void;
  getSupplierProductRates?: (supplierId: string) => SupplierProductRate[];
  getProductRateForSupplier?: (supplierId: string, productId: string) => number | null;
  getSupplierRateHistory?: (supplierId: string, productId: string) => SupplierProductRate[];
  addSupplier?: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier?: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier?: (id: string) => void;
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
  payments: [], // Added payments array
  customerProductRates: [], // Added for compatibility
  supplierProductRates: [], // Added for compatibility
  suppliers: [], // Added for compatibility
  vehicles: [], // Added for compatibility
  salesmen: [], // Added for compatibility
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
  addPayment: () => ({ id: '', customerId: '', amount: 0, date: '', paymentMethod: 'cash' }),
  updatePayment: () => null,
  deletePayment: () => false,
  deleteMultiplePayments: () => {},
  updateUISettings: () => {},
  addCustomerProductRate: () => {},
  updateCustomerProductRate: () => {},
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
      lastPaymentDate: '2023-02-15',
      lastPaymentAmount: 2000,
      area: 'North Mumbai',
      isActive: true
    },
    { 
      id: '2', 
      name: 'Priya Patel', 
      email: 'priya.patel@example.com', 
      phone: '8765432109',
      address: '456 Park Ave, Delhi',
      outstandingBalance: 3500,
      lastPaymentDate: '2023-04-10',
      lastPaymentAmount: 1500,
      area: 'South Delhi',
      isActive: true
    },
    { 
      id: '3', 
      name: 'Vikram Singh', 
      email: 'vikram.singh@example.com', 
      phone: '7654321098',
      address: '789 Oak Rd, Bangalore',
      outstandingBalance: 7800,
      lastPaymentDate: '2023-01-05',
      lastPaymentAmount: 1200,
      area: 'Central Bangalore',
      isActive: true
    },
    { 
      id: '4', 
      name: 'Ananya Gupta', 
      email: 'ananya.gupta@example.com', 
      phone: '6543210987',
      address: '234 Maple Dr, Chennai',
      outstandingBalance: 0,
      lastPaymentDate: '2023-05-20',
      lastPaymentAmount: 3000,
      area: 'West Chennai',
      isActive: true
    },
    { 
      id: '5', 
      name: 'Mahesh Kumar', 
      email: 'mahesh.kumar@example.com', 
      phone: '5432109876',
      address: '567 Pine St, Hyderabad',
      outstandingBalance: 12000,
      lastPaymentDate: '2022-11-12',
      lastPaymentAmount: 4000,
      area: 'East Hyderabad',
      isActive: false
    }
  ];

  // Mock products
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Full Cream Milk',
      description: 'Fresh full cream milk with high fat content',
      price: 60,
      stock: 200,
      category: 'Milk'
    },
    {
      id: '2',
      name: 'Toned Milk',
      description: 'Milk with 3% fat content',
      price: 45,
      stock: 350,
      category: 'Milk'
    },
    {
      id: '3',
      name: 'Double Toned Milk',
      description: 'Milk with 1.5% fat content',
      price: 40,
      stock: 280,
      category: 'Milk'
    },
    {
      id: '4',
      name: 'Paneer',
      description: 'Fresh homemade cottage cheese',
      price: 320,
      stock: 50,
      category: 'Dairy Product'
    },
    {
      id: '5',
      name: 'Curd',
      description: 'Natural probiotic yogurt',
      price: 80,
      stock: 120,
      category: 'Dairy Product'
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
      items: [
        { productId: '1', quantity: 5, price: 60 },
        { productId: '4', quantity: 1, price: 320 }
      ],
      totalAmount: 620,
      total: 620,
      date: '2023-05-10T08:30:00Z',
      status: 'delivered',
      vehicleId: 'v1',
      salesmanId: 's1'
    },
    {
      id: '2',
      customerId: '2',
      products: [
        { productId: '2', quantity: 3, price: 45 },
        { productId: '5', quantity: 2, price: 80 }
      ],
      items: [
        { productId: '2', quantity: 3, price: 45 },
        { productId: '5', quantity: 2, price: 80 }
      ],
      totalAmount: 295,
      total: 295,
      date: '2023-05-11T09:15:00Z',
      status: 'delivered',
      vehicleId: 'v2',
      salesmanId: 's2'
    },
    {
      id: '3',
      customerId: '3',
      products: [
        { productId: '1', quantity: 2, price: 60 },
        { productId: '3', quantity: 4, price: 40 }
      ],
      items: [
        { productId: '1', quantity: 2, price: 60 },
        { productId: '3', quantity: 4, price: 40 }
      ],
      totalAmount: 280,
      total: 280,
      date: '2023-05-12T10:00:00Z',
      status: 'pending',
      vehicleId: 'v1',
      salesmanId: 's3'
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

  // Mock payments
  const mockPayments: Payment[] = [
    {
      id: '1',
      customerId: '1',
      amount: 2000,
      date: '2023-02-15',
      paymentMethod: 'cash',
      notes: 'Partial payment'
    },
    {
      id: '2',
      customerId: '2',
      amount: 1500,
      date: '2023-04-10',
      paymentMethod: 'upi',
      notes: 'Paid via PhonePe'
    },
    {
      id: '3',
      customerId: '3',
      amount: 1200,
      date: '2023-01-05',
      paymentMethod: 'bank',
      notes: 'Bank transfer'
    },
    {
      id: '4',
      customerId: '4',
      amount: 3000,
      date: '2023-05-20',
      paymentMethod: 'cash',
      notes: 'Full payment'
    }
  ];

  // Mock customer product rates
  const mockCustomerProductRates: CustomerProductRate[] = [
    {
      id: '1',
      customerId: '1',
      productId: '1',
      rate: 58,
      effectiveFrom: '2023-01-01'
    },
    {
      id: '2',
      customerId: '1',
      productId: '2',
      rate: 43,
      effectiveFrom: '2023-01-01'
    },
    {
      id: '3',
      customerId: '2',
      productId: '1',
      rate: 59,
      effectiveFrom: '2023-02-15'
    }
  ];

  // Mock supplier product rates
  const mockSupplierProductRates: SupplierProductRate[] = [
    {
      id: '1',
      supplierId: '1',
      productId: '1',
      rate: 50,
      effectiveFrom: '2023-01-01'
    },
    {
      id: '2',
      supplierId: '1',
      productId: '2',
      rate: 38,
      effectiveFrom: '2023-01-01'
    }
  ];

  // Mock suppliers
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'ABC Dairy Farm'
    },
    {
      id: '2',
      name: 'XYZ Milk Co-op'
    }
  ];

  // Mock vehicles
  const mockVehicles: Vehicle[] = [
    {
      id: 'v1',
      name: 'Delivery Van 1'
    },
    {
      id: 'v2',
      name: 'Delivery Van 2'
    }
  ];

  // Mock salesmen
  const mockSalesmen: Salesman[] = [
    {
      id: 's1',
      name: 'Ramesh'
    },
    {
      id: 's2',
      name: 'Suresh'
    },
    {
      id: 's3',
      name: 'Dinesh'
    }
  ];

  return {
    mockCustomers,
    mockProducts,
    mockOrders,
    mockInvoices,
    mockPayments,
    mockCustomerProductRates,
    mockSupplierProductRates,
    mockSuppliers,
    mockVehicles,
    mockSalesmen
  };
};

// Create the provider
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    mockCustomers,
    mockProducts,
    mockOrders,
    mockInvoices,
    mockPayments,
    mockCustomerProductRates,
    mockSupplierProductRates,
    mockSuppliers,
    mockVehicles,
    mockSalesmen
  } = generateMockData();
  
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [customerProductRates, setCustomerProductRates] = useState<CustomerProductRate[]>(mockCustomerProductRates);
  const [supplierProductRates, setSupplierProductRates] = useState<SupplierProductRate[]>(mockSupplierProductRates);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [salesmen, setSalesmen] = useState<Salesman[]>(mockSalesmen);
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

      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) setPayments(JSON.parse(storedPayments));

      const storedCustomerProductRates = localStorage.getItem('customerProductRates');
      if (storedCustomerProductRates) setCustomerProductRates(JSON.parse(storedCustomerProductRates));

      const storedSupplierProductRates = localStorage.getItem('supplierProductRates');
      if (storedSupplierProductRates) setSupplierProductRates(JSON.parse(storedSupplierProductRates));

      const storedSuppliers = localStorage.getItem('suppliers');
      if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));

      const storedVehicles = localStorage.getItem('vehicles');
      if (storedVehicles) setVehicles(JSON.parse(storedVehicles));

      const storedSalesmen = localStorage.getItem('salesmen');
      if (storedSalesmen) setSalesmen(JSON.parse(storedSalesmen));

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
      localStorage.setItem('payments', JSON.stringify(payments));
      localStorage.setItem('customerProductRates', JSON.stringify(customerProductRates));
      localStorage.setItem('supplierProductRates', JSON.stringify(supplierProductRates));
      localStorage.setItem('suppliers', JSON.stringify(suppliers));
      localStorage.setItem('vehicles', JSON.stringify(vehicles));
      localStorage.setItem('salesmen', JSON.stringify(salesmen));
      localStorage.setItem('uiSettings', JSON.stringify(uiSettings));
    } catch (error) {
      console.error('Error saving data to local storage:', error);
      toast.error('Failed to save data locally.');
    }
  }, [customers, products, orders, invoices, payments, customerProductRates, supplierProductRates, suppliers, vehicles, salesmen, uiSettings]);

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

  // Payment CRUD operations
  const addPayment = (paymentData: Omit<Payment, "id">): Payment => {
    const newPayment = {
      ...paymentData,
      id: `pay${Date.now()}`,
    };
    setPayments([...payments, newPayment]);
    
    // Update customer outstanding balance if applicable
    const customer = customers.find(c => c.id === paymentData.customerId);
    if (customer && customer.outstandingBalance !== undefined) {
      updateCustomer(customer.id, {
        outstandingBalance: customer.outstandingBalance - paymentData.amount,
        lastPaymentDate: paymentData.date,
        lastPaymentAmount: paymentData.amount
      });
    }
    
    return newPayment;
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    const oldPayment = payments.find(p => p.id === id);
    
    setPayments(
      payments.map((payment) =>
        payment.id === id ? { ...payment, ...paymentData } : payment
      )
    );
    
    if (oldPayment && paymentData.amount && oldPayment.amount !== paymentData.amount) {
      const customer = customers.find(c => c.id === oldPayment.customerId);
      if (customer && customer.outstandingBalance !== undefined) {
        const difference = paymentData.amount - oldPayment.amount;
        updateCustomer(customer.id, {
          outstandingBalance: customer.outstandingBalance - difference,
          lastPaymentAmount: paymentData.amount,
          lastPaymentDate: paymentData.date || oldPayment.date
        });
      }
    }
  };

  const deletePayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    
    if (payment) {
      const customer = customers.find(c => c.id === payment.customerId);
      if (customer && customer.outstandingBalance !== undefined) {
        updateCustomer(customer.id, {
          outstandingBalance: customer.outstandingBalance + payment.amount
        });
      }
    }
    
    setPayments(payments.filter((payment) => payment.id !== id));
  };
  
  // Delete multiple payments at once
  const deleteMultiplePayments = (ids: string[]) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    
    // Update customer balances for each payment being deleted
    ids.forEach(id => {
      const payment = payments.find(p => p.id === id);
      if (payment) {
        const customer = customers.find(c => c.id === payment.customerId);
        if (customer && customer.outstandingBalance !== undefined) {
          updateCustomer(customer.id, {
            outstandingBalance: customer.outstandingBalance + payment.amount
          });
        }
      }
    });
    
    // Remove the payments
    setPayments(payments.filter(payment => !ids.includes(payment.id)));
    
    toast.success(`${ids.length} payments deleted successfully`);
  };

  // Customer Product Rate operations
  const addCustomerProductRate = (rateData: Omit<CustomerProductRate, 'id'>) => {
    const newRate = { ...rateData, id: generateId() };
    setCustomerProductRates(prev => [...prev, newRate]);
  };

  const updateCustomerProductRate = (id: string, rateData: Partial<CustomerProductRate>) => {
    setCustomerProductRates(prev => 
      prev.map(rate => rate.id === id ? { ...rate, ...rateData } : rate)
    );
  };

  const deleteCustomerProductRate = (id: string) => {
    setCustomerProductRates(prev => prev.filter(rate => rate.id !== id));
  };

  const getCustomerProductRates = (customerId: string) => {
    return customerProductRates.filter(rate => rate.customerId === customerId);
  };

  const getProductRateForCustomer = (customerId: string, productId: string) => {
    const rate = customerProductRates
      .filter(r => r.customerId === customerId && r.productId === productId)
      .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())[0];
    
    return rate ? rate.rate : 0;
  };

  // Supplier Product Rate operations
  const addSupplierProductRate = (rateData: Omit<SupplierProductRate, 'id'>) => {
    const newRate = { ...rateData, id: generateId() };
    setSupplierProductRates(prev => [...prev, newRate]);
  };

  const updateSupplierProductRate = (id: string, rateData: Partial<SupplierProductRate>) => {
    setSupplierProductRates(prev => 
      prev.map(rate => rate.id === id ? { ...rate, ...rateData } : rate)
    );
  };

  const deleteSupplierProductRate = (id: string) => {
    setSupplierProductRates(prev => prev.filter(rate => rate.id !== id));
  };

  const getSupplierProductRates = (supplierId: string) => {
    return supplierProductRates.filter(rate => rate.supplierId === supplierId);
  };

  const getProductRateForSupplier = (supplierId: string, productId: string) => {
    const rate = supplierProductRates
      .filter(r => r.supplierId === supplierId && r.productId === productId)
      .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())[0];
    
    return rate ? rate.rate : null;
  };

  const getSupplierRateHistory = (supplierId: string, productId: string) => {
    return supplierProductRates
      .filter(r => r.supplierId === supplierId && r.productId === productId)
      .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
  };

  // Supplier CRUD operations
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplierData, id: generateId() };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    let updatedSupplier: Supplier | null = null;
    
    setSuppliers(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      
      updatedSupplier = { ...prev[index], ...supplierData };
      const newSuppliers = [...prev];
      newSuppliers[index] = updatedSupplier as Supplier;
      return newSuppliers;
    });
    
    return updatedSupplier;
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
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
        payments,
        customerProductRates,
        supplierProductRates,
        suppliers,
        vehicles,
        salesmen,
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
        addPayment,
        updatePayment,
        deletePayment,
        deleteMultiplePayments,
        updateUISettings,
        addCustomerProductRate,
        updateCustomerProductRate,
        deleteCustomerProductRate,
        getCustomerProductRates,
        getProductRateForCustomer,
        addSupplierProductRate,
        updateSupplierProductRate,
        deleteSupplierProductRate,
        getSupplierProductRates,
        getProductRateForSupplier,
        getSupplierRateHistory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
