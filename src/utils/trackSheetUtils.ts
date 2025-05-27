
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateTrackSheetPdf = (trackSheetData: any, productNames: string[], customers: any[] = []) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 297;
    const margin = 10;

    // Header with moody theme
    doc.setFillColor(90, 93, 255);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(225, 225, 230);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(trackSheetData.name || 'Track Sheet', margin, 15);
    
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(trackSheetData.date), 'dd/MM/yyyy')}`, margin, 25);
    
    if (trackSheetData.vehicleName) {
      doc.text(`Vehicle: ${trackSheetData.vehicleName}`, pageWidth - 80, 15);
    }
    if (trackSheetData.salesmanName) {
      doc.text(`Salesman: ${trackSheetData.salesmanName}`, pageWidth - 80, 20);
    }
    if (trackSheetData.routeName) {
      doc.text(`Route: ${trackSheetData.routeName}`, pageWidth - 80, 25);
    }

    // Create table data
    const headers = ['Customer', ...productNames, 'Total'];
    const tableData = trackSheetData.rows
      .filter((row: any) => row.total > 0)
      .map((row: any) => [
        row.name,
        ...productNames.map(name => row.quantities[name] || ''),
        row.total
      ]);

    // Add table
    (doc as any).autoTable({
      startY: 35,
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [90, 93, 255],
        textColor: [225, 225, 230]
      },
      margin: { left: margin, right: margin }
    });

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const savePdf = (doc: jsPDF, filename: string) => {
  try {
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error saving PDF:', error);
    return false;
  }
};

export const exportTrackSheetToCSV = (trackSheetData: any, productNames: string[]) => {
  try {
    const headers = ['Customer', ...productNames, 'Total'];
    const csvData = [
      headers.join(','),
      ...trackSheetData.rows
        .filter((row: any) => row.total > 0)
        .map((row: any) => [
          `"${row.name}"`,
          ...productNames.map(name => row.quantities[name] || '0'),
          row.total
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = `tracksheet-${trackSheetData.date}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
};

export const getBlankRow = (productNames: string[]) => {
  const quantities: Record<string, string | number> = {};
  productNames.forEach(name => {
    quantities[name] = '';
  });
  
  return {
    customerId: '',
    name: '',
    quantities,
    total: 0,
    amount: 0,
    products: productNames
  };
};
