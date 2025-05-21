
import { 
  Customer, Product, Order, Payment, 
  CustomerProductRate, SupplierProductRate, 
  Supplier, UISettings, Vehicle, Salesman, 
  Expense, TrackSheet, Invoice, SupplierPayment,
  StockRecord, StockEntry, StockEntryItem
} from '@/types';

// Define these types directly
export interface OrderData {
  customerId: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  date: string;
  notes?: string;
}

export interface PaymentAmount {
  amount: number;
  method: 'cash' | 'bank' | 'upi' | 'other';
  date: string;
}

export interface DataContextType {
  // Customer state
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id">) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Product state
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Order state
  orders: Order[];
  addOrder: (order: Omit<Order, "id">) => void;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  
  // Payment state
  payments: Payment[];
  addPayment: (payment: Omit<Payment, "id">) => void | Payment;
  updatePayment: (id: string, paymentData: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  deleteMultiplePayments: (ids: string[]) => void;
  
  // Product Rate state
  customerProductRates: CustomerProductRate[];
  supplierProductRates: SupplierProductRate[];
  addCustomerProductRate: (rate: Omit<CustomerProductRate, "id">) => void;
  updateCustomerProductRate: (id: string, rateData: Partial<CustomerProductRate>) => void;
  deleteCustomerProductRate: (id: string) => void;
  getCustomerProductRates: (customerId: string) => CustomerProductRate[];
  getProductRateForCustomer: (customerId: string, productId: string) => number;
  addSupplierProductRate: (rate: Omit<SupplierProductRate, "id">) => void;
  updateSupplierProductRate: (id: string, rateData: Partial<SupplierProductRate>) => void;
  deleteSupplierProductRate: (id: string) => void;
  getSupplierProductRates: (supplierId: string) => SupplierProductRate[];
  getProductRateForSupplier: (supplierId: string, productId: string) => number | null;
  getSupplierRateHistory: (supplierId: string, productId: string) => SupplierProductRate[];
  
  // Supplier state
  suppliers: Supplier[];
  supplierPayments: SupplierPayment[];
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, supplierData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addSupplierPayment: (payment: Omit<SupplierPayment, "id">) => void;
  updateSupplierPayment: (id: string, paymentData: Partial<SupplierPayment>) => void;
  deleteSupplierPayment: (id: string) => void;
  
  // Stock state
  stockRecords: StockRecord[];
  stockEntries: StockEntry[];
  addStockRecord: (record: Omit<StockRecord, "id">) => void;
  updateStockRecord: (id: string, recordData: Partial<StockRecord>) => void;
  deleteStockRecord: (id: string) => void;
  addStockEntry: (entry: StockEntry) => void;
  updateStockEntry: (id: string, entryData: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  addStock: (supplierId: string, productId: string, quantity: number, pricePerUnit: number, date: string) => void;
  
  // UI Settings state
  uiSettings: UISettings;
  updateUISettings: (settings: Partial<UISettings>) => void;
  
  // Vehicle/Salesman state
  vehicles: Vehicle[];
  salesmen: Salesman[];
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addSalesman: (salesman: Omit<Salesman, "id">) => void;
  updateSalesman: (id: string, salesmanData: Partial<Salesman>) => void;
  deleteSalesman: (id: string) => void;
  
  // Expense state
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expenseData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Track Sheet state
  trackSheets: TrackSheet[];
  addTrackSheet: (trackSheet: Omit<TrackSheet, "id">) => void;
  updateTrackSheet: (id: string, trackSheetData: Partial<TrackSheet>) => void;
  deleteTrackSheet: (id: string) => void;
  
  // Invoice context data
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id">) => string;
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
}
