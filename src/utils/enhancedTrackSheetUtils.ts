
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Enhanced PDF generation with landscape support and better formatting
export const generateEnhancedTrackSheetPdf = (
  trackSheet: any, 
  productNames: string[], 
  customers: any[],
  options: {
    landscape?: boolean;
    fontSize?: number;
    includeHeader?: boolean;
    includeFooter?: boolean;
  } = {}
) => {
  const {
    landscape = true,
    fontSize = 10,
    includeHeader = true,
    includeFooter = true
  } = options;

  // Create PDF with optimized settings for landscape
  const doc = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = landscape ? 297 : 210;
  const pageHeight = landscape ? 210 : 297;

  if (includeHeader) {
    // Enhanced header with company branding
    doc.setFillColor(37, 99, 235); // Primary blue
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Company name with better typography
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Vikas Milk Centre', 14, 12);
    
    // Track sheet title
    doc.setFontSize(14);
    doc.text('Advanced Track Sheet', 14, 20);
    
    // Date and info section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let yPos = 35;
    const leftCol = 14;
    const rightCol = landscape ? 200 : 120;
    
    // Left column info
    doc.text(`Date: ${format(new Date(trackSheet.date), 'dd/MM/yyyy')}`, leftCol, yPos);
    doc.text(`Route: ${trackSheet.routeName || 'Not specified'}`, leftCol, yPos + 6);
    
    // Right column info
    if (trackSheet.vehicleName) {
      doc.text(`Vehicle: ${trackSheet.vehicleName}`, rightCol, yPos);
    }
    if (trackSheet.salesmanName) {
      doc.text(`Salesman: ${trackSheet.salesmanName}`, rightCol, yPos + 6);
    }
    
    yPos += 15;
  }

  // Calculate column widths dynamically
  const availableWidth = pageWidth - 28; // 14mm margins on each side
  const customerColWidth = Math.min(40, availableWidth * 0.25);
  const totalColWidth = 20;
  const amountColWidth = 25;
  const productColsAvailable = availableWidth - customerColWidth - totalColWidth - amountColWidth;
  const productColWidth = Math.max(15, productColsAvailable / productNames.length);

  // Prepare table headers with better formatting
  const tableHeaders = [
    'Customer',
    ...productNames.map(name => name.length > 8 ? name.substring(0, 8) + '...' : name),
    'Total',
    'Amount (₹)'
  ];

  // Prepare table data with better number formatting
  const tableData = trackSheet.rows.map((row: any) => [
    row.name || 'Unknown',
    ...productNames.map(product => {
      const qty = row.quantities[product];
      return qty && qty !== 0 ? String(qty) : '-';
    }),
    String(row.total || 0),
    `₹${(row.amount || 0).toFixed(2)}`
  ]);

  // Calculate totals
  const productTotals = productNames.map(product => {
    return trackSheet.rows.reduce((sum: number, row: any) => {
      const qty = row.quantities[product];
      return sum + (qty === '' || qty === undefined ? 0 : Number(qty));
    }, 0);
  });

  const grandTotal = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
  const grandAmount = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.amount || 0), 0);

  // Add totals row
  tableData.push([
    'TOTAL',
    ...productTotals.map(total => String(total)),
    String(grandTotal),
    `₹${grandAmount.toFixed(2)}`
  ]);

  // Generate optimized table
  (doc as any).autoTable({
    startY: includeHeader ? 55 : 20,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: fontSize,
      cellPadding: 3,
      valign: 'middle',
      halign: 'center',
      lineColor: [37, 99, 235],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: fontSize + 1,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: customerColWidth },
      [productNames.length + 1]: { halign: 'center', cellWidth: totalColWidth },
      [productNames.length + 2]: { halign: 'right', cellWidth: amountColWidth },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
    didDrawPage: function(data: any) {
      // Add page numbers if multiple pages
      if (includeFooter) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    }
  });

  // Add notes section if present
  if (trackSheet.notes && includeFooter) {
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    if (finalY < pageHeight - 40) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 14, finalY + 15);
      doc.setFont('helvetica', 'normal');
      
      // Split notes into multiple lines if needed
      const splitNotes = doc.splitTextToSize(trackSheet.notes, pageWidth - 28);
      doc.text(splitNotes, 14, finalY + 25);
    }
  }

  return doc;
};

// Enhanced CSV export with better formatting
export const exportEnhancedTrackSheetToCSV = (trackSheet: any, productNames: string[]): string => {
  // Create enhanced CSV with metadata
  const csvLines = [];
  
  // Add metadata header
  csvLines.push(`Track Sheet Export - ${trackSheet.name || 'Untitled'}`);
  csvLines.push(`Date: ${format(new Date(trackSheet.date), 'dd/MM/yyyy')}`);
  csvLines.push(`Vehicle: ${trackSheet.vehicleName || 'Not assigned'}`);
  csvLines.push(`Salesman: ${trackSheet.salesmanName || 'Not assigned'}`);
  csvLines.push(`Route: ${trackSheet.routeName || 'Not specified'}`);
  csvLines.push(''); // Empty line
  
  // Create data headers
  const headers = ['Customer', ...productNames, 'Total Quantity', 'Total Amount'];
  csvLines.push(headers.join(','));
  
  // Add data rows
  trackSheet.rows.forEach((row: any) => {
    const csvRow = [
      `"${row.name || 'Unknown'}"`,
      ...productNames.map(product => row.quantities[product] || 0),
      row.total || 0,
      (row.amount || 0).toFixed(2)
    ];
    csvLines.push(csvRow.join(','));
  });
  
  // Add totals row
  const productTotals = productNames.map(product => {
    return trackSheet.rows.reduce((sum: number, row: any) => {
      const qty = row.quantities[product];
      return sum + (qty === '' || qty === undefined ? 0 : Number(qty));
    }, 0);
  });
  
  const grandTotal = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
  const grandAmount = trackSheet.rows.reduce((sum: number, row: any) => sum + (row.amount || 0), 0);
  
  const totalsRow = [
    '"TOTAL"',
    ...productTotals,
    grandTotal,
    grandAmount.toFixed(2)
  ];
  csvLines.push(totalsRow.join(','));
  
  // Add notes if present
  if (trackSheet.notes) {
    csvLines.push('');
    csvLines.push(`"Notes: ${trackSheet.notes}"`);
  }
  
  return csvLines.join('\n');
};

// Enhanced download function
export const downloadEnhancedPdf = async (doc: jsPDF, filename: string): Promise<boolean> => {
  try {
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};

// Enhanced CSV download function
export const downloadEnhancedCSV = async (csvContent: string, filename: string): Promise<boolean> => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

// Print function with better formatting
export const printTrackSheet = (trackSheet: any, productNames: string[]): boolean => {
  try {
    const doc = generateEnhancedTrackSheetPdf(trackSheet, productNames, [], {
      landscape: true,
      fontSize: 9,
      includeHeader: true,
      includeFooter: true
    });
    
    // Open print dialog
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    
    return true;
  } catch (error) {
    console.error('Error printing track sheet:', error);
    return false;
  }
};
