
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

  // Helper function to get product rate for a customer
  const getProductRateForCustomer = (customerId: string, productId: string): number | null => {
    const rate = productRateState.customerProductRates.find(
      (rate) => rate.customerId === customerId && rate.productId === productId && rate.isActive
    );
    return rate ? rate.rate : null;
  };

  // Helper function to delete multiple payments
  const deleteMultiplePayments = (ids: string[]): void => {
    if (ids && ids.length > 0) {
      ids.forEach(id => paymentState.deletePayment(id));
    }
  };

  // Combine all state objects into one
  const contextValue: DataContextType = {
    ...customerState,
    ...productState,
    ...orderState,
    ...paymentState,
    ...productRateState,
    ...stockState,
    ...supplierState,
    ...uiSettingsState,
    ...trackSheetState,
    
    // Vehicle and Salesman state
    vehicles: vehicleSalesmanState.vehicles,
    addVehicle: vehicleSalesmanState.addVehicle,
    updateVehicle: vehicleSalesmanState.updateVehicle,
    deleteVehicle: vehicleSalesmanState.deleteVehicle,
    salesmen: vehicleSalesmanState.salesmen,
    addSalesman: vehicleSalesmanState.addSalesman,
    updateSalesman: vehicleSalesmanState.updateSalesman,
    deleteSalesman: vehicleSalesmanState.deleteSalesman,
    addVehicleTrip: vehicleSalesmanState.addVehicleTrip,
    
    // Expense state
    expenses: expenseState.expenses,
    addExpense: expenseState.addExpense,
    updateExpense: expenseState.updateExpense,
    deleteExpense: expenseState.deleteExpense,
    
    // Explicitly define invoiceState properties to prevent type errors
    invoices: invoiceState.invoices,
    addInvoice: (invoice) => {
      const result = invoiceState.addInvoice(invoice);
      // Return the id as a string to match expected type
      return typeof result === 'object' && result !== null && 'id' in result ? result.id : String(result);
    },
    updateInvoice: invoiceState.updateInvoice,
    deleteInvoice: invoiceState.deleteInvoice,
    
    // Adding missing properties
    getProductRateForCustomer,
    deleteMultiplePayments,
    
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
