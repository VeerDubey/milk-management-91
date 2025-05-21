import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfflineStorageService } from '@/services/OfflineStorageService';
import { toast } from 'sonner';
import { 
  Customer, Product, Order, Payment, 
  CustomerProductRate, SupplierProductRate, 
  Supplier, UISettings, Vehicle, Salesman, 
  Expense, TrackSheet, Invoice, SupplierPayment,
  StockRecord, StockEntry
} from '@/types';
import { DataContextType } from './types';

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
  payments: [],
  customerProductRates: [],
  supplierProductRates: [],
  suppliers: [],
  vehicles: [],
  salesmen: [],
  expenses: [],
  stockRecords: [],
  stockEntries: [],
  supplierPayments: [],
  trackSheets: [],
  uiSettings: {
    theme: 'light',
    compactMode: false,
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    sidebarCollapsed: false,
    defaultPaymentMethod: 'cash',
    defaultReportPeriod: 'month',
    language: 'en',
    currencyFormat: '₹0,0.00',
  },
  addCustomer: () => {},
  updateCustomer: () => {},
  deleteCustomer: () => {},
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  addOrder: () => {},
  updateOrder: () => {},
  deleteOrder: () => {},
  addInvoice: () => "",
  updateInvoice: () => {},
  deleteInvoice: () => {},
  addPayment: () => undefined, // Fixed: Changed from {} to undefined to match void | Payment
  updatePayment: () => {},
  deletePayment: () => {},
  deleteMultiplePayments: () => {},
  updateUISettings: () => {},
  addCustomerProductRate: () => {},
  updateCustomerProductRate: () => {},
  deleteCustomerProductRate: () => {},
  getCustomerProductRates: () => [],
  getProductRateForCustomer: () => 0,
  addSupplierProductRate: () => {},
  updateSupplierProductRate: () => {},
  deleteSupplierProductRate: () => {},
  getSupplierProductRates: () => [],
  getProductRateForSupplier: () => null,
  getSupplierRateHistory: () => [],
  addSupplier: () => {},
  updateSupplier: () => {},
  deleteSupplier: () => {},
  addVehicle: () => {},
  updateVehicle: () => {},
  deleteVehicle: () => {},
  addSalesman: () => {},
  updateSalesman: () => {},
  deleteSalesman: () => {},
  addExpense: () => {},
  updateExpense: () => {},
  deleteExpense: () => {},
  addTrackSheet: () => {},
  updateTrackSheet: () => {},
  deleteTrackSheet: () => {},
  addSupplierPayment: () => {},
  updateSupplierPayment: () => {},
  deleteSupplierPayment: () => {},
  addStockRecord: () => {},
  updateStockRecord: () => {},
  deleteStockRecord: () => {},
  addStockEntry: () => {},
  updateStockEntry: () => {},
  deleteStockEntry: () => {},
  addStock: () => {},
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
      unit: 'liter',
      stock: 200,
      category: 'Milk',
      isActive: true,
      sku: 'FCM001',
      minStockLevel: 50
    },
    {
      id: '2',
      name: 'Toned Milk',
      description: 'Milk with 3% fat content',
      price: 45,
      unit: 'liter',
      stock: 350,
      category: 'Milk',
      isActive: true,
      sku: 'TM001',
      minStockLevel: 75
    },
    {
      id: '3',
      name: 'Double Toned Milk',
      description: 'Milk with 1.5% fat content',
      price: 40,
      unit: 'liter',
      stock: 280,
      category: 'Milk',
      isActive: true,
      sku: 'DTM001',
      minStockLevel: 60
    },
    {
      id: '4',
      name: 'Paneer',
      description: 'Fresh homemade cottage cheese',
      price: 320,
      unit: 'kg',
      stock: 50,
      category: 'Dairy Product',
      isActive: true,
      sku: 'PNR001',
      minStockLevel: 10
    },
    {
      id: '5',
      name: 'Curd',
      description: 'Natural probiotic yogurt',
      price: 80,
      unit: 'kg',
      stock: 120,
      category: 'Dairy Product',
      isActive: true,
      sku: 'CRD001',
      minStockLevel: 25
    }
  ];

  // Mock orders
  const mockOrders: Order[] = [
    {
      id: '1',
      customerId: '1',
      date: '2023-05-10T08:30:00Z',
      items: [
        { productId: '1', quantity: 5, unitPrice: 60 },
        { productId: '4', quantity: 1, unitPrice: 320 }
      ],
      total: 620,
      status: 'completed',
      paymentStatus: 'paid',
      vehicleId: 'v1',
      salesmanId: 's1'
    },
    {
      id: '2',
      customerId: '2',
      date: '2023-05-11T09:15:00Z',
      items: [
        { productId: '2', quantity: 3, unitPrice: 45 },
        { productId: '5', quantity: 2, unitPrice: 80 }
      ],
      total: 295,
      status: 'completed',
      paymentStatus: 'partial',
      vehicleId: 'v2',
      salesmanId: 's2'
    },
    {
      id: '3',
      customerId: '3',
      date: '2023-05-12T10:00:00Z',
      items: [
        { productId: '1', quantity: 2, unitPrice: 60 },
        { productId: '3', quantity: 4, unitPrice: 40 }
      ],
      total: 280,
      status: 'pending',
      paymentStatus: 'pending',
      vehicleId: 'v1',
      salesmanId: 's3'
    }
  ];

  // Mock invoices
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      customerId: '1',
      invoiceNumber: 'INV0001',
      number: 'INV0001',
      date: '2023-05-10T08:30:00Z',
      dueDate: '2023-05-24T08:30:00Z',
      items: [
        {
          productId: '1',
          description: 'Full Cream Milk',
          quantity: 5,
          unitPrice: 60,
          amount: 300
        },
        {
          productId: '4',
          description: 'Paneer',
          quantity: 1,
          unitPrice: 320,
          amount: 320
        }
      ],
      subtotal: 620,
      taxRate: 5,
      taxAmount: 31,
      total: 651,
      status: 'paid',
      notes: '',
      termsAndConditions: 'Standard terms apply',
      createdAt: '2023-05-10T08:30:00Z',
      updatedAt: '2023-05-10T08:30:00Z',
      orderId: '1',
      customerName: 'Raj Sharma'
    },
    {
      id: '2',
      customerId: '2',
      invoiceNumber: 'INV0002',
      number: 'INV0002',
      date: '2023-05-11T09:15:00Z',
      dueDate: '2023-05-25T09:15:00Z',
      items: [
        {
          productId: '2',
          description: 'Toned Milk',
          quantity: 3,
          unitPrice: 45,
          amount: 135
        },
        {
          productId: '5',
          description: 'Curd',
          quantity: 2,
          unitPrice: 80,
          amount: 160
        }
      ],
      subtotal: 295,
      taxRate: 5,
      taxAmount: 14.75,
      total: 309.75,
      status: 'draft',
      notes: '',
      termsAndConditions: 'Standard terms apply',
      createdAt: '2023-05-11T09:15:00Z',
      updatedAt: '2023-05-11T09:15:00Z',
      orderId: '2',
      customerName: 'Priya Patel'
    },
    {
      id: '3',
      customerId: '3',
      invoiceNumber: 'INV0003',
      number: 'INV0003',
      date: '2023-05-12T10:00:00Z',
      dueDate: '2023-05-26T10:00:00Z',
      items: [
        {
          productId: '1',
          description: 'Full Cream Milk',
          quantity: 2,
          unitPrice: 60,
          amount: 120
        },
        {
          productId: '3',
          description: 'Double Toned Milk',
          quantity: 4,
          unitPrice: 40,
          amount: 160
        }
      ],
      subtotal: 280,
      taxRate: 5,
      taxAmount: 14,
      total: 294,
      status: 'overdue',
      notes: '',
      termsAndConditions: 'Standard terms apply',
      createdAt: '2023-05-12T10:00:00Z',
      updatedAt: '2023-05-12T10:00:00Z',
      orderId: '3',
      customerName: 'Vikram Singh'
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
      effectiveDate: '2023-01-01',
      isActive: true
    },
    {
      id: '2',
      customerId: '1',
      productId: '2',
      rate: 43,
      effectiveDate: '2023-01-01',
      isActive: true
    },
    {
      id: '3',
      customerId: '2',
      productId: '1',
      rate: 59,
      effectiveDate: '2023-02-15',
      isActive: true
    }
  ];

  // Mock supplier product rates
  const mockSupplierProductRates: SupplierProductRate[] = [
    {
      id: '1',
      supplierId: '1',
      productId: '1',
      rate: 50,
      effectiveDate: '2023-01-01',
      isActive: true
    },
    {
      id: '2',
      supplierId: '1',
      productId: '2',
      rate: 38,
      effectiveDate: '2023-01-01',
      isActive: true
    }
  ];

  // Mock suppliers
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'ABC Dairy Farm',
      contactName: 'Rajesh Agarwal',
      phone: '9988776655',
      email: 'rajesh@abcdairy.com',
      address: 'Village Dairy Complex, Rural District',
      products: ['1', '2', '3'],
      isActive: true
    },
    {
      id: '2',
      name: 'XYZ Milk Co-op',
      contactName: 'Suresh Mehta',
      phone: '8877665544',
      email: 'suresh@xyzmilk.com',
      address: 'Cooperative Society Building, Agricultural Zone',
      products: ['4', '5'],
      isActive: true
    }
  ];

  // Mock vehicles
  const mockVehicles: Vehicle[] = [
    {
      id: 'v1',
      name: 'Delivery Van 1',
      registrationNumber: 'MH01AB1234',
      type: 'Van',
      isActive: true,
      capacity: 500,
      driverName: 'Ramesh Kumar'
    },
    {
      id: 'v2',
      name: 'Delivery Van 2',
      registrationNumber: 'MH01CD5678',
      type: 'Mini Truck',
      isActive: true,
      capacity: 1000,
      driverName: 'Suresh Patil'
    }
  ];

  // Mock salesmen
  const mockSalesmen: Salesman[] = [
    {
      id: 's1',
      name: 'Ramesh',
      phone: '7788990011',
      email: 'ramesh@example.com',
      address: '123 Staff Quarters, Mumbai',
      isActive: true,
      vehicleId: 'v1'
    },
    {
      id: 's2',
      name: 'Suresh',
      phone: '7788990022',
      email: 'suresh@example.com',
      address: '456 Staff Quarters, Mumbai',
      isActive: true,
      vehicleId: 'v2'
    },
    {
      id: 's3',
      name: 'Dinesh',
      phone: '7788990033',
      email: 'dinesh@example.com',
      address: '789 Staff Quarters, Mumbai',
      isActive: true
    }
  ];

  // Mock expenses
  const mockExpenses: Expense[] = [
    {
      id: 'e1',
      title: 'Fuel',
      category: 'Transportation',
      amount: 5000,
      date: '2023-05-01',
      recurring: false,
      description: 'Monthly fuel expenses for delivery vehicles',
      paymentMethod: 'cash'
    },
    {
      id: 'e2',
      title: 'Electricity',
      category: 'Utilities',
      amount: 12000,
      date: '2023-05-05',
      recurring: true,
      recurringFrequency: 'monthly',
      description: 'Monthly electricity bill',
      paymentMethod: 'bank'
    }
  ];

  // Mock track sheets
  const mockTrackSheets: TrackSheet[] = [
    {
      id: 't1',
      name: 'Morning Route 1',
      date: '2023-05-15',
      vehicleId: 'v1',
      salesmanId: 's1',
      vehicleName: 'Delivery Van 1',
      salesmanName: 'Ramesh',
      rows: [
        {
          name: 'Raj Sharma',
          customerId: '1',
          quantities: { '1': 5, '4': 1 },
          total: 5,
          amount: 620
        },
        {
          name: 'Priya Patel',
          customerId: '2',
          quantities: { '2': 3, '5': 2 },
          total: 5,
          amount: 295
        }
      ]
    }
  ];

  // Mock stock records
  const mockStockRecords: StockRecord[] = [
    {
      id: 'sr1',
      productId: '1',
      quantity: 200,
      date: '2023-05-01',
      type: 'in',
      notes: 'Initial stock'
    },
    {
      id: 'sr2',
      productId: '2',
      quantity: 150,
      date: '2023-05-01',
      type: 'in',
      notes: 'Initial stock'
    }
  ];

  // Mock stock entries
  const mockStockEntries: StockEntry[] = [
    {
      id: 'se1',
      supplierId: '1',
      date: '2023-05-01',
      items: [
        { productId: '1', quantity: 200, unitPrice: 50, totalPrice: 10000 },
        { productId: '2', quantity: 150, unitPrice: 38, totalPrice: 5700 }
      ],
      totalAmount: 15700,
      paymentStatus: 'paid',
      createdAt: '2023-05-01'
    }
  ];

  // Mock supplier payments
  const mockSupplierPayments: SupplierPayment[] = [
    {
      id: 'sp1',
      supplierId: '1',
      amount: 15700,
      date: '2023-05-01',
      paymentMethod: 'bank',
      referenceNumber: 'REF123456',
      notes: 'Payment for stock entry SE001'
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
    mockSalesmen,
    mockExpenses,
    mockTrackSheets,
    mockStockRecords,
    mockStockEntries,
    mockSupplierPayments
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
    mockSalesmen,
    mockExpenses,
    mockTrackSheets,
    mockStockRecords,
    mockStockEntries,
    mockSupplierPayments
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
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [trackSheets, setTrackSheets] = useState<TrackSheet[]>(mockTrackSheets);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>(mockStockRecords);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>(mockStockEntries);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(mockSupplierPayments);
  const [uiSettings, setUISettings] = useState<UISettings>({
    theme: 'light',
    compactMode: false,
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    sidebarCollapsed: false,
    defaultPaymentMethod: 'cash',
    defaultReportPeriod: 'month',
    language: 'en',
    currencyFormat: '₹0,0.00',
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

      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));

      const storedTrackSheets = localStorage.getItem('trackSheets');
      if (storedTrackSheets) setTrackSheets(JSON.parse(storedTrackSheets));

      const storedStockRecords = localStorage.getItem('stockRecords');
      if (storedStockRecords) setStockRecords(JSON.parse(storedStockRecords));

      const storedStockEntries = localStorage.getItem('stockEntries');
      if (storedStockEntries) setStockEntries(JSON.parse(storedStockEntries));

      const storedSupplierPayments = localStorage.getItem('supplierPayments');
      if (storedSupplierPayments) setSupplierPayments(JSON.parse(storedSupplierPayments));

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
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('trackSheets', JSON.stringify(trackSheets));
      localStorage.setItem('stockRecords', JSON.stringify(stockRecords));
      localStorage.setItem('stockEntries', JSON.stringify(stockEntries));
      localStorage.setItem('supplierPayments', JSON.stringify(supplierPayments));
      localStorage.setItem('uiSettings', JSON.stringify(uiSettings));
    } catch (error) {
      console.error('Error saving data to local storage:', error);
      toast.error('Failed to save data locally.');
    }
  }, [
    customers, products, orders, invoices, payments, customerProductRates, 
    supplierProductRates, suppliers, vehicles, salesmen, expenses, trackSheets,
    stockRecords, stockEntries, supplierPayments, uiSettings
  ]);

  // Customer CRUD operations
  const addCustomer = (customerData: Omit<Customer, 'id'>): void => {
    const newCustomer = { ...customerData, id: generateId() };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>): void => {
    setCustomers(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      
      const updatedCustomer = { ...prev[index], ...customerData };
      const newCustomers = [...prev];
      newCustomers[index] = updatedCustomer;
      return newCustomers;
    });
  };

  const deleteCustomer = (id: string): void => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Product CRUD operations
  const addProduct = (productData: Omit<Product, 'id'>): void => {
    const newProduct = { ...productData, id: generateId() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>): void => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      
      const updatedProduct = { ...prev[index], ...productData };
      const newProducts = [...prev];
      newProducts[index] = updatedProduct;
      return newProducts;
    });
  };

  const deleteProduct = (id: string): void => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Order CRUD operations
  const addOrder = (orderData: Omit<Order, 'id'>): void => {
    const newOrder = { ...orderData, id: generateId() };
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrder = (id: string, orderData: Partial<Order>): void => {
    setOrders(prev => {
      const index = prev.findIndex(o => o.id === id);
      if (index === -1) return prev;
      
      const updatedOrder = { ...prev[index], ...orderData };
      const newOrders = [...prev];
      newOrders[index] = updatedOrder;
      return newOrders;
    });
  };

  const deleteOrder = (id: string): void => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Invoice CRUD operations
  const addInvoice = (invoiceData: Omit<Invoice, 'id'>): string => {
    const id = generateId();
    const newInvoice = { ...invoiceData, id };
    setInvoices(prev => [...prev, newInvoice as Invoice]);
    return id;
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>): void => {
    setInvoices(prev => {
      const index = prev.findIndex(i => i.id === id);
      if (index === -1) return prev;
      
      const updatedInvoice = { ...prev[index], ...invoiceData };
      const newInvoices = [...prev];
      newInvoices[index] = updatedInvoice;
      return newInvoices;
    });
  };

  const deleteInvoice = (id: string): void => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Payment CRUD operations
  const addPayment = (paymentData: Omit<Payment, "id">): Payment => {
    const newPayment = {
      ...paymentData,
      id: `pay${Date.now()}`,
    };
    setPayments(prev => [...prev, newPayment]);
    
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

  const updatePayment = (id: string, paymentData: Partial<Payment>): void => {
    const oldPayment = payments.find(p => p.id === id);
    
    setPayments(prev =>
      prev.map((payment) =>
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

  const deletePayment = (id: string): void => {
    const payment = payments.find(p => p.id === id);
    
    if (payment) {
      const customer = customers.find(c => c.id === payment.customerId);
      if (customer && customer.outstandingBalance !== undefined) {
        updateCustomer(customer.id, {
          outstandingBalance: customer.outstandingBalance + payment.amount
        });
      }
    }
    
    setPayments(prev => prev.filter((payment) => payment.id !== id));
  };
  
  // Delete multiple payments at once
  const deleteMultiplePayments = (ids: string[]): void => {
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
    setPayments(prev => prev.filter(payment => !ids.includes(payment.id)));
    
    toast.success(`${ids.length} payments deleted successfully`);
  };

  // Customer Product Rate operations
  const addCustomerProductRate = (rateData: Omit<CustomerProductRate, 'id'>): void => {
    const newRate = { ...rateData, id: generateId() };
    setCustomerProductRates(prev => [...prev, newRate]);
  };

  const updateCustomerProductRate = (id: string, rateData: Partial<CustomerProductRate>): void => {
    setCustomerProductRates(prev => 
      prev.map(rate => rate.id === id ? { ...rate, ...rateData } : rate)
    );
  };

  const deleteCustomerProductRate = (id: string): void => {
    setCustomerProductRates(prev => prev.filter(rate => rate.id !== id));
  };

  const getCustomerProductRates = (customerId: string): CustomerProductRate[] => {
    return customerProductRates.filter(rate => rate.customerId === customerId);
  };

  const getProductRateForCustomer = (customerId: string, productId: string): number => {
    const rate = customerProductRates
      .filter(r => r.customerId === customerId && r.productId === productId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
    
    return rate ? rate.rate : 0;
  };

  // Supplier Product Rate operations
  const addSupplierProductRate = (rateData: Omit<SupplierProductRate, 'id'>): void => {
    const newRate = { ...rateData, id: generateId() };
    setSupplierProductRates(prev => [...prev, newRate]);
  };

  const updateSupplierProductRate = (id: string, rateData: Partial<SupplierProductRate>): void => {
    setSupplierProductRates(prev => 
      prev.map(rate => rate.id === id ? { ...rate, ...rateData } : rate)
    );
  };

  const deleteSupplierProductRate = (id: string): void => {
    setSupplierProductRates(prev => prev.filter(rate => rate.id !== id));
  };

  const getSupplierProductRates = (supplierId: string): SupplierProductRate[] => {
    return supplierProductRates.filter(rate => rate.supplierId === supplierId);
  };

  const getProductRateForSupplier = (supplierId: string, productId: string): number | null => {
    const rate = supplierProductRates
      .filter(r => r.supplierId === supplierId && r.productId === productId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
    
    return rate ? rate.rate : null;
  };

  const getSupplierRateHistory = (supplierId: string, productId: string): SupplierProductRate[] => {
    return supplierProductRates
      .filter(r => r.supplierId === supplierId && r.productId === productId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
  };

  // Supplier CRUD operations
  const addSupplier = (supplierData: Omit<Supplier, 'id'>): void => {
    const newSupplier = { ...supplierData, id: generateId() };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, supplierData: Partial<Supplier>): void => {
    setSuppliers(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      
      const updatedSupplier = { ...prev[index], ...supplierData };
      const newSuppliers = [...prev];
      newSuppliers[index] = updatedSupplier;
      return newSuppliers;
    });
  };

  const deleteSupplier = (id: string): void => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Vehicle CRUD operations
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>): void => {
    const newVehicle = { ...vehicleData, id: generateId() };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>): void => {
    setVehicles(prev => {
      const index = prev.findIndex(v => v.id === id);
      if (index === -1) return prev;
      
      const updatedVehicle = { ...prev[index], ...vehicleData };
      const newVehicles = [...prev];
      newVehicles[index] = updatedVehicle;
      return newVehicles;
    });
  };

  const deleteVehicle = (id: string): void => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Salesman CRUD operations
  const addSalesman = (salesmanData: Omit<Salesman, 'id'>): void => {
    const newSalesman = { ...salesmanData, id: generateId() };
    setSalesmen(prev => [...prev, newSalesman]);
  };

  const updateSalesman = (id: string, salesmanData: Partial<Salesman>): void => {
    setSalesmen(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      
      const updatedSalesman = { ...prev[index], ...salesmanData };
      const newSalesmen = [...prev];
      newSalesmen[index] = updatedSalesman;
      return newSalesmen;
    });
  };

  const deleteSalesman = (id: string): void => {
    setSalesmen(prev => prev.filter(s => s.id !== id));
  };
  
  // Expense CRUD operations
  const addExpense = (expenseData: Omit<Expense, 'id'>): void => {
    const newExpense = { ...expenseData, id: generateId() };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>): void => {
    setExpenses(prev => {
      const index = prev.findIndex(e => e.id === id);
      if (index === -1) return prev;
      
      const updatedExpense = { ...prev[index], ...expenseData };
      const newExpenses = [...prev];
      newExpenses[index] = updatedExpense;
      return newExpenses;
    });
  };

  const deleteExpense = (id: string): void => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Track Sheet operations
  const addTrackSheet = (trackSheetData: Omit<TrackSheet, 'id'>): void => {
    const newTrackSheet = { ...trackSheetData, id: generateId() };
    setTrackSheets(prev => [...prev, newTrackSheet]);
  };

  const updateTrackSheet = (id: string, trackSheetData: Partial<TrackSheet>): void => {
    setTrackSheets(prev => {
      const index = prev.findIndex(ts => ts.id === id);
      if (index === -1) return prev;
      
      const updatedTrackSheet = { ...prev[index], ...trackSheetData };
      const newTrackSheets = [...prev];
      newTrackSheets[index] = updatedTrackSheet;
      return newTrackSheets;
    });
  };

  const deleteTrackSheet = (id: string): void => {
    setTrackSheets(prev => prev.filter(ts => ts.id !== id));
  };

  // Stock Record operations
  const addStockRecord = (recordData: Omit<StockRecord, 'id'>): void => {
    const newRecord = { ...recordData, id: generateId() };
    setStockRecords(prev => [...prev, newRecord]);
    
    // Update product stock if applicable
    const product = products.find(p => p.id === recordData.productId);
    if (product) {
      const currentStock = product.stock || 0;
      let newStock = currentStock;
      
      if (recordData.type === 'in') {
        newStock = currentStock + recordData.quantity;
      } else if (recordData.type === 'out') {
        newStock = currentStock - recordData.quantity;
      } else if (recordData.type === 'adjustment') {
        newStock = recordData.quantity; // Direct adjustment
      }
      
      updateProduct(product.id, { stock: newStock });
    }
  };

  const updateStockRecord = (id: string, recordData: Partial<StockRecord>): void => {
    const oldRecord = stockRecords.find(r => r.id === id);
    
    if (oldRecord && recordData.quantity !== undefined && recordData.type !== undefined) {
      // Reverse old stock change
      const product = products.find(p => p.id === oldRecord.productId);
      if (product) {
        const currentStock = product.stock || 0;
        let stockAfterReversal = currentStock;
        
        if (oldRecord.type === 'in') {
          stockAfterReversal = currentStock - oldRecord.quantity;
        } else if (oldRecord.type === 'out') {
          stockAfterReversal = currentStock + oldRecord.quantity;
        }
        
        // Apply new stock change
        let newStock = stockAfterReversal;
        if (recordData.type === 'in') {
          newStock = stockAfterReversal + recordData.quantity;
        } else if (recordData.type === 'out') {
          newStock = stockAfterReversal - recordData.quantity;
        } else if (recordData.type === 'adjustment') {
          newStock = recordData.quantity;
        }
        
        updateProduct(product.id, { stock: newStock });
      }
    }
    
    setStockRecords(prev => 
      prev.map(record => record.id === id ? { ...record, ...recordData } : record)
    );
  };

  const deleteStockRecord = (id: string): void => {
    const record = stockRecords.find(r => r.id === id);
    
    if (record) {
      // Reverse stock change when deleting record
      const product = products.find(p => p.id === record.productId);
      if (product) {
        const currentStock = product.stock || 0;
        let newStock = currentStock;
        
        if (record.type === 'in') {
          newStock = currentStock - record.quantity;
        } else if (record.type === 'out') {
          newStock = currentStock + record.quantity;
        }
        
        updateProduct(product.id, { stock: newStock });
      }
    }
    
    setStockRecords(prev => prev.filter(r => r.id !== id));
  };
  
  // Stock Entry operations
  const addStockEntry = (entry: StockEntry): void => {
    setStockEntries(prev => [...prev, entry]);
    
    // Add stock records for each item in the entry
    entry.items.forEach(item => {
      addStockRecord({
        productId: item.productId,
        quantity: item.quantity,
        date: entry.date,
        type: 'in',
        relatedEntryId: entry.id,
        notes: `Stock entry from supplier ${entry.supplierId}`
      });
    });
  };
  
  const updateStockEntry = (id: string, entryData: Partial<StockEntry>): void => {
    // This would be more complex with stock adjustments - simplified version
    setStockEntries(prev => 
      prev.map(entry => entry.id === id ? { ...entry, ...entryData } : entry)
    );
  };
  
  const deleteStockEntry = (id: string): void => {
    // Delete related stock records first
    const relatedRecords = stockRecords.filter(r => r.relatedEntryId === id);
    relatedRecords.forEach(record => {
      deleteStockRecord(record.id);
    });
    
    setStockEntries(prev => prev.filter(e => e.id !== id));
  };

  // Add stock helper method
  const addStock = (supplierId: string, productId: string, quantity: number, pricePerUnit: number, date: string): void => {
    const totalPrice = quantity * pricePerUnit;
    
    // Create a stock entry
    const entryId = generateId();
    const newEntry: StockEntry = {
      id: entryId,
      supplierId,
      date,
      items: [{ productId, quantity, unitPrice: pricePerUnit, totalPrice }],
      totalAmount: totalPrice,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    };
    
    addStockEntry(newEntry);
  };

  // Supplier Payment operations
  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id'>): void => {
    const newPayment = { ...payment, id: generateId() };
    setSupplierPayments(prev => [...prev, newPayment]);
    
    // Update supplier outstanding balance if needed
    // This would require tracking supplier outstanding balances
  };
  
  const updateSupplierPayment = (id: string, paymentData: Partial<SupplierPayment>): void => {
    setSupplierPayments(prev => 
      prev.map(payment => payment.id === id ? { ...payment, ...paymentData } : payment)
    );
  };
  
  const deleteSupplierPayment = (id: string): void => {
    setSupplierPayments(prev => prev.filter(payment => payment.id !== id));
  };

  // UI Settings
  const updateUISettings = (settings: Partial<UISettings>): void => {
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
        expenses,
        trackSheets,
        stockRecords,
        stockEntries,
        supplierPayments,
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
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addSalesman,
        updateSalesman,
        deleteSalesman,
        addExpense,
        updateExpense,
        deleteExpense,
        addTrackSheet,
        updateTrackSheet,
        deleteTrackSheet,
        addStockRecord,
        updateStockRecord,
        deleteStockRecord,
        addStockEntry,
        updateStockEntry,
        deleteStockEntry,
        addStock,
        addSupplierPayment,
        updateSupplierPayment,
        deleteSupplierPayment
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
