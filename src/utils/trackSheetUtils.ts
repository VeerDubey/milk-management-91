
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Product, Customer } from '@/types';
import PubSub from 'pubsub-js';

export interface TrackSheetRow {
  customerId: string;
  customerName: string;
  products: {[productId: string]: number};
  total: number;
  name?: string; // Added for compatibility
  quantities?: {[productName: string]: number | string}; // Added for compatibility
  amount?: number; // Added for compatibility
}

interface ExportData {
  date: string;
  rows: TrackSheetRow[];
  products: Product[];
  customers: Customer[];
}

// Calculate product totals from track sheet rows
export const calculateProductTotals = (rows: TrackSheetRow[], productNames: string[]) => {
  const totals: { [productName: string]: number } = {};
  
  productNames.forEach(name => {
    totals[name] = 0;
  });
  
  rows.forEach(row => {
    if (row.quantities) {
      // Handle quantities property
      Object.entries(row.quantities).forEach(([productName, qty]) => {
        if (typeof qty === 'number') {
          totals[productName] = (totals[productName] || 0) + qty;
        }
      });
    } else if (row.products) {
      // Handle products property
      Object.entries(row.products).forEach(([productId, qty]) => {
        // Map productId to name - this is a simplified version
        const productName = productId; // In real app, you'd map ID to name
        totals[productName] = (totals[productName] || 0) + qty;
      });
    }
  });
  
  return totals;
};

// Calculate overall totals from track sheet rows
export const calculateTotals = (rows: TrackSheetRow[]) => {
  let totalQuantity = 0;
  let totalAmount = 0;
  
  rows.forEach(row => {
    totalQuantity += row.total || 0;
    totalAmount += row.amount || 0;
  });
  
  return { totalQuantity, totalAmount };
};

// Create empty track sheet rows
export const createEmptyTrackSheetRows = (productNames: string[]) => {
  // Create 5 empty rows
  const emptyRows: TrackSheetRow[] = Array(5).fill(null).map(() => {
    const quantities: {[key: string]: string | number} = {};
    productNames.forEach(product => {
      quantities[product] = '';
    });
    
    return {
      customerId: '',
      customerName: '',
      products: {},
      total: 0,
      name: '',
      quantities: quantities,
      amount: 0
    };
  });
  
  return emptyRows;
};

// Create track sheet template with sample data
export const createTrackSheetTemplate = (productNames: string[], date: Date, routeName: string) => {
  const sampleRows: TrackSheetRow[] = [
    { customerId: '1', customerName: 'Customer 1', products: {}, total: 6, name: 'Customer 1', quantities: {}, amount: 300 },
    { customerId: '2', customerName: 'Customer 2', products: {}, total: 8, name: 'Customer 2', quantities: {}, amount: 400 },
    { customerId: '3', customerName: 'Customer 3', products: {}, total: 5, name: 'Customer 3', quantities: {}, amount: 250 },
  ];
  
  // Fill in sample quantities for each product
  sampleRows.forEach(row => {
    const quantities: {[key: string]: number} = {};
    
    productNames.forEach((product, index) => {
      // Generate some random but consistent quantities
      const base = index % 3 + 1;
      quantities[product] = base + (row.customerId === '1' ? 1 : row.customerId === '2' ? 2 : 0);
    });
    
    row.quantities = quantities;
  });
  
  return sampleRows;
};

