
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Product, Order, Invoice } from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  addOrder: (order: Omit<Order, 'id'>) => Order;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data
const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    address: '123 Main St, City, State 12345',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 87654 32109',
    address: '456 Oak Ave, City, State 12345',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Fresh Milk',
    price: 30,
    unit: 'liter',
    category: 'Dairy',
    description: 'Fresh cow milk',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Yogurt',
    price: 25,
    unit: 'cup',
    category: 'Dairy',
    description: 'Fresh homemade yogurt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : sampleCustomers;
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : sampleProducts;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);
  
  // Customer operations
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };
  
  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(customers =>
      customers.map(customer =>
        customer.id === id
          ? { ...customer, ...customerData, updatedAt: new Date().toISOString() }
          : customer
      )
    );
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(customers => customers.filter(customer => customer.id !== id));
  };
  
  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };
  
  // Product operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };
  
  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(products =>
      products.map(product =>
        product.id === id
          ? { ...product, ...productData, updatedAt: new Date().toISOString() }
          : product
      )
    );
  };
  
  const deleteProduct = (id: string) => {
    setProducts(products => products.filter(product => product.id !== id));
  };
  
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };
  
  // Order operations
  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };
  
  const updateOrder = (id: string, orderData: Partial<Order>) => {
    setOrders(orders =>
      orders.map(order =>
        order.id === id
          ? { ...order, ...orderData, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };
  
  const deleteOrder = (id: string) => {
    setOrders(orders => orders.filter(order => order.id !== id));
  };
  
  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };
  
  // Invoice operations
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };
  
  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(invoices =>
      invoices.map(invoice =>
        invoice.id === id
          ? { ...invoice, ...invoiceData, updatedAt: new Date().toISOString() }
          : invoice
      )
    );
  };
  
  const deleteInvoice = (id: string) => {
    setInvoices(invoices => invoices.filter(invoice => invoice.id !== id));
  };
  
  const getInvoiceById = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
  };
  
  return (
    <DataContext.Provider
      value={{
        customers,
        products,
        orders,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
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
