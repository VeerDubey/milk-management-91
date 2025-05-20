// Add necessary imports for calculations and PDF generation
import { TrackSheet, TrackSheetRow } from '@/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

// Function to generate a PDF from track sheet data
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
  
  // Prepare data for table
  const headers = ['Customer', ...productNames, 'Total', 'Amount'];
  const data = trackSheet.rows.map((row: any) => {
    const rowData = [row.name || 'Unknown'];
    productNames.forEach(product => {
      rowData.push(row.quantities[product] || '');
    });
    rowData.push(row.total || 0);
    rowData.push(row.amount || 0);
    return rowData;
  });
  
  // Add table
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: yPos + 5,
    styles: {
      fontSize: 8
    },
    headStyles: {
      fillColor: [66, 139, 202]
    }
  });
  
  // Save the PDF
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
    products
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
    products
  };
};

export const filterEmptyRows = (rows: TrackSheetRow[]): TrackSheetRow[] => {
  return rows.filter(row => {
    // Keep rows that have a customer name and at least one non-zero quantity
    return row.name && Object.values(row.quantities).some(q => q !== '' && q !== 0);
  });
};
