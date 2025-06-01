import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Product, Order, Vehicle, Salesman } from '@/types';
import { useCustomerState } from './useCustomerState';
import { useProductState } from './useProductState';
import { useOrderState } from './useOrderState';
import { useVehicleState } from './useVehicleState';
import { useSalesmanState } from './useSalesmanState';
import { useInitialData } from './useInitialData';

interface DataContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  salesmen: Salesman[];
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, "id">) => Product;
  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  addOrder: (order: Omit<Order, "id">) => Order;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Vehicle;
  addSalesman: (salesman: Omit<Salesman, "id">) => Salesman;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => void;
  updateSalesman: (id: string, salesmanData: Partial<Salesman>) => void;
  deleteProduct: (id: string) => void;
  deleteCustomer: (id: string) => void;
  deleteOrder: (id: string) => void;
  deleteVehicle: (id: string) => void;
  deleteSalesman: (id: string) => void;
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
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomerState();

  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProductState();

  const {
    orders,
    addOrder,
    updateOrder,
    deleteOrder
  } = useOrderState();

  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehicleState();

  const {
    salesmen,
    addSalesman,
    updateSalesman,
    deleteSalesman
  } = useSalesmanState();
  
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

  const value: DataContextType = {
    customers,
    products,
    orders,
    vehicles,
    salesmen,
    addProduct,
    addCustomer,
    addOrder,
    addVehicle,
    addSalesman,
    updateProduct,
    updateCustomer,
    updateOrder,
    updateVehicle,
    updateSalesman,
    deleteProduct,
    deleteCustomer,
    deleteOrder,
    deleteVehicle,
    deleteSalesman,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
