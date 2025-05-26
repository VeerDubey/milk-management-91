// Add necessary imports for calculations and PDF generation
import { TrackSheet, TrackSheetRow } from '@/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DownloadService } from '@/services/DownloadService';

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
  
  // Header with company branding
  doc.setFillColor(51, 65, 85); // Dark blue header
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Vikas Milk Centre', 14, 20);
  
  // Track sheet title
  doc.setFontSize(16);
  doc.text('Track Sheet', 14, 32);
  
  // Reset colors for content
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Track sheet details
  let yPos = 50;
  doc.text(`Date: ${trackSheet.date}`, 14, yPos);
  yPos += 8;
  
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
  
  // Prepare table data
  const tableHeaders = ['Customer', ...productNames, 'Total', 'Amount'];
  const tableData = trackSheet.rows.map((row: any) => [
    row.name || 'Unknown',
    ...productNames.map(product => row.quantities[product] || '-'),
    String(row.total || 0),
    `₹${(row.amount || 0).toFixed(2)}`
  ]);
  
  // Add totals row
  const productTotals = productNames.map(product => {
    return trackSheet.rows.reduce((sum: number, row: any) => {
      const qty = row.quantities[product];
      return sum + (qty === '' || qty === undefined ? 0 : Number(qty));
    }, 0);
  });
  
  const grandTotal = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
  const grandAmount = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.amount || 0), 0);
  
  tableData.push([
    'TOTAL',
    ...productTotals.map(total => String(total)),
    String(grandTotal),
    `₹${grandAmount.toFixed(2)}`
  ]);
  
  // Generate table using autoTable
  (doc as any).autoTable({
    startY: yPos + 10,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue header
      textColor: 255,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [243, 244, 246], // Light gray footer
      textColor: 0,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Very light gray
    }
  });
  
  // Add notes if present
  if (trackSheet.notes) {
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 100;
    doc.setFontSize(10);
    doc.text('Notes:', 14, finalY + 20);
    doc.text(trackSheet.notes, 14, finalY + 30);
  }
  
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

export const savePdf = async (doc: jsPDF, filename: string): Promise<boolean> => {
  return DownloadService.downloadPDF(doc, filename);
};

export const exportTrackSheetToCSV = (trackSheet: any, productNames: string[]): Promise<boolean> => {
  // Create CSV headers
  const headers = ['Customer', ...productNames, 'Total', 'Amount'];
  
  // Create CSV rows
  const rows = trackSheet.rows.map((row: any) => [
    row.name || 'Unknown',
    ...productNames.map(product => row.quantities[product] || '0'),
    String(row.total || 0),
    String(row.amount || 0)
  ]);
  
  // Add totals row
  const productTotals = productNames.map(product => {
    return trackSheet.rows.reduce((sum: number, row: any) => {
      const qty = row.quantities[product];
      return sum + (qty === '' || qty === undefined ? 0 : Number(qty));
    }, 0);
  });
  
  const grandTotal = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
  const grandAmount = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.amount || 0), 0);
  
  rows.push([
    'TOTAL',
    ...productTotals.map(total => String(total)),
    String(grandTotal),
    String(grandAmount)
  ]);
  
  // Convert to CSV string
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const filename = `tracksheet-${trackSheet.date}.csv`;
  return DownloadService.downloadCSV(csvContent, filename);
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
