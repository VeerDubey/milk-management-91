
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
import { initialCustomers, initialProducts, initialOrders, initialPayments, initialExpenses, initialSuppliers } from '@/data/initialData';
import { useInvoice } from '@/contexts/InvoiceContext';
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
  
  // Use the actual invoice context data
  const invoiceState = useInvoice();

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
    // Use the actual invoice data
    ...invoiceState
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
