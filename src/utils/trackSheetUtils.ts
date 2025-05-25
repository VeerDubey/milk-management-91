
// Add necessary imports for calculations and PDF generation
import { TrackSheet, TrackSheetRow } from '@/types';
import { jsPDF } from 'jspdf';

// Import autoTable properly
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

// Define types
export interface TrackSheetTemplate {
  id: string;
  name: string;
  rows: TrackSheetRow[];
  createdAt: string;
}

// Utility function to calculate totals
export const calculateTotals = (rows: TrackSheetRow[]) => {
  const totalQuantity = rows.reduce((sum, row) => sum + row.total, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return {
    totalQuantity,
    totalAmount
  };
};

// Utility function to calculate product totals
export const calculateProductTotals = (rows: TrackSheetRow[], products: string[]) => {
  // Initialize product totals object
  const productTotals: Record<string, number> = {};
  
  // Initialize all products with 0
  products.forEach(productName => {
    productTotals[productName] = 0;
  });
  
  // Sum up quantities for each product
  rows.forEach(row => {
    Object.entries(row.quantities).forEach(([productName, quantity]) => {
      if (products.includes(productName)) {
        const numQuantity = quantity === '' ? 0 : typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
        productTotals[productName] = (productTotals[productName] || 0) + (isNaN(numQuantity) ? 0 : numQuantity);
      }
    });
  });
  
  return productTotals;
};

// Function to generate a PDF from track sheet data with simplified approach
export const generateTrackSheetPdf = (trackSheet: any, productNames: string[], customers: any[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Track Sheet', 14, 22);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Date: ${trackSheet.date}`, 14, 32);
  
  // Add vehicle and salesman info if available
  let yPos = 36;
  if (trackSheet.vehicleName) {
    doc.text(`Vehicle: ${trackSheet.vehicleName}`, 14, yPos);
    yPos += 6;
  }
  if (trackSheet.salesmanName) {
    doc.text(`Salesman: ${trackSheet.salesmanName}`, 14, yPos);
    yPos += 6;
  }
  if (trackSheet.routeName) {
    doc.text(`Route: ${trackSheet.routeName}`, 14, yPos);
    yPos += 6;
  }
  
  // Add a simple table representation
  yPos += 10;
  doc.setFontSize(10);
  
  // Headers
  doc.text('Customer', 14, yPos);
  doc.text('Products', 60, yPos);
  doc.text('Total', 140, yPos);
  doc.text('Amount', 170, yPos);
  
  yPos += 6;
  
  // Data rows
  trackSheet.rows.forEach((row: any) => {
    if (yPos > 280) { // New page if needed
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(row.name || 'Unknown', 14, yPos);
    
    // Product quantities
    const productText = Object.entries(row.quantities)
      .filter(([_, qty]) => qty && qty !== 0)
      .map(([product, qty]) => `${product}: ${qty}`)
      .join(', ');
    
    doc.text(productText.substring(0, 40), 60, yPos);
    doc.text(String(row.total || 0), 140, yPos);
    doc.text(`₹${(row.amount || 0).toFixed(2)}`, 170, yPos);
    
    yPos += 6;
  });
  
  return doc;
};

// Function to create a template from track sheet data
export const createTrackSheetTemplate = (name: string, rows: TrackSheetRow[]) => {
  return {
    id: `template-${Date.now()}`,
    name,
    rows,
    createdAt: new Date().toISOString()
  };
};

// Function to create empty track sheet rows
export const createEmptyTrackSheetRows = (customers: any[], products: string[]) => {
  return customers.map(customer => ({
    name: customer.name,
    customerId: customer.id,
    quantities: products.reduce((acc, product) => {
      acc[product] = '';
      return acc;
    }, {} as Record<string, string | number>),
    total: 0,
    amount: 0,
    products // Add the products array to the row
  }));
};

// Other utility functions...

export const savePdf = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

export const getBlankRow = (products: string[]): TrackSheetRow => {
  return {
    name: '',
    customerId: '',
    quantities: products.reduce((acc, product) => {
      acc[product] = '';
      return acc;
    }, {} as Record<string, string | number>),
    total: 0,
    amount: 0,
    products // Add the products array to the row
  };
};

export const filterEmptyRows = (rows: TrackSheetRow[]): TrackSheetRow[] => {
  return rows.filter(row => {
    // Keep rows that have a customer name and at least one non-zero quantity
    return row.name && Object.values(row.quantities).some(q => q !== '' && q !== 0);
  });
};