// Generate PDF export
export const generateTrackSheetPdf = (
  title: string, 
  date: Date, 
  rows: TrackSheetRow[], 
  productNames: string[],
  additionalInfo: Array<{label: string, value: string}> = []
) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Date: ${format(date, "PPP")}`, 14, 32);
  
  // Add additional info if provided
  additionalInfo.forEach((info, index) => {
    doc.text(`${info.label}: ${info.value}`, 14, 37 + (index * 5));
  });
  
  // Setup columns
  const columns = ["Customer", ...productNames, "Total", "Amount"];
  
  // Setup rows
  const tableRows = rows.map(row => {
    const productValues = productNames.map(product => {
      if (row.quantities && row.quantities[product] !== undefined) {
        const qty = row.quantities[product];
        return typeof qty === 'number' ? qty.toString() : qty;
      }
      return "0";
    });
    
    const customerName = row.name || row.customerName || "Unknown";
    return [customerName, ...productValues, row.total.toString(), `₹${row.amount || 0}`];
  });
  
  // Add totals row
  const totalsRow = ["TOTAL"];
  
  // Calculate totals for each product
  productNames.forEach(product => {
    let total = 0;
    rows.forEach(row => {
      if (row.quantities && row.quantities[product] !== undefined) {
        const qty = row.quantities[product];
        if (typeof qty === 'number') {
          total += qty;
        }
      }
    });
    totalsRow.push(total.toString());
  });
  
  // Calculate grand total
  const grandTotal = rows.reduce((sum, row) => sum + (row.total || 0), 0);
  totalsRow.push(grandTotal.toString());
  
  // Calculate total amount
  const totalAmount = rows.reduce((sum, row) => sum + (row.amount || 0), 0);
  totalsRow.push(`₹${totalAmount}`);
  
  tableRows.push(totalsRow);
  
  // Create the table
  (doc as any).autoTable({
    head: [columns],
    body: tableRows,
    startY: 50,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [60, 60, 60] }
  });
  
  // Save the PDF
  doc.save(`track-sheet-${format(date, "yyyy-MM-dd")}.pdf`);
  
  return true;
};

const calculateTotalsOld = (data: TrackSheetRow[]) => {
  const totals: { [productId: string]: number } = {};
  data.forEach(row => {
    Object.keys(row.products).forEach(productId => {
      totals[productId] = (totals[productId] || 0) + row.products[productId];
    });
  });
  return totals;
};

const exportToExcel = (data: any, products: Product[], customers: Customer[]) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return false;
  }

  const productNames = products.map(p => p.name).join('\t');
  const header = `Customer\t${productNames}\tTotal\n`;

  const rows = data.map((row: TrackSheetRow) => {
    const customerName = customers.find(c => c.id === row.customerId)?.name || "Unknown";
    const productValues = products.map(p => row.products[p.id] || 0).join('\t');
    return `${customerName}\t${productValues}\t${row.total}`;
  }).join('\n');

  const totals = calculateTotalsOld(data);
  const totalValues = products.map(p => totals[p.id] || 0).join('\t');
  const grandTotal = data.reduce((sum, row) => sum + row.total, 0);
  const totalsRow = `TOTAL\t${totalValues}\t${grandTotal}\n`;

  const csvData = header + rows + '\n' + totalsRow;

  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `track-sheet-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
};

// Fix jsPDF typings issue
const exportToPdf = (data: any, products: Product[], customers: Customer[]) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(18);
  doc.text("Track Sheet", 14, 22);
  doc.setFontSize(11);
  doc.text(`Date: ${format(new Date(), "PPP")}`, 14, 32);
  
  // Setup columns
  const productNames = products.map(p => p.name);
  const columns = ["Customer", ...productNames, "Total"];
  
  // Setup rows
  const rows = data.map((row: TrackSheetRow) => {
    const customerName = customers.find(c => c.id === row.customerId)?.name || "Unknown";
    const productQuantities = products.map(p => row.products[p.id]?.toString() || "0");
    return [customerName, ...productQuantities, row.total.toString()];
  });
  
  // Add totals row
  const totals = ["TOTAL"];
  products.forEach(product => {
    const total = data.reduce((sum: number, row: TrackSheetRow) => 
      sum + (row.products[product.id] || 0), 0);
    totals.push(total.toString());
  });
  const grandTotal = data.reduce((sum: number, row: TrackSheetRow) => 
    sum + row.total, 0);
  totals.push(grandTotal.toString());
  
  rows.push(totals);
  
  // Create the table
  (doc as any).autoTable({
    head: [columns],
    body: rows,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [60, 60, 60] }
  });
  
  // Save the PDF
  doc.save("track-sheet.pdf");
  
  return true;
};

export { exportToExcel, exportToPdf };
