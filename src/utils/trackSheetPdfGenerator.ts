
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

export const generateTrackSheetPDF = (data: TrackSheetData) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  
  // Title
  doc.text(data.title.toUpperCase(), 105, 20, { align: 'center' });
  
  // Area and Date
  doc.setFontSize(12);
  doc.text(`AREA : ${data.area.toUpperCase()}`, 20, 35);
  doc.text(`: ${data.area.toUpperCase()}`, 120, 35);
  
  // Draw line under header
  doc.line(20, 40, 190, 40);
  
  // Prepare table data
  const productColumns = ['GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'F&L'];
  const headers = ['NAME', ...productColumns, 'QTY', 'AMOUNT'];
  
  const tableData = data.rows.map(row => {
    const rowData = [row.name];
    
    // Add product quantities
    productColumns.forEach(product => {
      const qty = row.quantities[product] || 0;
      rowData.push(qty > 0 ? qty.toFixed(1) : '');
    });
    
    // Add total quantity and amount
    rowData.push(row.totalQuantity.toFixed(1));
    rowData.push(row.totalAmount.toFixed(2));
    
    return rowData;
  });
  
  // Calculate totals
  const totals = ['TOTAL'];
  productColumns.forEach(product => {
    const total = data.rows.reduce((sum, row) => sum + (row.quantities[product] || 0), 0);
    totals.push(total > 0 ? total.toFixed(1) : '');
  });
  
  const totalQty = data.rows.reduce((sum, row) => sum + row.totalQuantity, 0);
  const totalAmount = data.rows.reduce((sum, row) => sum + row.totalAmount, 0);
  totals.push(totalQty.toFixed(1));
  totals.push(totalAmount.toFixed(2));
  
  tableData.push(totals);
  
  // Create table
  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 45,
    styles: {
      fontSize: 10,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 30 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'center', cellWidth: 15 },
      8: { halign: 'center', cellWidth: 20 },
    },
    didParseCell: (data: any) => {
      // Make totals row bold
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  
  return doc;
};

export const downloadTrackSheetPDF = (data: TrackSheetData, filename: string) => {
  const doc = generateTrackSheetPDF(data);
  doc.save(filename);
};
