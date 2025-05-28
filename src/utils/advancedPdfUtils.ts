
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateAdvancedTrackSheetPdf = (trackSheetData: any, productNames: string[], summary?: any) => {
  const doc = new jsPDF();
  (doc as any).autoTable = autoTable.bind(doc);
  
  // Header with modern design
  doc.setFillColor(147, 51, 234); // Purple
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ADVANCED TRACK SHEET', 20, 25);
  
  // Company info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Vikas Milk Centre', 20, 55);
  doc.text('Modern Dairy Management System', 20, 65);
  
  // Track sheet details
  doc.setFont('helvetica', 'bold');
  doc.text(`Track Sheet: ${trackSheetData.name}`, 140, 55);
  doc.text(`Date: ${format(new Date(trackSheetData.date), 'dd/MM/yyyy')}`, 140, 65);
  
  if (trackSheetData.vehicleName) {
    doc.text(`Vehicle: ${trackSheetData.vehicleName}`, 140, 75);
  }
  if (trackSheetData.salesmanName) {
    doc.text(`Salesman: ${trackSheetData.salesmanName}`, 140, 85);
  }
  if (trackSheetData.routeName) {
    doc.text(`Route: ${trackSheetData.routeName}`, 140, 95);
  }
  
  // Table headers
  const headers = ['Customer', ...productNames, 'Total Qty', 'Total Amount'];
  const data = trackSheetData.rows.map((row: any) => {
    const rowData = [row.name];
    
    // Add quantities for each product
    productNames.forEach(productName => {
      rowData.push((row.quantities[productName] || 0).toString());
    });
    
    rowData.push(row.total.toString());
    rowData.push(`₹${row.amount.toFixed(2)}`);
    
    return rowData;
  });
  
  // Generate table
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 110,
    theme: 'grid',
    headStyles: {
      fillColor: [147, 51, 234],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'left' } // Customer name left-aligned
    }
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  const grandTotal = trackSheetData.rows.reduce((sum: number, row: any) => sum + row.amount, 0);
  const totalQuantity = trackSheetData.rows.reduce((sum: number, row: any) => sum + row.total, 0);
  
  doc.setFillColor(6, 182, 212); // Cyan
  doc.rect(20, finalY, 170, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Orders: ${trackSheetData.rows.length}`, 25, finalY + 8);
  doc.text(`Total Quantity: ${totalQuantity}`, 75, finalY + 8);
  doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 135, finalY + 8);
  
  // Notes
  if (trackSheetData.notes) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Notes:', 20, finalY + 35);
    doc.text(trackSheetData.notes, 20, finalY + 45);
  }
  
  // Footer
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 20, 280);
  doc.text('Vikas Milk Centre - Advanced Management System', 140, 280);
  
  return doc;
};

export const secureDownloadPdf = (doc: jsPDF, filename: string): boolean => {
  try {
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('PDF download error:', error);
    return false;
  }
};

export const exportAdvancedTrackSheetToCSV = (trackSheetData: any, productNames: string[]): boolean => {
  try {
    const headers = ['Customer', ...productNames, 'Total Qty', 'Total Amount'];
    
    const csvContent = [
      `Track Sheet: ${trackSheetData.name}`,
      `Date: ${format(new Date(trackSheetData.date), 'dd/MM/yyyy')}`,
      `Vehicle: ${trackSheetData.vehicleName || 'N/A'}`,
      `Salesman: ${trackSheetData.salesmanName || 'N/A'}`,
      `Route: ${trackSheetData.routeName || 'N/A'}`,
      '',
      headers.join(','),
      ...trackSheetData.rows.map((row: any) => {
        const rowData = [row.name];
        productNames.forEach(productName => {
          rowData.push((row.quantities[productName] || 0).toString());
        });
        rowData.push(row.total.toString());
        rowData.push(row.amount.toFixed(2));
        return rowData.join(',');
      }),
      '',
      `Total Orders: ${trackSheetData.rows.length}`,
      `Total Quantity: ${trackSheetData.rows.reduce((sum: number, row: any) => sum + row.total, 0)}`,
      `Grand Total: ₹${trackSheetData.rows.reduce((sum: number, row: any) => sum + row.amount, 0).toFixed(2)}`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tracksheet-${format(new Date(trackSheetData.date), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('CSV export error:', error);
    return false;
  }
};

export const printAdvancedTrackSheet = (trackSheetData: any, productNames: string[]): boolean => {
  try {
    const doc = generateAdvancedTrackSheetPdf(trackSheetData, productNames);
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
    console.error('Print error:', error);
    return false;
  }
};
