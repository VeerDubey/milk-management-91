
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface DeliverySheetData {
  date: string;
  area: string;
  items: any[];
  totals: any;
}

export const downloadDeliverySheetPDF = (data: DeliverySheetData) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VIKAS MILK CENTRE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('SINCE 1975', 105, 30, { align: 'center' });
    
    // Date and Area
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Delivery Sheet - ${data.date}`, 20, 50);
    doc.text(`Area: ${data.area}`, 20, 60);
    
    // Table headers
    const headers = ['S.NO', 'CUSTOMER NAME', 'GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'F&L', 'QTY', 'AMOUNT'];
    
    // Table data
    const tableData = data.items.map((item, index) => [
      index + 1,
      item.customerName,
      item.GGH || '',
      item.GGH450 || '',
      item.GTSF || '',
      item.GSD1KG || '',
      item.GPC || '',
      item.FL || '',
      item.totalQty,
      `₹${item.amount.toFixed(2)}`
    ]);
    
    // Add totals row
    tableData.push([
      '',
      'TOTAL',
      data.totals.GGH,
      data.totals.GGH450,
      data.totals.GTSF,
      data.totals.GSD1KG,
      data.totals.GPC,
      data.totals.FL,
      data.totals.totalQty,
      `₹${data.totals.amount.toFixed(2)}`
    ]);
    
    // Generate table
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 15 },
        8: { halign: 'center', cellWidth: 15 },
        9: { halign: 'center', cellWidth: 20 }
      }
    });
    
    // Add signature section
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.line(20, finalY, 80, finalY);
    doc.line(120, finalY, 180, finalY);
    doc.text("Driver's Signature", 50, finalY + 10, { align: 'center' });
    doc.text("Supervisor's Signature", 150, finalY + 10, { align: 'center' });
    
    // Save the PDF
    doc.save(`delivery-sheet-${data.area}-${data.date}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const printDeliverySheet = (data: DeliverySheetData) => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery Sheet - ${data.area} - ${data.date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .customer-name { text-align: left !important; }
            .totals-row { background-color: #f9f9f9; font-weight: bold; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { text-align: center; }
            .signature-line { border-bottom: 2px solid #333; width: 200px; margin-bottom: 10px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VIKAS MILK CENTRE</h1>
            <p>SINCE 1975</p>
            <div class="info">
              <strong>Date: ${data.date} | Area: ${data.area}</strong>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>CUSTOMER NAME</th>
                <th>GGH</th>
                <th>GGH450</th>
                <th>GTSF</th>
                <th>GSD1KG</th>
                <th>GPC</th>
                <th>F&L</th>
                <th>QTY</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="customer-name">${item.customerName}</td>
                  <td>${item.GGH || ''}</td>
                  <td>${item.GGH450 || ''}</td>
                  <td>${item.GTSF || ''}</td>
                  <td>${item.GSD1KG || ''}</td>
                  <td>${item.GPC || ''}</td>
                  <td>${item.FL || ''}</td>
                  <td><strong>${item.totalQty}</strong></td>
                  <td><strong>₹${item.amount.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
              <tr class="totals-row">
                <td></td>
                <td class="customer-name"><strong>TOTAL</strong></td>
                <td><strong>${data.totals.GGH}</strong></td>
                <td><strong>${data.totals.GGH450}</strong></td>
                <td><strong>${data.totals.GTSF}</strong></td>
                <td><strong>${data.totals.GSD1KG}</strong></td>
                <td><strong>${data.totals.GPC}</strong></td>
                <td><strong>${data.totals.FL}</strong></td>
                <td><strong>${data.totals.totalQty}</strong></td>
                <td><strong>₹${data.totals.amount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div class="signatures">
            <div class="signature">
              <div class="signature-line"></div>
              <p>Driver's Signature</p>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <p>Supervisor's Signature</p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error printing delivery sheet:', error);
    throw new Error('Failed to print delivery sheet');
  }
};

export const exportToExcel = (data: DeliverySheetData) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const headers = ['S.NO', 'CUSTOMER NAME', 'GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'F&L', 'QTY', 'AMOUNT'];
    
    const excelData = [
      [`VIKAS MILK CENTRE - DELIVERY SHEET`],
      [`Date: ${data.date} | Area: ${data.area}`],
      [],
      headers,
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
      ]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },  // S.NO
      { wch: 25 }, // CUSTOMER NAME
      { wch: 8 },  // GGH
      { wch: 8 },  // GGH450
      { wch: 8 },  // GTSF
      { wch: 8 },  // GSD1KG
      { wch: 8 },  // GPC
      { wch: 8 },  // F&L
      { wch: 8 },  // QTY
      { wch: 12 }  // AMOUNT
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Sheet');
    XLSX.writeFile(workbook, `delivery-sheet-${data.area}-${data.date}.xlsx`);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};
