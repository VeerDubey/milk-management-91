
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface LoadSheetItem {
  productId: string;
  productName: string;
  brand: string;
  packSize: string;
  category: string;
  standingQuantity: number;
  todayQuantity: number;
  adjustedQuantity: number;
  finalQuantity: number;
  crateCount: number;
  remarks?: string;
}

interface LoadSheetData {
  date: string;
  route: string;
  agent: string;
  items: LoadSheetItem[];
  totalQuantity?: number;
  totalCrates?: number;
}

export const exportLoadSheetToPDF = (data: LoadSheetData) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VIKAS MILK CENTRE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('LOAD SHEET', 105, 30, { align: 'center' });
    
    // Load sheet details
    doc.setFontSize(10);
    doc.text(`Date: ${data.date}`, 20, 50);
    doc.text(`Route: ${data.route}`, 20, 60);
    doc.text(`Delivery Agent: ${data.agent}`, 20, 70);
    doc.text(`Total Items: ${data.items.length}`, 120, 50);
    doc.text(`Total Quantity: ${data.totalQuantity || 0}`, 120, 60);
    doc.text(`Total Crates: ${data.totalCrates || 0}`, 120, 70);
    
    // Group items by brand and category
    const groupedItems = data.items.reduce((acc, item) => {
      const key = `${item.brand} - ${item.category}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, LoadSheetItem[]>);

    let startY = 85;

    Object.entries(groupedItems).forEach(([groupName, items]) => {
      // Group header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(groupName, 20, startY);
      startY += 10;

      // Table for this group
      const tableData = items.map(item => [
        item.productName,
        item.packSize,
        item.standingQuantity.toString(),
        item.todayQuantity.toString(),
        item.adjustedQuantity > 0 ? `+${item.adjustedQuantity}` : item.adjustedQuantity.toString(),
        item.finalQuantity.toString(),
        item.crateCount.toString(),
        item.remarks || ''
      ]);

      const headers = ['Product', 'Pack Size', 'Standing', "Today's", 'Adjustment', 'Final Qty', 'Crates', 'Remarks'];

      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: startY,
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
          0: { cellWidth: 40 },
          1: { cellWidth: 20 },
          2: { cellWidth: 15 },
          3: { cellWidth: 15 },
          4: { cellWidth: 15 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 35 }
        }
      });

      startY = (doc as any).lastAutoTable.finalY + 15;
    });

    // Signature section
    const finalY = (doc as any).lastAutoTable?.finalY || startY;
    if (finalY < 250) {
      doc.line(20, finalY + 20, 80, finalY + 20);
      doc.line(120, finalY + 20, 180, finalY + 20);
      doc.text("Warehouse Manager", 50, finalY + 30, { align: 'center' });
      doc.text("Delivery Agent", 150, finalY + 30, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`load-sheet-${data.route}-${data.date}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const printLoadSheet = (data: LoadSheetData) => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Group items by brand and category
    const groupedItems = data.items.reduce((acc, item) => {
      const key = `${item.brand} - ${item.category}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, LoadSheetItem[]>);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Load Sheet - ${data.route} - ${data.date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header h2 { margin: 5px 0; font-size: 18px; color: #666; }
            .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-left, .info-right { flex: 1; }
            .group-header { 
              background-color: #f5f5f5; 
              padding: 8px; 
              margin: 20px 0 10px 0; 
              font-weight: bold; 
              border-left: 4px solid #2980b9;
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .product-name { text-align: left !important; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { text-align: center; width: 200px; }
            .signature-line { border-bottom: 2px solid #333; margin-bottom: 10px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VIKAS MILK CENTRE</h1>
            <h2>LOAD SHEET</h2>
          </div>
          
          <div class="info">
            <div class="info-left">
              <strong>Date:</strong> ${data.date}<br>
              <strong>Route:</strong> ${data.route}<br>
              <strong>Delivery Agent:</strong> ${data.agent}
            </div>
            <div class="info-right">
              <strong>Total Items:</strong> ${data.items.length}<br>
              <strong>Total Quantity:</strong> ${data.totalQuantity || 0}<br>
              <strong>Total Crates:</strong> ${data.totalCrates || 0}
            </div>
          </div>
          
          ${Object.entries(groupedItems).map(([groupName, items]) => `
            <div class="group-header">${groupName}</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Pack Size</th>
                  <th>Standing</th>
                  <th>Today's</th>
                  <th>Adjustment</th>
                  <th>Final Qty</th>
                  <th>Crates</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td class="product-name">${item.productName}</td>
                    <td>${item.packSize}</td>
                    <td>${item.standingQuantity}</td>
                    <td>${item.todayQuantity}</td>
                    <td style="color: ${item.adjustedQuantity > 0 ? 'green' : item.adjustedQuantity < 0 ? 'red' : 'black'}">
                      ${item.adjustedQuantity > 0 ? '+' : ''}${item.adjustedQuantity}
                    </td>
                    <td><strong>${item.finalQuantity}</strong></td>
                    <td>${item.crateCount}</td>
                    <td>${item.remarks || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `).join('')}
          
          <div class="signatures">
            <div class="signature">
              <div class="signature-line"></div>
              <p>Warehouse Manager</p>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <p>Delivery Agent</p>
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
    console.error('Error printing load sheet:', error);
    throw new Error('Failed to print load sheet');
  }
};

export const exportLoadSheetToExcel = (data: LoadSheetData) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = [
      [`VIKAS MILK CENTRE - LOAD SHEET`],
      [`Date: ${data.date} | Route: ${data.route} | Agent: ${data.agent}`],
      [],
      ['Product', 'Brand', 'Category', 'Pack Size', 'Standing Qty', "Today's Orders", 'Adjustment', 'Final Quantity', 'Crate Count', 'Remarks'],
      ...data.items.map(item => [
        item.productName,
        item.brand,
        item.category,
        item.packSize,
        item.standingQuantity,
        item.todayQuantity,
        item.adjustedQuantity,
        item.finalQuantity,
        item.crateCount,
        item.remarks || ''
      ]),
      [],
      ['SUMMARY'],
      ['Total Products', data.items.length],
      ['Total Quantity', data.totalQuantity || 0],
      ['Total Crates', data.totalCrates || 0]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Product
      { wch: 15 }, // Brand
      { wch: 15 }, // Category
      { wch: 12 }, // Pack Size
      { wch: 12 }, // Standing
      { wch: 12 }, // Today's
      { wch: 12 }, // Adjustment
      { wch: 12 }, // Final
      { wch: 10 }, // Crates
      { wch: 20 }  // Remarks
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Load Sheet');
    XLSX.writeFile(workbook, `load-sheet-${data.route}-${data.date}.xlsx`);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};
