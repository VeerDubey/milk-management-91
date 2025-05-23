
import React, { createContext, useContext, ReactNode } from 'react';
import { Customer, Product, Order, Invoice } from '@/types';
import { useCustomerState } from './useCustomerState';
import { useProductState } from './useProductState';
import { useOrderState } from './useOrderState';
import { usePaymentState } from './usePaymentState';
import { useSupplierState } from './useSupplierState';
import { useStockState } from './useStockState';
import { useExpenseState } from './useExpenseState';
import { useTrackSheetState } from './useTrackSheetState';
import { useVehicleSalesmanState } from './useVehicleSalesmanState';
import { useProductRateState } from './useProductRateState';
import { useUISettingsState } from './useUISettingsState';
import { DataContextType } from './types';

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data without createdAt/updatedAt fields
const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+91 98765 43210',
    address: '123 Main St, City, State 12345',
    isActive: true,
    outstandingBalance: 500,
    email: 'john@example.com',
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+91 87654 32109',
    address: '456 Oak Ave, City, State 12345',
    isActive: true,
    outstandingBalance: 300,
    email: 'jane@example.com',
  }
];

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Fresh Milk',
    price: 30,
    unit: 'liter',
    description: 'Fresh cow milk',
    isActive: true,
    category: 'Dairy',
  },
  {
    id: '2',
    name: 'Yogurt',
    price: 25,
    unit: 'cup',
    description: 'Fresh homemade yogurt',
    isActive: true,
    category: 'Dairy',
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize all state hooks
  const customerState = useCustomerState();
  const productState = useProductState();
  const orderState = useOrderState();
  const vehicleSalesmanState = useVehicleSalesmanState();
  const paymentState = usePaymentState(customerState.customers, customerState.updateCustomer);
  const supplierState = useSupplierState();
  const stockState = useStockState(supplierState.updateSupplier);
  const expenseState = useExpenseState();
  const trackSheetState = useTrackSheetState();
  const productRateState = useProductRateState(productState.products);
  const uiSettingsState = useUISettingsState();

  // Initialize customers and products with sample data if empty
  React.useEffect(() => {
    if (customerState.customers.length === 0) {
      sampleCustomers.forEach(customer => {
        customerState.addCustomer(customer);
      });
    }
  }, []);

  React.useEffect(() => {
    if (productState.products.length === 0) {
      sampleProducts.forEach(product => {
        productState.addProduct(product);
      });
    }
  }, []);

  // Helper functions
  const getCustomerById = (id: string) => {
    return customerState.customers.find(customer => customer.id === id);
  };

  const getProductById = (id: string) => {
    return productState.products.find(product => product.id === id);
  };

  const getOrderById = (id: string) => {
    return orderState.orders.find(order => order.id === id);
  };

  // Invoice management (simplified)
  const [invoices, setInvoices] = React.useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
    };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice.id;
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(invoices =>
      invoices.map(invoice =>
        invoice.id === id ? { ...invoice, ...invoiceData } : invoice
      )
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices => invoices.filter(invoice => invoice.id !== id));
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
  };

  const generateInvoiceFromOrder = (orderId: string): string | null => {
    const order = getOrderById(orderId);
    if (!order) return null;

    const customer = getCustomerById(order.customerId || '');
    if (!customer) return null;

    const currentDate = new Date().toISOString();
    const invoiceData: Omit<Invoice, 'id'> = {
      customerId: order.customerId || '',
      customerName: customer.name,
      number: `INV-${Date.now()}`,
      date: currentDate,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: order.items.map(item => ({
        productId: item.productId,
        description: getProductById(item.productId)?.name || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice
      })),
      subtotal: order.total || 0,
      taxRate: 0,
      taxAmount: 0,
      total: order.total || 0,
      status: 'draft' as const,
      notes: '',
      termsAndConditions: '',
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    return addInvoice(invoiceData);
  };

  return (
    <DataContext.Provider
      value={{
        // Customer state
        customers: customerState.customers,
        addCustomer: customerState.addCustomer,
        updateCustomer: customerState.updateCustomer,
        deleteCustomer: customerState.deleteCustomer,
        getCustomerById,

        // Product state
        products: productState.products,
        addProduct: productState.addProduct,
        updateProduct: productState.updateProduct,
        deleteProduct: productState.deleteProduct,
        getProductById,

        // Order state
        orders: orderState.orders,
        addOrder: orderState.addOrder,
        updateOrder: orderState.updateOrder,
        deleteOrder: orderState.deleteOrder,
        getOrderById,
        addBatchOrders: orderState.addBatchOrders,
        duplicateOrder: orderState.duplicateOrder,
        calculateOrderTotal: orderState.calculateOrderTotal,

        // Payment state
        payments: paymentState.payments,
        addPayment: paymentState.addPayment,
        updatePayment: paymentState.updatePayment,
        deletePayment: paymentState.deletePayment,
        deleteMultiplePayments: paymentState.deleteMultiplePayments,

        // Product rate state
        customerProductRates: productRateState.customerProductRates,
        addProductRate: productRateState.addCustomerProductRate,
        updateProductRate: productRateState.updateCustomerProductRate,
        deleteProductRate: productRateState.deleteCustomerProductRate,
        getProductRateForCustomer: productRateState.getProductRateForCustomer,
        addCustomerProductRate: productRateState.addCustomerProductRate,
        updateCustomerProductRate: productRateState.updateCustomerProductRate,

        // Stock state
        stockTransactions: stockState.stockTransactions,
        addStockTransaction: stockState.addStockTransaction,
        updateStockTransaction: stockState.updateStockTransaction,
        deleteStockTransaction: stockState.deleteStockTransaction,
        stockEntries: stockState.stockEntries,
        addStockEntry: stockState.addStockEntry,

        // Supplier state
        suppliers: supplierState.suppliers,
        addSupplier: supplierState.addSupplier,
        updateSupplier: supplierState.updateSupplier,
        deleteSupplier: supplierState.deleteSupplier,
        supplierProductRates: supplierState.supplierProductRates,
        addSupplierProductRate: supplierState.addSupplierProductRate,
        updateSupplierProductRate: supplierState.updateSupplierProductRate,
        deleteSupplierProductRate: supplierState.deleteSupplierProductRate,
        supplierPayments: supplierState.supplierPayments,
        addSupplierPayment: supplierState.addSupplierPayment,
        updateSupplierPayment: supplierState.updateSupplierPayment,
        deleteSupplierPayment: supplierState.deleteSupplierPayment,

        // UI settings state
        uiSettings: uiSettingsState.uiSettings,
        updateUISettings: uiSettingsState.updateUISettings,

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
        getExpensesByCategory: expenseState.getExpensesByCategory,
        getExpensesByDateRange: expenseState.getExpensesByDateRange,
        getTotalExpenses: expenseState.getTotalExpenses,
        getExpenseStatsByCategory: () => {
          const stats = expenseState.getExpenseStatsByCategory();
          return Object.entries(stats).map(([category, total]) => ({
            category,
            total
          }));
        },

        // TrackSheet state
        trackSheets: trackSheetState.trackSheets,
        addTrackSheet: trackSheetState.addTrackSheet,
        updateTrackSheet: trackSheetState.updateTrackSheet,
        deleteTrackSheet: trackSheetState.deleteTrackSheet,
        trackSheetTemplates: trackSheetState.trackSheetTemplates,
        createTemplate: trackSheetState.createTemplate,
        deleteTemplate: trackSheetState.deleteTemplate,
        createTrackSheetFromOrder: trackSheetState.createTrackSheetFromOrder,

        // Invoice state
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
        generateInvoiceFromOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export type { DataContextType };
