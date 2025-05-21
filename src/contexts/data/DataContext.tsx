
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
import { initialCustomers, initialProducts, initialOrders, initialPayments, initialExpenses, initialSuppliers } from '@/data/initialData';
import { useInvoices } from '@/contexts/InvoiceContext';
import { DataContextType } from './types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize all the state hooks with proper arguments
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
    ...vehicleSalesmanState,
    ...expenseState,
    ...trackSheetState,
    // Explicitly define invoiceState properties to prevent type errors
    invoices: invoiceState.invoices,
    addInvoice: (invoice) => {
      return invoiceState.addInvoice(invoice);
      // Return type issue fixed by removing the cast to string
    },
    updateInvoice: invoiceState.updateInvoice,
    deleteInvoice: invoiceState.deleteInvoice,
    
    // Adding missing properties
    addStock: stockState.addStock,
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
