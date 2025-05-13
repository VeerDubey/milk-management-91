
import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomerState } from './useCustomerState';
import { useProductState } from './useProductState';
import { useOrderState } from './useOrderState';
import { usePaymentState } from './usePaymentState';
import { useSupplierState } from './useSupplierState';
import { useExpenseState } from './useExpenseState';
import { useStockState } from './useStockState';
import { useProductRateState } from './useProductRateState';
import { useVehicleSalesmanState } from './useVehicleSalesmanState';
import { useUISettingsState } from './useUISettingsState';

// Create data context
const DataContext = createContext<any>(undefined);

interface DataProviderProps {
  children: ReactNode;
  createInvoiceFunc?: Function | null;
}

// Provider component
export const DataProvider: React.FC<DataProviderProps> = ({ 
  children, 
  createInvoiceFunc = null 
}) => {
  // All individual state hooks
  const customerState = useCustomerState();
  const productState = useProductState();
  
  // Initialize orderState with the invoice creation function if available
  const orderState = useOrderState(createInvoiceFunc);
  
  const paymentState = usePaymentState(customerState.customers, customerState.updateCustomer);
  const supplierState = useSupplierState();
  const expenseState = useExpenseState();
  const stockState = useStockState(supplierState.updateSupplier);
  const productRateState = useProductRateState(productState.products);
  const vehicleSalesmanState = useVehicleSalesmanState();
  const uiSettingsState = useUISettingsState();

  // Combine all state into one object
  const dataContext = {
    ...customerState,
    ...productState,
    ...orderState,
    ...paymentState,
    ...supplierState,
    ...expenseState,
    ...stockState,
    ...productRateState,
    ...vehicleSalesmanState,
    ...uiSettingsState,
    createInvoiceFunc
  };

  // Provide combined state to children
  return (
    <DataContext.Provider value={dataContext}>
      {children}
    </DataContext.Provider>
  );
};

// Hook for using the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

