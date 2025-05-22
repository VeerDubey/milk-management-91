
import { Customer, Product, Order, Payment, CustomerProductRate, SupplierProductRate, StockEntry, StockRecord, Supplier, UISettings, Vehicle, Salesman, TrackSheet, Expense, Invoice, SupplierPayment } from '@/types';
import { VehicleCreateData, SalesmanCreateData } from './useVehicleSalesmanState';
import { ExpenseCreateData } from './useExpenseState';

export interface DataContextType {
  // Customer state
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getProductRateForCustomer?: (customerId: string, productId: string) => number | null;

  // Product state
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Order state
  orders: Order[];
  addOrder: (order: Omit<Order, "id">) => Order;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // Payment state
  payments: Payment[];
  addPayment: (payment: Omit<Payment, "id">) => Payment;
  updatePayment: (id: string, paymentData: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  deleteMultiplePayments?: (ids: string[]) => void;

  // Product rate state
  customerProductRates: CustomerProductRate[];
  addCustomerProductRate: (rate: Omit<CustomerProductRate, "id">) => CustomerProductRate;
  updateCustomerProductRate: (id: string, rateData: Partial<CustomerProductRate>) => void;
  deleteCustomerProductRate: (id: string) => void;
  
  // Stock state
  stockRecords: StockRecord[];
  stockEntries: StockEntry[];
  addStockRecord: (record: Omit<StockRecord, "id">) => StockRecord;
  updateStockRecord: (id: string, recordData: Partial<StockRecord>) => void;
  deleteStockRecord: (id: string) => void;
  addStockEntry: (entry: Omit<StockEntry, "id">) => StockEntry;
  updateStockEntry?: (id: string, entryData: Partial<StockEntry>) => void;
  deleteStockEntry?: (id: string) => void;
  addStock: (entry: Omit<StockEntry, "id">) => StockEntry;
  
  // Supplier state
  supplierProductRates: SupplierProductRate[];
  addSupplierProductRate: (rate: Omit<SupplierProductRate, "id">) => SupplierProductRate;
  updateSupplierProductRate: (id: string, rateData: Partial<SupplierProductRate>) => void;
  deleteSupplierProductRate: (id: string) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, "id">) => Supplier;
  updateSupplier: (id: string, supplierData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Supplier payments
  supplierPayments: SupplierPayment[];
  addSupplierPayment: (payment: Omit<SupplierPayment, "id">) => SupplierPayment;
  updateSupplierPayment: (id: string, paymentData: Partial<SupplierPayment>) => void;
  deleteSupplierPayment: (id: string) => void;
  
  // UI Settings state
  uiSettings: UISettings;
  updateUISettings: (settings: Partial<UISettings>) => void;
  
  // Vehicle/Salesman state
  vehicles: Vehicle[];
  addVehicle: (vehicle: VehicleCreateData) => Vehicle;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  salesmen: Salesman[];
  addSalesman: (salesman: SalesmanCreateData) => Salesman;
  updateSalesman: (id: string, salesmanData: Partial<Salesman>) => void;
  deleteSalesman: (id: string) => void;
  addVehicleTrip?: (vehicleId: string, tripData: any) => boolean;
  
  // Expense state
  expenses: Expense[];
  addExpense: (expense: ExpenseCreateData) => Expense; // Using ExpenseCreateData instead of Omit<Expense, "id">
  updateExpense: (id: string, expenseData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // TrackSheet state
  trackSheets: TrackSheet[];
  addTrackSheet: (trackSheet: Omit<TrackSheet, "id">) => TrackSheet;
  updateTrackSheet: (id: string, trackSheetData: Partial<TrackSheet>) => void;
  deleteTrackSheet: (id: string) => void;
  
  // Invoice state
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id">) => string; // Return type is string (invoice ID)
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
}
