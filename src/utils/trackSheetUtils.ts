import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Product, Customer } from '@/types';
import { PubSub } from 'pubsub-js';

export interface TrackSheetRow {
  customerId: string;
  customerName: string;
  products: {[productId: string]: number};
  total: number;
}

interface ExportData {
  date: string;
  rows: TrackSheetRow[];
  products: Product[];
  customers: Customer[];
}

const calculateTotals = (data: TrackSheetRow[]) => {
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

  const totals = calculateTotals(data);
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
