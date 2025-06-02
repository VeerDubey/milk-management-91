
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Product, Order, Payment, Supplier, Vehicle, Salesman } from '@/types';
import { initialCustomers } from '@/data/customerData';
import { useOtherStates } from './useOtherStates';
import { useSupplierState } from './useSupplierState';
import { useStockState } from './useStockState';
import { useProductRateState } from './useProductRateState';
import { useTrackSheetState } from './useTrackSheetState';

export interface DataContextType {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  suppliers: Supplier[];
  vehicles: Vehicle[];
  salesmen: Salesman[];
  
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addBatchOrders: (orders: Omit<Order, 'id'>[]) => void;
  
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  deleteMultiplePayments: (ids: string[]) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  addSalesman: (salesman: Omit<Salesman, 'id'>) => void;
  updateSalesman: (id: string, salesman: Partial<Salesman>) => void;
  deleteSalesman: (id: string) => void;

  // Customer product rates
  customerProductRates: any[];
  addCustomerProductRate: (rate: any) => any;
  updateCustomerProductRate: (id: string, rateData: any) => void;
  deleteCustomerProductRate: (id: string) => void;
  getProductRateForCustomer: (customerId: string, productId: string) => number;

  // Supplier product rates
  supplierProductRates: any[];
  addSupplierProductRate: (rate: any) => any;
  updateSupplierProductRate: (id: string, rateData: any) => void;
  deleteSupplierProductRate: (id: string) => void;

  // Stock management
  stockEntries: any[];
  stockTransactions: any[];
  addStockEntry: (entry: any) => any;
  updateStockEntry: (id: string, entryData: any) => void;
  deleteStockEntry: (id: string) => void;
  addStockTransaction: (transaction: any) => any;
  updateStockTransaction: (id: string, transactionData: any) => void;
  deleteStockTransaction: (id: string) => void;

  // Supplier payments
  supplierPayments: any[];
  addSupplierPayment: (payment: any) => any;
  updateSupplierPayment: (id: string, paymentData: any) => void;
  deleteSupplierPayment: (id: string) => void;

  // Invoices
  invoices: any[];
  addInvoice: (invoice: any) => string;
  updateInvoice: (id: string, invoiceData: any) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => any;
  generateInvoiceFromOrder: (orderId: string) => string;

  // Track sheets
  trackSheets: any[];
  addTrackSheet: (trackSheet: any) => any;
  updateTrackSheet: (id: string, trackSheetData: any) => void;
  deleteTrackSheet: (id: string) => void;
  createTrackSheetFromOrder: (orderId: string) => any;

  // Expenses
  expenses: any[];
  addExpense: (expense: any) => any;
  updateExpense: (id: string, expenseData: any) => void;
  deleteExpense: (id: string) => void;

