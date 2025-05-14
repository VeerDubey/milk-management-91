
import { 
  Customer, Product, Order, Payment, 
  Expense, Supplier, SupplierPayment, CustomerProductRate,
  StockRecord, StockEntry, SupplierProductRate, Vehicle, Salesman, UISettings, Invoice
} from "@/types";

export interface DataContextType {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  expenses: Expense[];
  suppliers: Supplier[];
  supplierPayments: SupplierPayment[];
  customerProductRates: CustomerProductRate[];
  stockRecords: StockRecord[];
  stockEntries: StockEntry[];
  supplierProductRates: SupplierProductRate[];
  vehicles: Vehicle[];
  salesmen: Salesman[];
  uiSettings: UISettings;
  invoices: Invoice[]; // Add invoices array
  
  addCustomer: (customer: Omit<Customer, "id">) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductMinStock: (id: string, minStockLevel: number) => void;
  
  addOrder: (order: Omit<Order, "id">) => void;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  
  addPayment: (payment: Omit<Payment, "id">) => void;
  updatePayment: (id: string, paymentData: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expenseData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, supplierData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addSupplierPayment: (payment: Omit<SupplierPayment, "id">) => void;
  updateSupplierPayment: (id: string, paymentData: Partial<SupplierPayment>) => void;
  deleteSupplierPayment: (id: string) => void;
  
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
  
  addStockRecord: (record: Omit<StockRecord, "id">) => void;
  updateStockRecord: (id: string, recordData: Partial<StockRecord>) => void;
  deleteStockRecord: (id: string) => void;
  
  addStockEntry: (entry: StockEntry) => void;
  updateStockEntry: (id: string, entryData: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  addSalesman: (salesman: Omit<Salesman, "id">) => void;
  updateSalesman: (id: string, salesmanData: Partial<Salesman>) => void;
  deleteSalesman: (id: string) => void;
  
  updateUISettings: (settings: Partial<UISettings>) => void;
  
  addInvoice: (invoice: Omit<Invoice, "id">) => void;
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
}
