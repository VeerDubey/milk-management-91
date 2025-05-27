
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

    // Header with vibrant gradient
    doc.setFillColor(63, 140, 255);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Advanced Track Sheet', margin, 15);
    
    doc.setFontSize(12);
    doc.text(`Date: ${trackSheetData.date ? format(new Date(trackSheetData.date), 'dd/MM/yyyy') : 'N/A'}`, margin, 25);

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
        fillColor: [63, 140, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
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
    const pdfOutput = doc.output('bloburl');
    const printWindow = window.open(pdfOutput);
    if (printWindow) {
      printWindow.print();
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

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `track-sheet-${trackSheetData.date || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('CSV export error:', error);
    return false;
  }
};

export const secureDownloadCSV = (csvContent: string, filename: string) => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('CSV download error:', error);
    return false;
  }
};
