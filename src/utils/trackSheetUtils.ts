// Add necessary imports for calculations and PDF generation
import { TrackSheet, TrackSheetRow } from '@/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DownloadService } from '@/services/DownloadService';
import { format } from 'date-fns';

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
  try {
    // Use landscape orientation for better table display
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 297; // A4 landscape width
    const pageHeight = 210; // A4 landscape height
    const margin = 15;

    // Aurora theme header
    doc.setFillColor(63, 140, 255); // Primary blue
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Company branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Vikas Milk Centre', margin, 15);
    
    doc.setFontSize(16);
    doc.text('Track Sheet Report', margin, 28);
    
    // Track sheet details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    let yPos = 45;
    const dateStr = trackSheet.date ? format(new Date(trackSheet.date), 'dd/MM/yyyy') : 'Not specified';
    doc.text(`Date: ${dateStr}`, margin, yPos);
    
    if (trackSheet.vehicleName) {
      doc.text(`Vehicle: ${trackSheet.vehicleName}`, margin + 80, yPos);
    }
    
    yPos += 6;
    if (trackSheet.salesmanName) {
      doc.text(`Salesman: ${trackSheet.salesmanName}`, margin, yPos);
    }
    
    if (trackSheet.routeName) {
      doc.text(`Route: ${trackSheet.routeName}`, margin + 80, yPos);
    }
    
    yPos += 10;

    // Prepare table with proper data handling
    const headers = ['Customer', ...productNames, 'Total', 'Amount (₹)'];
    const tableData = (trackSheet.rows || []).map((row: any) => [
      row.name || 'Unknown',
      ...productNames.map(product => {
        const qty = row.quantities && row.quantities[product];
        return qty !== undefined && qty !== '' && qty !== 0 ? String(qty) : '-';
      }),
      String(row.total || 0),
      `₹${(row.amount || 0).toFixed(2)}`
    ]);

    // Calculate and add totals
    const productTotals = productNames.map(product => {
      return (trackSheet.rows || []).reduce((sum: number, row: any) => {
        const qty = row.quantities && row.quantities[product];
        const numQty = qty !== undefined && qty !== '' ? Number(qty) : 0;
        return sum + (isNaN(numQty) ? 0 : numQty);
      }, 0);
    });

    const grandTotal = (trackSheet.rows || []).reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const grandAmount = (trackSheet.rows || []).reduce((sum: number, row: any) => sum + (row.amount || 0), 0);

    tableData.push([
      'TOTAL',
      ...productTotals.map(total => String(total)),
      String(grandTotal),
      `₹${grandAmount.toFixed(2)}`
    ]);

    // Generate optimized table
    (doc as any).autoTable({
      startY: yPos,
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        halign: 'center',
        lineColor: [63, 140, 255],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [63, 140, 255],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 'auto' },
        [productNames.length + 1]: { halign: 'center' },
        [productNames.length + 2]: { halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      footStyles: {
        fillColor: [138, 99, 210],
        textColor: 255,
        fontStyle: 'bold'
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      didDrawPage: function(data: any) {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Page ${data.pageCount}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: 'right' }
        );
      }
    });

    // Notes section
    if (trackSheet.notes) {
      const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
      if (finalY < pageHeight - 25) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', margin, finalY + 8);
        doc.setFont('helvetica', 'normal');
        
        const splitNotes = doc.splitTextToSize(trackSheet.notes, pageWidth - (margin * 2));
        doc.text(splitNotes, margin, finalY + 15);
      }
    }

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate track sheet PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
  try {
    const sanitizedFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
    return DownloadService.downloadPDF(doc, sanitizedFilename);
  } catch (error) {
    console.error('Error saving PDF:', error);
    return false;
  }
};

export const exportTrackSheetToCSV = async (trackSheet: any, productNames: string[]): Promise<boolean> => {
  try {
    const csvLines: string[] = [];
    
    // Header information
    csvLines.push(`"Track Sheet Report"`);
    csvLines.push(`"Date","${trackSheet.date ? format(new Date(trackSheet.date), 'dd/MM/yyyy') : 'Not specified'}"`);
    csvLines.push(`"Vehicle","${trackSheet.vehicleName || 'Not assigned'}"`);
    csvLines.push(`"Salesman","${trackSheet.salesmanName || 'Not assigned'}"`);
    csvLines.push(`"Route","${trackSheet.routeName || 'Not specified'}"`);
    csvLines.push(''); // Empty line
    
    // Table headers
    const headers = ['"Customer"', ...productNames.map(name => `"${name}"`), '"Total"', '"Amount"'];
    csvLines.push(headers.join(','));
    
    // Data rows
    (trackSheet.rows || []).forEach((row: any) => {
      const csvRow = [
        `"${row.name || 'Unknown'}"`,
        ...productNames.map(product => {
          const qty = row.quantities && row.quantities[product];
          return qty !== undefined && qty !== '' && qty !== 0 ? String(qty) : '0';
        }),
        String(row.total || 0),
        (row.amount || 0).toFixed(2)
      ];
      csvLines.push(csvRow.join(','));
    });
    
    // Totals row
    const productTotals = productNames.map(product => {
      return (trackSheet.rows || []).reduce((sum: number, row: any) => {
        const qty = row.quantities && row.quantities[product];
        const numQty = qty !== undefined && qty !== '' ? Number(qty) : 0;
        return sum + (isNaN(numQty) ? 0 : numQty);
      }, 0);
    });
    
    const grandTotal = (trackSheet.rows || []).reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const grandAmount = (trackSheet.rows || []).reduce((sum: number, row: any) => sum + (row.amount || 0), 0);
    
    csvLines.push([
      '"TOTAL"',
      ...productTotals.map(total => String(total)),
      String(grandTotal),
      grandAmount.toFixed(2)
    ].join(','));
    
    // Notes
    if (trackSheet.notes) {
      csvLines.push('');
      csvLines.push(`"Notes","${trackSheet.notes}"`);
    }
    
    const csvContent = csvLines.join('\n');
    const filename = `tracksheet-${trackSheet.date || 'export'}.csv`;
    
    return DownloadService.downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
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