  // UI Settings
  uiSettings: any;
  updateUISettings: (settings: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with predefined customer data
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved customers:', error);
      }
    }
    return initialCustomers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    try {
      return saved ? JSON.parse(saved) : [
        { id: 'prod-1', name: 'GGH', code: 'GGH', price: 60, unit: 'bottle', category: 'Milk' },
        { id: 'prod-2', name: 'GGH450', code: 'GGH450', price: 30, unit: 'bottle', category: 'Milk' },
        { id: 'prod-3', name: 'GTSF', code: 'GTSF', price: 55, unit: 'bottle', category: 'Milk' },
        { id: 'prod-4', name: 'GSD1KG', code: 'GSD1KG', price: 80, unit: 'packet', category: 'Curd' },
        { id: 'prod-5', name: 'GPC', code: 'GPC', price: 25, unit: 'packet', category: 'Paneer' },
        { id: 'prod-6', name: 'F&L', code: 'FL', price: 35, unit: 'bottle', category: 'Lassi' }
      ];
    } catch (error) {
      console.error('Error parsing saved products:', error);
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing saved orders:', error);
      return [];
    }
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('payments');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing saved payments:', error);
      return [];
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('suppliers');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing saved suppliers:', error);
      return [];
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('vehicles');
    try {
      return saved ? JSON.parse(saved) : [
        { id: 'vehicle-1', name: 'EICHER', number: 'MH01AB1234', type: 'truck', capacity: 1000 },
        { id: 'vehicle-2', name: 'TATA ACE', number: 'MH01CD5678', type: 'mini-truck', capacity: 500 }
      ];
    } catch (error) {
      console.error('Error parsing saved vehicles:', error);
      return [];
    }
  });

  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    const saved = localStorage.getItem('salesmen');
    try {
      return saved ? JSON.parse(saved) : [
        { id: 'sales-1', name: 'Raj Kumar', phone: '9876543210', area: 'SEWRI', vehicleId: 'vehicle-1' },
        { id: 'sales-2', name: 'Sunil Sharma', phone: '9876543211', area: 'LALBAUGH', vehicleId: 'vehicle-2' }
      ];
    } catch (error) {
      console.error('Error parsing saved salesmen:', error);
      return [];
    }
  });

  const [expenses, setExpenses] = useState<any[]>(() => {
    const saved = localStorage.getItem('expenses');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing saved expenses:', error);
      return [];
    }
  });

  // Use the separate state hooks
  const otherStates = useOtherStates();
  const supplierState = useSupplierState();
  const stockState = useStockState(updateSupplier);
  const productRateState = useProductRateState(products);
  const trackSheetState = useTrackSheetState();

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('salesmen', JSON.stringify(salesmen));
  }, [salesmen]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Customer operations
  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const customer = { ...customerData, id: `customer-${Date.now()}` };
    setCustomers(prev => [...prev, customer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...customerData } : customer
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // Product operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const product = { ...productData, id: `product-${Date.now()}` };
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...productData } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Order operations
  const addOrder = (orderData: Omit<Order, 'id'>) => {
    const order = { ...orderData, id: `order-${Date.now()}` };
    setOrders(prev => [...prev, order]);
  };

  const updateOrder = (id: string, orderData: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, ...orderData } : order
    ));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const addBatchOrders = (ordersData: Omit<Order, 'id'>[]) => {
    const newOrders = ordersData.map(orderData => ({
      ...orderData,
      id: `order-${Date.now()}-${Math.random()}`
    }));
    setOrders(prev => [...prev, ...newOrders]);
  };

  // Payment operations
  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const payment = { ...paymentData, id: `payment-${Date.now()}` };
    setPayments(prev => [...prev, payment]);
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    setPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...paymentData } : payment
    ));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(payment => payment.id !== id));
  };

  const deleteMultiplePayments = (ids: string[]) => {
    setPayments(prev => prev.filter(payment => !ids.includes(payment.id)));
  };

  // Supplier operations
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const supplier = { ...supplierData, id: `supplier-${Date.now()}` };
    setSuppliers(prev => [...prev, supplier]);
  };

  function updateSupplier(id: string, supplierData: Partial<Supplier>) {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === id ? { ...supplier, ...supplierData } : supplier
    ));
  }

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  // Vehicle operations
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const vehicle = { ...vehicleData, id: `vehicle-${Date.now()}` };
    setVehicles(prev => [...prev, vehicle]);
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
    ));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
  };

  // Salesman operations
  const addSalesman = (salesmanData: Omit<Salesman, 'id'>) => {
    const salesman = { ...salesmanData, id: `salesman-${Date.now()}` };
    setSalesmen(prev => [...prev, salesman]);
  };

  const updateSalesman = (id: string, salesmanData: Partial<Salesman>) => {
    setSalesmen(prev => prev.map(salesman => 
      salesman.id === id ? { ...salesman, ...salesmanData } : salesman
    ));
  };

  const deleteSalesman = (id: string) => {
    setSalesmen(prev => prev.filter(salesman => salesman.id !== id));
  };

  // Expense operations
  const addExpense = (expenseData: any) => {
    const expense = { ...expenseData, id: `expense-${Date.now()}` };
    setExpenses(prev => [...prev, expense]);
    return expense;
  };

  const updateExpense = (id: string, expenseData: any) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...expenseData } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const value: DataContextType = {
    customers,
    products,
    orders,
    payments,
    suppliers,
    vehicles,
    salesmen,
    expenses,
    
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    addProduct,
    updateProduct,
    deleteProduct,
    
    addOrder,
    updateOrder,
    deleteOrder,
    addBatchOrders,
    
    addPayment,
    updatePayment,
    deletePayment,
    deleteMultiplePayments,
    
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

    // Spread all the functionality from the hooks
    ...otherStates,
    ...supplierState,
    ...stockState,
    ...productRateState,
    ...trackSheetState
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
