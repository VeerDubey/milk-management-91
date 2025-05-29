
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface TrackSheetData {
  title: string;
  area: string;
  date: string;
  rows: Array<{
    name: string;
    quantities: Record<string, number>;
    totalQuantity: number;
    totalAmount: number;
  }>;
}

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateTrackSheetPDF = (data: TrackSheetData) => {
  try {
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    
    // Title
    doc.text(data.title.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // Area and Date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`AREA: ${data.area.toUpperCase()}`, 20, 35);
    doc.text(`DATE: ${data.date}`, 120, 35);
    
    // Draw line under header
    doc.line(20, 40, doc.internal.pageSize.getWidth() - 20, 40);
    
    // Prepare table data
    const productColumns = ['GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'F&L'];
    const headers = ['NAME', ...productColumns, 'QTY', 'AMOUNT'];
    
    const tableData = data.rows.map(row => {
      const rowData = [row.name || 'Unknown'];
      
      // Add product quantities
      productColumns.forEach(product => {
        const qty = row.quantities?.[product] || 0;
        rowData.push(qty > 0 ? qty.toString() : '');
      });
      
      // Add total quantity and amount
      rowData.push((row.totalQuantity || 0).toString());
      rowData.push(`₹${(row.totalAmount || 0).toFixed(2)}`);
      
      return rowData;
    });
    
    // Calculate totals
    const totals = ['TOTAL'];
    productColumns.forEach(product => {
      const total = data.rows.reduce((sum, row) => sum + (row.quantities?.[product] || 0), 0);
      totals.push(total > 0 ? total.toString() : '');
    });
    
    const totalQty = data.rows.reduce((sum, row) => sum + (row.totalQuantity || 0), 0);
    const totalAmount = data.rows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    totals.push(totalQty.toString());
    totals.push(`₹${totalAmount.toFixed(2)}`);
    
    tableData.push(totals);
    
    // Create table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 25 },
        1: { halign: 'center', cellWidth: 12 },
        2: { halign: 'center', cellWidth: 12 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 12 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'center', cellWidth: 15 },
        8: { halign: 'right', cellWidth: 20 },
      },
      didParseCell: (data: any) => {
        // Make totals row bold
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [230, 230, 230];
        }
      },
    });
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const downloadTrackSheetPDF = (data: TrackSheetData, filename: string) => {
  try {
    const doc = generateTrackSheetPDF(data);
    doc.save(filename);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
};
