
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Enhanced PDF generation with better error handling and optimization
export const generateAdvancedTrackSheetPdf = (
  trackSheet: any,
  productNames: string[],
  customers: any[] = [],
  options: {
    landscape?: boolean;
    fontSize?: number;
    includeHeader?: boolean;
    includeFooter?: boolean;
    pageSize?: string;
  } = {}
): jsPDF => {
  try {
    const {
      landscape = true,
      fontSize = 9,
      includeHeader = true,
      includeFooter = true,
      pageSize = 'a4'
    } = options;

    // Create PDF with landscape orientation for better table display
    const doc = new jsPDF({
      orientation: landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: pageSize.toLowerCase(),
      compress: true
    });

    const pageWidth = landscape ? 297 : 210;
    const pageHeight = landscape ? 210 : 297;
    const margin = 15;

    let yPosition = margin;

    if (includeHeader) {
      // Company header with Aurora theme colors
      doc.setFillColor(63, 140, 255); // Primary blue
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      // White text on blue background
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Vikas Milk Centre', margin, 15);
      
      doc.setFontSize(14);
      doc.text('Advanced Track Sheet', margin, 25);
      
      yPosition = 40;
    }

    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Track sheet information
    const dateStr = trackSheet.date ? format(new Date(trackSheet.date), 'dd/MM/yyyy') : 'Not specified';
    doc.text(`Date: ${dateStr}`, margin, yPosition);
    yPosition += 6;

    if (trackSheet.vehicleName) {
      doc.text(`Vehicle: ${trackSheet.vehicleName}`, margin, yPosition);
      yPosition += 6;
    }

    if (trackSheet.salesmanName) {
      doc.text(`Salesman: ${trackSheet.salesmanName}`, margin, yPosition);
      yPosition += 6;
    }

    if (trackSheet.routeName) {
      doc.text(`Route: ${trackSheet.routeName}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 5;

    // Prepare table data
    const headers = ['Customer', ...productNames, 'Total Qty', 'Amount (₹)'];
    
    const tableData = (trackSheet.rows || []).map((row: any) => [
      row.name || 'Unknown Customer',
      ...productNames.map(product => {
        const qty = row.quantities && row.quantities[product];
        return qty !== undefined && qty !== '' ? String(qty) : '0';
      }),
      String(row.total || 0),
      `₹${(row.amount || 0).toFixed(2)}`
    ]);

    // Calculate totals
    const productTotals = productNames.map(product => {
      return (trackSheet.rows || []).reduce((sum: number, row: any) => {
        const qty = row.quantities && row.quantities[product];
        const numQty = qty !== undefined && qty !== '' ? Number(qty) : 0;
        return sum + (isNaN(numQty) ? 0 : numQty);
      }, 0);
    });

    const grandTotalQty = (trackSheet.rows || []).reduce((sum: number, row: any) => 
      sum + (row.total || 0), 0);
    const grandTotalAmount = (trackSheet.rows || []).reduce((sum: number, row: any) => 
      sum + (row.amount || 0), 0);

    // Add totals row
    tableData.push([
      'TOTAL',
      ...productTotals.map(total => String(total)),
      String(grandTotalQty),
      `₹${grandTotalAmount.toFixed(2)}`
    ]);

    // Generate table
    (doc as any).autoTable({
      startY: yPosition,
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: fontSize,
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
        fontSize: fontSize + 1,
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
        fillColor: [138, 99, 210], // Secondary color
        textColor: 255,
        fontStyle: 'bold'
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      didDrawPage: function(data: any) {
        if (includeFooter) {
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            `Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Page ${data.pageCount}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      }
    });

    // Add notes if present
    if (trackSheet.notes) {
      const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50;
      if (finalY < pageHeight - 30) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', margin, finalY + 10);
        doc.setFont('helvetica', 'normal');
        
        const splitNotes = doc.splitTextToSize(trackSheet.notes, pageWidth - (margin * 2));
        doc.text(splitNotes, margin, finalY + 17);
      }
    }

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced CSV export
export const exportAdvancedTrackSheetToCSV = (trackSheet: any, productNames: string[]): string => {
  try {
    const csvLines: string[] = [];
    
    // Metadata
    csvLines.push(`"Track Sheet","${trackSheet.name || 'Untitled'}"`);
    csvLines.push(`"Date","${trackSheet.date ? format(new Date(trackSheet.date), 'dd/MM/yyyy') : 'Not specified'}"`);
    csvLines.push(`"Vehicle","${trackSheet.vehicleName || 'Not assigned'}"`);
    csvLines.push(`"Salesman","${trackSheet.salesmanName || 'Not assigned'}"`);
    csvLines.push(`"Route","${trackSheet.routeName || 'Not specified'}"`);
    csvLines.push(''); // Empty line
    
    // Headers
    const headers = ['"Customer"', ...productNames.map(name => `"${name}"`), '"Total Qty"', '"Amount"'];
    csvLines.push(headers.join(','));
    
    // Data rows
    (trackSheet.rows || []).forEach((row: any) => {
      const csvRow = [
        `"${row.name || 'Unknown'}"`,
        ...productNames.map(product => {
          const qty = row.quantities && row.quantities[product];
          return qty !== undefined && qty !== '' ? String(qty) : '0';
        }),
        String(row.total || 0),
        (row.amount || 0).toFixed(2)
      ];
      csvLines.push(csvRow.join(','));
    });
    
    // Totals
    const productTotals = productNames.map(product => {
      return (trackSheet.rows || []).reduce((sum: number, row: any) => {
        const qty = row.quantities && row.quantities[product];
        const numQty = qty !== undefined && qty !== '' ? Number(qty) : 0;
        return sum + (isNaN(numQty) ? 0 : numQty);
      }, 0);
    });
    
    const grandTotalQty = (trackSheet.rows || []).reduce((sum: number, row: any) => 
      sum + (row.total || 0), 0);
    const grandTotalAmount = (trackSheet.rows || []).reduce((sum: number, row: any) => 
      sum + (row.amount || 0), 0);
    
    csvLines.push([
      '"TOTAL"',
      ...productTotals.map(total => String(total)),
      String(grandTotalQty),
      grandTotalAmount.toFixed(2)
    ].join(','));
    
    if (trackSheet.notes) {
      csvLines.push('');
      csvLines.push(`"Notes","${trackSheet.notes}"`);
    }
    
    return csvLines.join('\n');
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new Error(`Failed to generate CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Secure download function
export const secureDownloadPdf = async (doc: jsPDF, filename: string): Promise<boolean> => {
  try {
    // Validate filename
    const sanitizedFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
    
    doc.save(sanitizedFilename);
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};

// Secure CSV download
export const secureDownloadCSV = async (csvContent: string, filename: string): Promise<boolean> => {
  try {
    const sanitizedFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', sanitizedFilename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

// Enhanced print function
export const printAdvancedTrackSheet = (trackSheet: any, productNames: string[]): boolean => {
  try {
    const doc = generateAdvancedTrackSheetPdf(trackSheet, productNames, [], {
      landscape: true,
      fontSize: 8,
      includeHeader: true,
      includeFooter: true
    });
    
    doc.autoPrint();
    const pdfUrl = doc.output('bloburl');
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.focus();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error printing track sheet:', error);
    return false;
  }
};
