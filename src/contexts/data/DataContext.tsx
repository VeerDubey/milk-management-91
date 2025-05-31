import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Customer, Product, Order, Payment, Vehicle, Salesman, 
  TrackSheet, Invoice, StockEntry, Supplier, SupplierPayment,
  CustomerProductRate, SupplierProductRate, Expense 
} from '@/types';

export interface DataContextType {
  // Customer data
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Product data
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Order data
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // Payment data
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Vehicle data
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Salesman data
  salesmen: Salesman[];
  addSalesman: (salesman: Omit<Salesman, 'id'>) => void;
  updateSalesman: (id: string, salesman: Partial<Salesman>) => void;
  deleteSalesman: (id: string) => void;

  // Track Sheet data
  trackSheets: TrackSheet[];
  addTrackSheet: (trackSheet: Omit<TrackSheet, 'id'>) => void;
  updateTrackSheet: (id: string, trackSheet: Partial<TrackSheet>) => void;
  deleteTrackSheet: (id: string) => void;

  // Invoice data
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Stock Entry data
  stockEntries: StockEntry[];
  addStockEntry: (stockEntry: Omit<StockEntry, 'id'>) => void;
  updateStockEntry: (id: string, stockEntry: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;

  // Supplier data
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Supplier Payment data
  supplierPayments: SupplierPayment[];
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id'>) => void;
  updateSupplierPayment: (id: string, payment: Partial<SupplierPayment>) => void;
  deleteSupplierPayment: (id: string) => void;

  // Rate data
  customerProductRates: CustomerProductRate[];
  addCustomerProductRate: (rate: Omit<CustomerProductRate, 'id'>) => void;
  updateCustomerProductRate: (id: string, rate: Partial<CustomerProductRate>) => void;
  deleteCustomerProductRate: (id: string) => void;

  supplierProductRates: SupplierProductRate[];
  addSupplierProductRate: (rate: Omit<SupplierProductRate, 'id'>) => void;
  updateSupplierProductRate: (id: string, rate: Partial<SupplierProductRate>) => void;
  deleteSupplierProductRate: (id: string) => void;

  // Expense data
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [trackSheets, setTrackSheets] = useState<TrackSheet[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [customerProductRates, setCustomerProductRates] = useState<CustomerProductRate[]>([]);
  const [supplierProductRates, setSupplierProductRates] = useState<SupplierProductRate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Customer CRUD operations
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: `customer_${Date.now()}` };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Product CRUD operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: `product_${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Order CRUD operations
  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder = { ...order, id: `order_${Date.now()}` };
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...order } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Payment CRUD operations
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: `payment_${Date.now()}` };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (id: string, payment: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...payment } : p));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  // Vehicle CRUD operations
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: `vehicle_${Date.now()}` };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, vehicle: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicle } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Salesman CRUD operations
  const addSalesman = (salesman: Omit<Salesman, 'id'>) => {
    const newSalesman = { ...salesman, id: `salesman_${Date.now()}` };
    setSalesmen(prev => [...prev, newSalesman]);
  };

  const updateSalesman = (id: string, salesman: Partial<Salesman>) => {
    setSalesmen(prev => prev.map(s => s.id === id ? { ...s, ...salesman } : s));
  };

  const deleteSalesman = (id: string) => {
    setSalesmen(prev => prev.filter(s => s.id !== id));
  };

  // Track Sheet CRUD operations
  const addTrackSheet = (trackSheet: Omit<TrackSheet, 'id'>) => {
    const newTrackSheet = { ...trackSheet, id: `tracksheet_${Date.now()}` };
    setTrackSheets(prev => [...prev, newTrackSheet]);
  };

  const updateTrackSheet = (id: string, trackSheet: Partial<TrackSheet>) => {
    setTrackSheets(prev => prev.map(t => t.id === id ? { ...t, ...trackSheet } : t));
  };

  const deleteTrackSheet = (id: string) => {
    setTrackSheets(prev => prev.filter(t => t.id !== id));
  };

  // Invoice CRUD operations
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: `invoice_${Date.now()}` };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...invoice } : i));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Stock Entry CRUD operations
  const addStockEntry = (stockEntry: Omit<StockEntry, 'id'>) => {
    const newStockEntry = { ...stockEntry, id: `stockentry_${Date.now()}` };
    setStockEntries(prev => [...prev, newStockEntry]);
  };

  const updateStockEntry = (id: string, stockEntry: Partial<StockEntry>) => {
    setStockEntries(prev => prev.map(s => s.id === id ? { ...s, ...stockEntry } : s));
  };

  const deleteStockEntry = (id: string) => {
    setStockEntries(prev => prev.filter(s => s.id !== id));
  };

  // Supplier CRUD operations
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: `supplier_${Date.now()}` };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Supplier Payment CRUD operations
  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id'>) => {
    const newPayment = { ...payment, id: `supplierpayment_${Date.now()}` };
    setSupplierPayments(prev => [...prev, newPayment]);
  };

  const updateSupplierPayment = (id: string, payment: Partial<SupplierPayment>) => {
    setSupplierPayments(prev => prev.map(p => p.id === id ? { ...p, ...payment } : p));
  };

  const deleteSupplierPayment = (id: string) => {
    setSupplierPayments(prev => prev.filter(p => p.id !== id));
  };

  // Customer Product Rate CRUD operations
  const addCustomerProductRate = (rate: Omit<CustomerProductRate, 'id'>) => {
    const newRate = { ...rate, id: `customerrate_${Date.now()}` };
    setCustomerProductRates(prev => [...prev, newRate]);
  };

  const updateCustomerProductRate = (id: string, rate: Partial<CustomerProductRate>) => {
    setCustomerProductRates(prev => prev.map(r => r.id === id ? { ...r, ...rate } : r));
  };

  const deleteCustomerProductRate = (id: string) => {
    setCustomerProductRates(prev => prev.filter(r => r.id !== id));
  };

  // Supplier Product Rate CRUD operations
  const addSupplierProductRate = (rate: Omit<SupplierProductRate, 'id'>) => {
    const newRate = { ...rate, id: `supplierrate_${Date.now()}` };
    setSupplierProductRates(prev => [...prev, newRate]);
  };

  const updateSupplierProductRate = (id: string, rate: Partial<SupplierProductRate>) => {
    setSupplierProductRates(prev => prev.map(r => r.id === id ? { ...r, ...rate } : r));
  };

  const deleteSupplierProductRate = (id: string) => {
    setSupplierProductRates(prev => prev.filter(r => r.id !== id));
  };

  // Expense CRUD operations
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: `expense_${Date.now()}` };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const value: DataContextType = {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    salesmen,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    trackSheets,
    addTrackSheet,
    updateTrackSheet,
    deleteTrackSheet,
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    stockEntries,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    supplierPayments,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment,
    customerProductRates,
    addCustomerProductRate,
    updateCustomerProductRate,
    deleteCustomerProductRate,
    supplierProductRates,
    addSupplierProductRate,
    updateSupplierProductRate,
    deleteSupplierProductRate,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export type { DataContextType };
