import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomerState } from './useCustomerState';
import { useProductState } from './useProductState';
import { useOrderState } from './useOrderState';
import { usePaymentState } from './usePaymentState';
import { useProductRateState } from './useProductRateState';
import { useStockState } from './useStockState';
import { useSupplierState } from './useSupplierState';
import { useUISettingsState } from './useUISettingsState';
import { useVehicleSalesmanState } from './useVehicleSalesmanState';
import { useExpenseState } from './useExpenseState';
import { useTrackSheetState } from './useTrackSheetState';
import { useInvoices } from '@/contexts/InvoiceContext';
import { DataContextType } from './types';
import { toast } from 'sonner';
import InvoiceService from '@/services/InvoiceService';
import { VehicleTrip } from '@/types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize all the state hooks
  const customerState = useCustomerState();
  const productState = useProductState();
  const orderState = useOrderState();
  const paymentState = usePaymentState(customerState.customers, customerState.updateCustomer);
  const productRateState = useProductRateState(productState.products);
  const supplierState = useSupplierState();
  const stockState = useStockState(supplierState.updateSupplier);
  const uiSettingsState = useUISettingsState();
  const vehicleSalesmanState = useVehicleSalesmanState();
  const expenseState = useExpenseState();
  const trackSheetState = useTrackSheetState();
  
  // Use the actual invoice context data
  const invoiceState = useInvoices();

  // Helper functions
  // Helper function to get product rate for a customer
  const getProductRateForCustomer = (customerId: string, productId: string): number | null => {
    const rate = productRateState.customerProductRates.find(
      (rate) => rate.customerId === customerId && rate.productId === productId && rate.isActive
    );
    return rate ? rate.rate : null;
  };

  // Helper function to delete multiple payments
  const deleteMultiplePayments = (ids: string[]): void => {
    if (paymentState.deleteMultiplePayments) {
      paymentState.deleteMultiplePayments(ids);
    } else if (ids && ids.length > 0) {
      ids.forEach(id => paymentState.deletePayment(id));
    }
  };

  // Helper function to generate invoice from order
  const generateInvoiceFromOrder = (orderId: string): string | null => {
    try {
      const order = orderState.orders.find(o => o.id === orderId);
      if (!order) {
        toast.error("Order not found");
        return null;
      }

      const customer = customerState.customers.find(c => c.id === order.customerId);
      if (!customer) {
        toast.error("Customer not found for this order");
        return null;
      }

      // Map order items with product names
      const items = order.items.map(item => {
        const product = productState.products.find(p => p.id === item.productId);
        return {
          ...item,
          productName: product?.name || "Unknown Product",
          unit: product?.unit || "unit"
        };
      });

      // Create invoice using the service
      const invoiceData = {
        id: `INV-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        date: new Date().toISOString(),
        items: items,
        orderId: order.id,
        total: order.total || items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      };

      // Fixed: Convert the returned invoice (or its id) to string
      const result = invoiceState.addInvoice(InvoiceService.createInvoice(invoiceData));
      const invoiceId = typeof result === 'string' ? result : result.id;
      
      toast.success("Invoice created from order successfully");
      
      return invoiceId;
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
      return null;
    }
  };

  // Helper function to create track sheet from order
  // Fixed: Update the function to match the expected signature in type definition
  const createTrackSheetFromOrder = (orderId: string) => {
    try {
      const order = orderState.orders.find(o => o.id === orderId);
      if (!order) {
        toast.error("Order not found");
        return null;
      }

      // Pass the entire order object as a single argument to match the updated function signature
      return trackSheetState.createTrackSheetFromOrder(order);
    } catch (error) {
      console.error("Error creating track sheet from order:", error);
      toast.error("Failed to create track sheet from order");
      return null;
    }
  };

  // Wrapper function for addVehicleTrip to match the expected signature
  const addVehicleTrip = (trip: Omit<VehicleTrip, "id">): VehicleTrip => {
    // Fixed: Use the correct signature based on useVehicleSalesmanState implementation
    const result = vehicleSalesmanState.addVehicleTrip(trip);
    
    if (!result) {
      throw new Error("Failed to add vehicle trip");
    }
    
    return result;
  };
  
  // Wrapper for expense stats by category
  const getExpenseStatsByCategory = (startDate?: string, endDate?: string): { category: string; total: number }[] => {
    // Get the raw stats (assuming this returns Record<string, number>)
    const rawStats = expenseState.getExpenseStatsByCategory 
      ? expenseState.getExpenseStatsByCategory(startDate, endDate)
      : {};
      
    if (Array.isArray(rawStats)) {
      // If it's already in the right format, return it
      return rawStats;
    }
    
    // Otherwise, convert the Record<string, number> to array format
    return Object.entries(rawStats).map(([category, total]) => ({ 
      category, 
      total 
    }));
  };

  // Combine all state objects into one context value
  const contextValue: DataContextType = {
    ...customerState,
    ...productState,
    ...orderState,
    ...paymentState,
    ...stockState,
    ...supplierState,
    ...uiSettingsState,
    ...trackSheetState,
    
    // Add product rate state
    customerProductRates: productRateState.customerProductRates,
    addProductRate: productRateState.addCustomerProductRate,
    updateProductRate: productRateState.updateCustomerProductRate,
    deleteProductRate: productRateState.deleteCustomerProductRate,
    getProductRateForCustomer,
    // Add customer product rate methods explicitly
    addCustomerProductRate: productRateState.addCustomerProductRate,
    updateCustomerProductRate: productRateState.updateCustomerProductRate,
    
    // Add supplier product rates
    supplierProductRates: productRateState.supplierProductRates || [],
    addSupplierProductRate: productRateState.addSupplierProductRate,
    
    // Stock transactions - using stockState properties
    stockTransactions: stockState.stockTransactions || [],
    addStockTransaction: stockState.addStockTransaction,
    updateStockTransaction: stockState.updateStockTransaction,
    deleteStockTransaction: stockState.deleteStockTransaction,
    
    // Vehicle and Salesman state
    vehicles: vehicleSalesmanState.vehicles,
    addVehicle: vehicleSalesmanState.addVehicle,
    updateVehicle: vehicleSalesmanState.updateVehicle,
    deleteVehicle: vehicleSalesmanState.deleteVehicle,
    salesmen: vehicleSalesmanState.salesmen,
    addSalesman: vehicleSalesmanState.addSalesman,
    updateSalesman: vehicleSalesmanState.updateSalesman,
    deleteSalesman: vehicleSalesmanState.deleteSalesman,
    addVehicleTrip,
    
    // Expense state
    expenses: expenseState.expenses,
    addExpense: expenseState.addExpense,
    updateExpense: expenseState.updateExpense,
    deleteExpense: expenseState.deleteExpense,
    getExpensesByCategory: expenseState.getExpensesByCategory,
    getExpensesByDateRange: expenseState.getExpensesByDateRange,
    getTotalExpenses: expenseState.getTotalExpenses,
    getExpenseStatsByCategory,
    
    // Stock entries
    stockEntries: stockState.stockEntries || [],
    addStockEntry: stockState.addStockEntry,
    
    // Explicitly define invoiceState properties to prevent type errors
    invoices: invoiceState.invoices,
    addInvoice: (invoice) => {
      const result = invoiceState.addInvoice(invoice);
      // Return the id as a string to match expected type
      return typeof result === 'string' ? result : String(result.id);
    },
    updateInvoice: invoiceState.updateInvoice,
    deleteInvoice: invoiceState.deleteInvoice,
    
    // Adding missing properties
    deleteMultiplePayments,
    generateInvoiceFromOrder,
    createTrackSheetFromOrder,
    
    // Add supplier payments functionality
    supplierPayments: supplierState.supplierPayments || [],
    addSupplierPayment: supplierState.addSupplierPayment,
    updateSupplierPayment: supplierState.updateSupplierPayment,
    deleteSupplierPayment: supplierState.deleteSupplierPayment,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export type { DataContextType };
