
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Product, Order, Vehicle, Salesman } from '@/types';
import { useCustomerState } from './useCustomerState';
import { useProductState } from './useProductState';
import { useOrderState } from './useOrderState';
import { useVehicleState } from './useVehicleState';
import { useSalesmanState } from './useSalesmanState';
import { usePaymentState } from './usePaymentState';
import { useSupplierState } from './useSupplierState';
import { useOtherStates } from './useOtherStates';
import { useExpenseState } from './useExpenseState';
import { useInitialData } from './useInitialData';

export interface DataContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  salesmen: Salesman[];
  products: Product[];
  orders: Order[];
  payments: any[];
  suppliers: any[];
  supplierPayments: any[];
  stockEntries: any[];
  customerProductRates: any[];
  invoices: any[];
  trackSheets: any[];
  uiSettings: any;
  expenses: any[];
  stockTransactions: any[];
  supplierProductRates: any[];
  
  addProduct: (product: Omit<Product, "id">) => Product;
  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  addOrder: (order: Omit<Order, "id">) => Order;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Vehicle;
  addSalesman: (salesman: Omit<Salesman, "id">) => Salesman;
  addPayment: (payment: any) => any;
  addSupplier: (supplier: any) => any;
  addStockEntry: (entry: any) => any;
  addSupplierPayment: (payment: any) => any;
  addCustomerProductRate: (rate: any) => any;
  addInvoice: (invoice: any) => string;
  addTrackSheet: (trackSheet: any) => any;
  addExpense: (expense: any) => any;
  addSupplierProductRate: (rate: any) => any;
  addBatchOrders: (orders: Omit<Order, "id">[]) => void;
  
  updateProduct: (id: string, productData: Partial<Product>) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => void;
  updateSalesman: (id: string, salesmanData: Partial<Salesman>) => void;
  updatePayment: (id: string, paymentData: any) => void;
  updateSupplier: (id: string, supplierData: any) => void;
  updateStockEntry: (id: string, entryData: any) => void;
  updateSupplierPayment: (id: string, paymentData: any) => void;
  updateCustomerProductRate: (id: string, rateData: any) => void;
  updateInvoice: (id: string, invoiceData: any) => void;
  updateTrackSheet: (id: string, trackSheetData: any) => void;
  updateUISettings: (settings: any) => void;
  updateExpense: (id: string, expenseData: any) => void;
  updateSupplierProductRate: (id: string, rateData: any) => void;
  
  deleteProduct: (id: string) => void;
  deleteCustomer: (id: string) => void;
  deleteOrder: (id: string) => void;
  deleteVehicle: (id: string) => void;
  deleteSalesman: (id: string) => void;
  deletePayment: (id: string) => void;
  deleteSupplier: (id: string) => void;
  deleteStockEntry: (id: string) => void;
  deleteSupplierPayment: (id: string) => void;
  deleteInvoice: (id: string) => void;
  deleteTrackSheet: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteMultiplePayments: (ids: string[]) => void;
  deleteSupplierProductRate: (id: string) => void;
  
  getInvoiceById: (id: string) => any;
  generateInvoiceFromOrder: (orderId: string) => string;
  createTrackSheetFromOrder: (orderId: string) => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomerState();
  const { products, addProduct, updateProduct, deleteProduct } = useProductState();
  const { orders, addOrder, updateOrder, deleteOrder } = useOrderState();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicleState();
  const { salesmen, addSalesman, updateSalesman, deleteSalesman } = useSalesmanState();
  const { payments, addPayment, updatePayment, deletePayment } = usePaymentState();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenseState();
  
  const {
    suppliers, supplierPayments, stockEntries,
    addSupplier, updateSupplier, deleteSupplier,
    addStockEntry, updateStockEntry, deleteStockEntry,
    addSupplierPayment, updateSupplierPayment, deleteSupplierPayment
  } = useSupplierState();
  
  const {
    customerProductRates, invoices, trackSheets, uiSettings,
    addCustomerProductRate, updateCustomerProductRate,
    addInvoice, updateInvoice, deleteInvoice, getInvoiceById, generateInvoiceFromOrder,
    addTrackSheet, updateTrackSheet, deleteTrackSheet,
    updateUISettings
  } = useOtherStates();
  
  const {
    hasLoadedInitialData,
    loadInitialProducts,
    loadInitialCustomers,
    markInitialDataAsLoaded
  } = useInitialData();

  // Load initial data on first app load
  useEffect(() => {
    if (!hasLoadedInitialData) {
      loadInitialProducts(products, addProduct);
      loadInitialCustomers(customers, addCustomer);
      markInitialDataAsLoaded();
    }
  }, [hasLoadedInitialData, products, customers, addProduct, addCustomer]);

  // Additional methods
  const addBatchOrders = (orders: Omit<Order, "id">[]) => {
    orders.forEach(order => addOrder(order));
  };

  const deleteMultiplePayments = (ids: string[]) => {
    ids.forEach(id => deletePayment(id));
  };

  const createTrackSheetFromOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    
    const trackSheet = {
      orderId,
      date: order.date,
      customerId: order.customerId,
      items: order.items || [],
      createdAt: new Date().toISOString()
    };
    
    return addTrackSheet(trackSheet);
  };

  // Mock data for missing properties
  const stockTransactions: any[] = [];
  const supplierProductRates: any[] = [];
  
  const addSupplierProductRate = (rate: any) => {
    // Mock implementation
    return rate;
  };
  
  const updateSupplierProductRate = (id: string, rateData: any) => {
    // Mock implementation
  };
  
  const deleteSupplierProductRate = (id: string) => {
    // Mock implementation
  };

  const value: DataContextType = {
    customers, products, orders, vehicles, salesmen, payments,
    suppliers, supplierPayments, stockEntries, customerProductRates,
    invoices, trackSheets, uiSettings, expenses, stockTransactions,
    supplierProductRates,
    
    addProduct, addCustomer, addOrder, addVehicle, addSalesman, addPayment,
    addSupplier, addStockEntry, addSupplierPayment, addCustomerProductRate,
    addInvoice, addTrackSheet, addExpense, addSupplierProductRate, addBatchOrders,
    
    updateProduct, updateCustomer, updateOrder, updateVehicle, updateSalesman,
    updatePayment, updateSupplier, updateStockEntry, updateSupplierPayment,
    updateCustomerProductRate, updateInvoice, updateTrackSheet, updateUISettings,
    updateExpense, updateSupplierProductRate,
    
    deleteProduct, deleteCustomer, deleteOrder, deleteVehicle, deleteSalesman,
    deletePayment, deleteSupplier, deleteStockEntry, deleteSupplierPayment,
    deleteInvoice, deleteTrackSheet, deleteExpense, deleteMultiplePayments,
    deleteSupplierProductRate,
    
    getInvoiceById, generateInvoiceFromOrder, createTrackSheetFromOrder,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
