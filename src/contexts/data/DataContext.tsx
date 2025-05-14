
import React, { createContext, useContext, ReactNode, useState } from 'react';
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

// This context type will dynamically build based on all the hooks
type DataContextType = ReturnType<typeof useCustomerState> &
  ReturnType<typeof useProductState> &
  ReturnType<typeof useOrderState> &
  ReturnType<typeof usePaymentState> &
  ReturnType<typeof useProductRateState> &
  ReturnType<typeof useStockState> &
  ReturnType<typeof useSupplierState> &
  ReturnType<typeof useUISettingsState> &
  ReturnType<typeof useVehicleSalesmanState> &
  ReturnType<typeof useExpenseState>;

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize all the state hooks
  const customerState = useCustomerState(initialCustomers, { saveToLocalStorage: true });
  const productState = useProductState(initialProducts);
  const orderState = useOrderState(initialOrders);
  const paymentState = usePaymentState();
  const productRateState = useProductRateState();
  const stockState = useStockState();
  const supplierState = useSupplierState();
  const uiSettingsState = useUISettingsState();
  const vehicleSalesmanState = useVehicleSalesmanState();
  const expenseState = useExpenseState();

  // Combine all state objects into one
  const contextValue = {
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
