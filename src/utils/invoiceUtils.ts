
import { Invoice } from "@/types";
import { format } from "date-fns";
import { generatePdfPreview } from "./pdfUtils";

// Invoice template definitions with improved previews and descriptions
export const INVOICE_TEMPLATES = [
  {
    id: "standard",
    name: "Standard Invoice",
    description: "Classic invoice format with company details and logo",
    previewImage: "standard-invoice.png",
    primaryColor: "#4f46e5", // Indigo
    fontFamily: "Arial",
    showHeader: true,
    showFooter: true
  },
  {
    id: "modern",
    name: "Modern Invoice",
    description: "Clean, contemporary design with minimalist layout",
    previewImage: "modern-invoice.png", 
    primaryColor: "#0ea5e9", // Sky blue
    fontFamily: "Helvetica",
    showHeader: true,
    showFooter: false
  },
  {
    id: "detailed",
    name: "Detailed Invoice",
    description: "Comprehensive format with item details and tax breakdown",
    previewImage: "detailed-invoice.png",
    primaryColor: "#10b981", // Emerald
    fontFamily: "Georgia",
    showHeader: true,
    showFooter: true
  },
  {
    id: "simple",
    name: "Simple Invoice",
    description: "Streamlined format with just the essentials",
    previewImage: "simple-invoice.png",
    primaryColor: "#f59e0b", // Amber
    fontFamily: "Calibri",
    showHeader: false,
    showFooter: true
  },
  {
    id: "professional",
    name: "Professional Invoice",
    description: "Elegant design suitable for corporations and professionals",
    previewImage: "professional-invoice.png",
    primaryColor: "#6366f1", // Indigo
    fontFamily: "Times New Roman",
    showHeader: true,
    showFooter: true
  },
  {
    id: "creative",
    name: "Creative Invoice",
    description: "Artistic layout perfect for creative professionals",
    previewImage: "creative-invoice.png",
    primaryColor: "#ec4899", // Pink
    fontFamily: "Verdana",
    showHeader: true,
    showFooter: true
  }
];

// Function to generate a random invoice number
export const generateInvoiceNumber = () => {
  const prefix = "INV";
  const timestamp = Date.now().toString().substring(7);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${randomNum}`;
};

// Function to calculate subtotal, taxes, and total
export const calculateInvoiceAmounts = (
  items: Array<{
    productId: string;
    quantity: number;
    rate: number;
    amount: number;
  }>,
  discountPercentage = 0,
  taxRate = 0
) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discountPercentage) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;
  
  return {
    subtotal,
    discountAmount,
    afterDiscount,
    taxAmount,
    total: Math.round(total * 100) / 100 // Round to 2 decimal places
  };
};

// Function to generate a PDF preview for an invoice
export const generateInvoicePreview = (
  invoice: {
    id: string;
    customerName: string;
    date: string;
    items: Array<{
      productId: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    totalAmount: number;
    notes?: string;
    terms?: string;
    status?: string;
    discountPercentage?: number;
    taxRate?: number;
  },
  companyInfo: {
    companyName: string;
    address: string;
    contactNumber: string;
    email: string;
    gstNumber: string;
    bankDetails: string;
    logoUrl?: string;
  },
  products: Array<{
    id: string;
    name: string;
    price: number;
  }>,
  templateId: string = "standard",
) => {
  // Get template configuration
  const template = INVOICE_TEMPLATES.find(t => t.id === templateId) || INVOICE_TEMPLATES[0];
  
  // Create column headers based on template
  const columns = ["Item", "Quantity", "Rate", "Amount"];
  if (templateId === "detailed") {
    columns.splice(2, 0, "Description");
  }
  
  // Map items to rows with product names
  const data = invoice.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    const row = [
      product ? product.name : "Unknown Product",
      item.quantity.toString(),
      `₹${item.rate.toFixed(2)}`,
      `₹${item.amount.toFixed(2)}`
    ];
    
    // Add description column for detailed template
    if (templateId === "detailed") {
      row.splice(2, 0, product?.description || "-");
    }
    
    return row;
  });
  
  // Calculate all amounts
  const { subtotal, discountAmount, taxAmount, total } = calculateInvoiceAmounts(
    invoice.items, 
    invoice.discountPercentage || 0,
    invoice.taxRate || 0
  );
  
  // Add subtotal row
  data.push(["", "", "", `₹${subtotal.toFixed(2)}`]);
  
  // Add discount row if applicable
  if ((invoice.discountPercentage || 0) > 0) {
    data.push(["Discount", `${invoice.discountPercentage}%`, "", `-₹${discountAmount.toFixed(2)}`]);
  }
  
  // Add tax row if applicable
  if ((invoice.taxRate || 0) > 0) {
    data.push(["Tax", `${invoice.taxRate}%`, "", `₹${taxAmount.toFixed(2)}`]);
  }
  
  // Add total row
  data.push(["", "", "Total", `₹${total.toFixed(2)}`]);
  
  // Generate additional info based on template
  const additionalInfo = [
    { label: "Customer", value: invoice.customerName || "Unknown" },
    { label: "Status", value: invoice.status || "Draft" },
    { label: "GST No.", value: companyInfo.gstNumber }
  ];
  
  if (invoice.notes) {
    additionalInfo.push({ label: "Notes", value: invoice.notes });
  }
  
  if (invoice.terms) {
    additionalInfo.push({ label: "Terms", value: invoice.terms });
  }
  
  // Generate PDF preview with different styling based on template
  return generatePdfPreview(
    columns,
    data,
    {
      title: companyInfo.companyName,
      subtitle: `Invoice #: ${invoice.id}`,
      dateInfo: `Date: ${format(new Date(invoice.date), "dd MMMM yyyy")}`,
      additionalInfo: additionalInfo,
      landscape: templateId === "detailed",
      fontSizeAdjustment: templateId === "modern" ? -1 : 0,
      filename: `invoice-${invoice.id}.pdf`,
      primaryColor: template.primaryColor,
      fontFamily: template.fontFamily,
      showHeader: template.showHeader,
      showFooter: template.showFooter,
      logoUrl: companyInfo.logoUrl
    }
  );
};

