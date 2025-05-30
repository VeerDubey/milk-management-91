
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface DeliveryItem {
  customerName: string;
  GGH: number;
  GGH450: number;
  GTSF: number;
  GSD1KG: number;
  GPC: number;
  FL: number;
  totalQty: number;
  amount: number;
}

interface DeliverySheetData {
  date: string;
  area: string;
  items: DeliveryItem[];
  totals: {
    GGH: number;
    GGH450: number;
    GTSF: number;
    GSD1KG: number;
    GPC: number;
    FL: number;
    totalQty: number;
    amount: number;
  };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateDeliverySheetPDF = (data: DeliverySheetData) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('VIKAS MILK CENTRE', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('SINCE 1975', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
    
    // Date and Area
    doc.setFontSize(14);
    doc.text(`DATE: ${data.date}`, 20, 55);
    doc.text(`AREA: ${data.area}`, doc.internal.pageSize.getWidth() - 80, 55);
    
    // Table headers
    const headers = ['S.NO', 'CUSTOMER NAME', 'GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'F&L', 'QTY', 'AMOUNT'];
    
    // Table data
    const tableData = data.items.map((item, index) => [
      (index + 1).toString(),
      item.customerName,
      item.GGH > 0 ? item.GGH.toString() : '',
      item.GGH450 > 0 ? item.GGH450.toString() : '',
      item.GTSF > 0 ? item.GTSF.toString() : '',
      item.GSD1KG > 0 ? item.GSD1KG.toString() : '',
      item.GPC > 0 ? item.GPC.toString() : '',
      item.FL > 0 ? item.FL.toString() : '',
      item.totalQty.toString(),
      `₹${item.amount.toFixed(2)}`
    ]);
    
    // Add totals row
    tableData.push([
      '',
      'TOTAL',
      data.totals.GGH.toString(),
      data.totals.GGH450.toString(),
      data.totals.GTSF.toString(),
      data.totals.GSD1KG.toString(),
      data.totals.GPC.toString(),
      data.totals.FL.toString(),
      data.totals.totalQty.toString(),
      `₹${data.totals.amount.toFixed(2)}`
    ]);
    
    // Create table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 70,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 45 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 15 },
        8: { halign: 'center', cellWidth: 15 },
        9: { halign: 'right', cellWidth: 25 },
      },
      didParseCell: (data: any) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [230, 230, 230];
        }
      }
    });
    
    // Signature section
    const finalY = (doc as any).lastAutoTable.finalY + 40;
    doc.setFontSize(10);
    doc.text('Driver\'s Signature: ________________________', 20, finalY);
    doc.text('Supervisor\'s Signature: ________________________', 120, finalY);
    
    // Save PDF
    const filename = `delivery-sheet-${data.date.replace(/\//g, '-')}-${data.area}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const exportToExcel = (data: DeliverySheetData) => {
  try {
    // Prepare data for Excel
    const excelData = [
      ['VIKAS MILK CENTRE'],
      ['SINCE 1975'],
      [],
      [`DATE: ${data.date}`, '', '', '', '', '', '', '', `AREA: ${data.area}`],
      [],
      ['S.NO', 'CUSTOMER NAME', 'GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'F&L', 'QTY', 'AMOUNT'],
      ...data.items.map((item, index) => [
        index + 1,
        item.customerName,
        item.GGH || '',
        item.GGH450 || '',
        item.GTSF || '',
        item.GSD1KG || '',
        item.GPC || '',
        item.FL || '',
        item.totalQty,
        item.amount
      ]),
      [
        '',
        'TOTAL',
        data.totals.GGH,
        data.totals.GGH450,
        data.totals.GTSF,
        data.totals.GSD1KG,
        data.totals.GPC,
        data.totals.FL,
        data.totals.totalQty,
        data.totals.amount
      ],
      [],
      ['Driver\'s Signature: ________________________'],
      ['Supervisor\'s Signature: ________________________']
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery Sheet');
    
    // Save file
    const filename = `delivery-sheet-${data.date.replace(/\//g, '-')}-${data.area}.xlsx`;
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};
