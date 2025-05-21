
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TrackSheet, TrackSheetRow, Customer } from '@/types';

// Export track sheet to PDF
export function generateTrackSheetPdf(trackSheet: TrackSheet, productNames: string[], customers: Customer[]) {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text('Vikas Milk Centers & Manali Enterprises', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Distribution Track Sheet', doc.internal.pageSize.width / 2, 28, { align: 'center' });
  
  // Add metadata
  doc.setFontSize(10);
  doc.text(`Date: ${trackSheet.date}`, 14, 40);
  
  if (trackSheet.vehicleName) {
    doc.text(`Vehicle: ${trackSheet.vehicleName}`, 14, 46);
  }
  
  if (trackSheet.salesmanName) {
    doc.text(`Salesman: ${trackSheet.salesmanName}`, 14, 52);
  }
  
  if (trackSheet.routeName) {
    doc.text(`Route: ${trackSheet.routeName}`, 14, 58);
  }
  
  // Calculate product totals
  const productTotals = calculateProductTotals(trackSheet.rows, productNames);
  
  // Prepare table data
  const tableHeaders = ['Customer', ...productNames, 'Total', 'Amount'];
  const tableData = trackSheet.rows.map(row => {
    return [
      row.name,
      ...productNames.map(product => row.quantities[product] || ''),
      row.total,
      `₹${row.amount}`
    ];
  });
  
  // Add totals row
  const totalRow = [
    'Total',
    ...productNames.map(product => productTotals[product] || 0),
    trackSheet.rows.reduce((sum, row) => sum + row.total, 0),
    `₹${trackSheet.rows.reduce((sum, row) => sum + row.amount, 0)}`
  ];
  
  // Generate table
  autoTable(doc, {
    startY: 65,
    head: [tableHeaders],
    body: [...tableData, totalRow],
    foot: [],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
    footStyles: { fillColor: [240, 240, 240] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 65 }
  });
  
  // Add signature lines
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('Salesman\'s Signature', 25, finalY + 10);
  doc.line(20, finalY + 25, 90, finalY + 25);
  doc.text('Manager\'s Signature', doc.internal.pageSize.width - 25, finalY + 10, { align: 'right' });
  doc.line(doc.internal.pageSize.width - 90, finalY + 25, doc.internal.pageSize.width - 20, finalY + 25);
  
  return doc;
}

// Export track sheet to Excel
export function exportTrackSheetToExcel(trackSheet: TrackSheet, productNames: string[]) {
  // Calculate product totals
  const productTotals = calculateProductTotals(trackSheet.rows, productNames);
  
  // Prepare worksheet data
  const wsData = [
    ['Vikas Milk Centers & Manali Enterprises'],
    ['Distribution Track Sheet'],
    [],
    ['Date:', trackSheet.date],
  ];
  
  if (trackSheet.vehicleName) {
    wsData.push(['Vehicle:', trackSheet.vehicleName]);
  }
  
  if (trackSheet.salesmanName) {
    wsData.push(['Salesman:', trackSheet.salesmanName]);
  }
  
  if (trackSheet.routeName) {
    wsData.push(['Route:', trackSheet.routeName]);
  }
  
  wsData.push([]);
  
  // Add table headers
  wsData.push(['Customer', ...productNames, 'Total', 'Amount']);
  
  // Add table data
  trackSheet.rows.forEach(row => {
    wsData.push([
      row.name,
      ...productNames.map(product => row.quantities[product] || ''),
      row.total,
      row.amount
    ]);
  });
  
  // Add totals row
  wsData.push([
    'Total',
    ...productNames.map(product => productTotals[product] || 0),
    trackSheet.rows.reduce((sum, row) => sum + row.total, 0),
    trackSheet.rows.reduce((sum, row) => sum + row.amount, 0)
  ]);
  
  wsData.push([]);
  wsData.push(['Salesman\'s Signature', '', '', 'Manager\'s Signature']);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Apply some styling
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },  // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }   // Subtitle
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Track Sheet');
  
  return wb;
}

// Save PDF file
export function savePdf(doc: any, filename: string) {
  doc.save(filename);
}

// Save Excel file
export function saveExcel(workbook: any, filename: string) {
  XLSX.writeFile(workbook, filename);
}

// Helper function to calculate product totals
export function calculateProductTotals(rows: TrackSheetRow[], productNames: string[]) {
  const productTotals: Record<string, number> = {};
  
  if (!rows || !productNames) return productTotals;
  
  rows.forEach(row => {
    productNames.forEach(product => {
      const quantity = row.quantities[product];
      if (quantity) {
        const numericQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
        if (!isNaN(numericQuantity)) {
          productTotals[product] = (productTotals[product] || 0) + numericQuantity;
        }
      }
    });
  });
  
  return productTotals;
}

// Create a new track sheet template
export function createTrackSheetTemplate(name: string, rows: TrackSheetRow[]) {
  return {
    id: `tst${Date.now()}`,
    name,
    date: new Date().toISOString().split('T')[0],
    rows,
    savedAt: new Date().toISOString()
  };
}
