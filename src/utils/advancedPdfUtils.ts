
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateAdvancedTrackSheetPdf = (trackSheet: any, productNames: string[], summary: any[]) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Add autoTable method to doc
  (doc as any).autoTable = autoTable.bind(doc);
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(139, 92, 246);
  doc.text('Track Sheet Report', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${format(new Date(trackSheet.date), 'PPP')}`, 20, 30);
  doc.text(`Sheet: ${trackSheet.name || 'Delivery Track Sheet'}`, 20, 40);
  
  // Prepare table data
  const headers = ['Customer', ...productNames, 'Total Qty', 'Amount (₹)'];
  const data = trackSheet.rows.map((row: any) => {
    const customerName = row.customerName || 'Unknown Customer';
    const quantities = productNames.map(name => row.quantities?.[name] || 0);
    const totalQty = quantities.reduce((sum: number, qty: number) => sum + qty, 0);
    const amount = row.amount || 0;
    
    return [customerName, ...quantities, totalQty, amount.toFixed(2)];
  });
  
  // Generate table
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 50,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { top: 50, left: 20, right: 20 }
  });
  
  return doc;
};

export const secureDownloadPdf = (doc: jsPDF, filename: string): boolean => {
  try {
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};

export const printAdvancedTrackSheet = (trackSheet: any, productNames: string[]): boolean => {
  try {
    const doc = generateAdvancedTrackSheetPdf(trackSheet, productNames, []);
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error printing track sheet:', error);
    return false;
  }
};

export const exportAdvancedTrackSheetToCSV = (trackSheet: any, productNames: string[]): boolean => {
  try {
    const headers = ['Customer', ...productNames, 'Total Qty', 'Amount (₹)'];
    const csvRows = [headers.join(',')];
    
    trackSheet.rows.forEach((row: any) => {
      const customerName = row.customerName || 'Unknown Customer';
      const quantities = productNames.map(name => row.quantities?.[name] || 0);
      const totalQty = quantities.reduce((sum: number, qty: number) => sum + qty, 0);
      const amount = row.amount || 0;
      
      const rowData = [customerName, ...quantities, totalQty, amount.toFixed(2)];
      csvRows.push(rowData.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracksheet-${format(new Date(trackSheet.date), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
};
