
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

// Extend jsPDF type to include autoTable - corrected return type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateTrackSheetPDF = (data: TrackSheetData) => {
  try {
    console.log('Generating PDF with data:', data);
    
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    
    // Title
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(data.title.toUpperCase(), pageWidth / 2, 25, { align: 'center' });
    
    // Area and Date
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`AREA: ${data.area.toUpperCase()}`, 20, 45);
    doc.text(`DATE: ${data.date}`, pageWidth - 80, 45);
    
    // Draw line under header
    doc.line(20, 55, pageWidth - 20, 55);
    
    // Prepare table data - ensure we have data
    if (!data.rows || data.rows.length === 0) {
      doc.setFontSize(12);
      doc.text('No data available for this track sheet.', 20, 70);
      return doc;
    }

    // Get all unique product columns from the data
    const allProducts = new Set<string>();
    data.rows.forEach(row => {
      if (row.quantities) {
        Object.keys(row.quantities).forEach(product => {
          if (row.quantities[product] > 0) {
            allProducts.add(product);
          }
        });
      }
    });
    
    const productColumns = Array.from(allProducts);
    
    // If no products found, use default columns
    if (productColumns.length === 0) {
      productColumns.push('GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'F&L');
    }
    
    const headers = ['S.NO', 'NAME', ...productColumns, 'QTY', 'AMOUNT'];
    
    const tableData = data.rows.map((row, index) => {
      const rowData = [
        (index + 1).toString(),
        row.name || 'Unknown'
      ];
      
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
    const totals = ['', 'TOTAL'];
    productColumns.forEach(product => {
      const total = data.rows.reduce((sum, row) => sum + (row.quantities?.[product] || 0), 0);
      totals.push(total > 0 ? total.toString() : '');
    });
    
    const totalQty = data.rows.reduce((sum, row) => sum + (row.totalQuantity || 0), 0);
    const totalAmount = data.rows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    totals.push(totalQty.toString());
    totals.push(`₹${totalAmount.toFixed(2)}`);
    
    tableData.push(totals);
    
    // Calculate column widths dynamically
    const baseWidth = pageWidth - 40; // Total width minus margins
    const nameColWidth = 35;
    const snoColWidth = 15;
    const qtyColWidth = 15;
    const amountColWidth = 25;
    const productColWidth = Math.max(12, (baseWidth - nameColWidth - snoColWidth - qtyColWidth - amountColWidth) / productColumns.length);
    
    const columnStyles: any = {
      0: { halign: 'center', cellWidth: snoColWidth },
      1: { halign: 'left', cellWidth: nameColWidth }
    };
    
    // Add product column styles
    productColumns.forEach((_, index) => {
      columnStyles[index + 2] = { halign: 'center', cellWidth: productColWidth };
    });
    
    // Add quantity and amount column styles
    columnStyles[productColumns.length + 2] = { halign: 'center', cellWidth: qtyColWidth };
    columnStyles[productColumns.length + 3] = { halign: 'right', cellWidth: amountColWidth };
    
    // Create table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 65,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
      columnStyles: columnStyles,
      didParseCell: (data: any) => {
        // Make totals row bold
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [230, 230, 230];
          data.cell.styles.fontSize = 10;
        }
      },
      margin: { left: 20, right: 20 },
    });
    
    console.log('PDF generated successfully');
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + (error as Error).message);
  }
};

export const downloadTrackSheetPDF = (data: TrackSheetData, filename: string) => {
  try {
    console.log('Starting PDF download for:', filename);
    const doc = generateTrackSheetPDF(data);
    doc.save(filename);
    console.log('PDF download completed');
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF: ' + (error as Error).message);
  }
};

export const printTrackSheetPDF = (data: TrackSheetData) => {
  try {
    console.log('Starting PDF print');
    const doc = generateTrackSheetPDF(data);
    
    // Create blob and open in new window for printing
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        // Clean up the URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      };
    } else {
      // Fallback: download the PDF if popup is blocked
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `tracksheet-print-${new Date().getTime()}.pdf`;
      link.click();
      URL.revokeObjectURL(pdfUrl);
    }
    
    console.log('PDF print initiated');
  } catch (error) {
    console.error('Error printing PDF:', error);
    throw new Error('Failed to print PDF: ' + (error as Error).message);
  }
};