// Function to create an invoice object from form data
export const createInvoiceFromFormData = (
  formData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerId: string;
    customerName: string;
    items: Array<{
      productId: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    notes?: string;
    terms?: string;
    discountPercentage?: number;
    taxRate?: number;
    templateId?: string;
  }
): Invoice => {
  const { total } = calculateInvoiceAmounts(
    formData.items, 
    formData.discountPercentage || 0, 
    formData.taxRate || 0
  );
  
  return {
    id: formData.invoiceNumber,
    orderId: `ORD-${Date.now().toString().substring(7)}`,
    customerName: formData.customerName,
    date: formData.invoiceDate,
    amount: total,
    status: "Pending",
    items: formData.items.map(item => ({
      customerId: formData.customerId,
      productId: item.productId,
      quantity: item.quantity
    }))
  };
};

// Function to create an invoice from an existing order
export const createInvoiceFromOrder = (
  order: {
    id: string;
    date: string;
    items: Array<{
      customerId: string;
      productId: string;
      quantity: number;
    }>;
    customerName?: string;
  },
  products: Array<{
    id: string;
    name: string;
    price: number;
  }>,
  customerId: string,
  customerName: string
): Invoice => {
  // Map order items to invoice items with calculated amounts
  const invoiceItems = order.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    const rate = product ? product.price : 0;
    
    return {
      productId: item.productId,
      quantity: item.quantity,
      rate: rate,
      amount: rate * item.quantity
    };
  });

  // Calculate total amount
  const { total } = calculateInvoiceAmounts(invoiceItems);
  
  return {
    id: generateInvoiceNumber(),
    orderId: order.id,
    customerName: customerName || order.customerName || "Unknown Customer",
    date: order.date,
    amount: total,
    status: "Pending",
    items: order.items
  };
};

// Generate a formatted date string in YYYY-MM-DD format
export const formatDateForInput = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// Generate due date (typically 15 days after invoice date)
export const generateDueDate = (invoiceDate: string, daysToAdd = 15): string => {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + daysToAdd);
  return formatDateForInput(date);
};

