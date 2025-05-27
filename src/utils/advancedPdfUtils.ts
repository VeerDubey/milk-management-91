
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateAdvancedTrackSheetPdf = (trackSheetData: any, productNames: string[], customers: any[] = []) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 297;
    const margin = 10;

    // Header with moody theme colors
    doc.setFillColor(90, 93, 255); // Slate Blue
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(225, 225, 230); // Cloud White
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Advanced Track Sheet', margin, 15);
    
    doc.setFontSize(12);
    doc.text(`Date: ${trackSheetData.date ? format(new Date(trackSheetData.date), 'dd/MM/yyyy') : 'N/A'}`, margin, 25);

    // Additional details
    if (trackSheetData.vehicleName) {
      doc.text(`Vehicle: ${trackSheetData.vehicleName}`, pageWidth - 80, 15);
    }
    if (trackSheetData.salesmanName) {
      doc.text(`Salesman: ${trackSheetData.salesmanName}`, pageWidth - 80, 25);
    }

    // Table data
    const headers = ['Customer', ...productNames, 'Total Qty', 'Total Amount'];
    const tableData = trackSheetData.rows?.map((row: any) => [
      row.name || 'Unknown',
      ...productNames.map(product => {
        const qty = row.quantities?.[product];
        return qty && qty !== 0 ? String(qty) : '-';
      }),
      String(row.total || 0),
      `₹${(row.amount || 0).toFixed(2)}`
    ]) || [];

    (doc as any).autoTable({
      startY: 35,
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [90, 93, 255], // Slate Blue
        textColor: [225, 225, 230], // Cloud White
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 245]
      },
      margin: { left: margin, right: margin }
    });

    return doc;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

export const secureDownloadPdf = (doc: jsPDF, filename: string) => {
  try {
    // Use save method for download
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

export const printAdvancedTrackSheet = (trackSheetData: any, productNames: string[]) => {
  try {
    const doc = generateAdvancedTrackSheetPdf(trackSheetData, productNames);
    
    // Create blob URL for printing
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open print dialog
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        // Clean up URL after printing
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      };
    }
    return true;
  } catch (error) {
    console.error('Print error:', error);
    return false;
  }
};

export const exportAdvancedTrackSheetToCSV = (trackSheetData: any, productNames: string[]) => {
  try {
    const headers = ['Customer', ...productNames, 'Total Qty', 'Total Amount'];
    const csvContent = [
      headers.join(','),
      ...(trackSheetData.rows?.map((row: any) => [
        `"${row.name || 'Unknown'}"`,
        ...productNames.map(product => {
          const qty = row.quantities?.[product];
          return qty && qty !== 0 ? String(qty) : '0';
        }),
        String(row.total || 0),
        (row.amount || 0).toFixed(2)
      ].join(',')) || [])
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = `track-sheet-${trackSheetData.date || 'export'}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('CSV export error:', error);
    return false;
  }
};
