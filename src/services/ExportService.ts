
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface ExportData {
  title: string;
  headers: string[];
  data: any[][];
  filename?: string;
}

export class ExportService {
  static exportToPDF(exportData: ExportData) {
    const doc = new jsPDF();
    const { title, headers, data, filename } = exportData;
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    // Add table
    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    // Save the PDF
    const finalFilename = filename || `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(finalFilename);
  }
  
  static exportToExcel(exportData: ExportData) {
    const { title, headers, data, filename } = exportData;
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Prepare data with headers
    const worksheetData = [headers, ...data];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const colWidths = headers.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    // Style headers
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "2980B9" } },
        alignment: { horizontal: "center" }
      };
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, title);
    
    // Save the file
    const finalFilename = filename || `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
    XLSX.writeFile(wb, finalFilename);
  }
  
  // Specific export functions for different data types
  static exportCustomers(customers: any[]) {
    const headers = ['Name', 'Phone', 'Area', 'Address', 'Outstanding Balance', 'Total Paid'];
    const data = customers.map(customer => [
      customer.name,
      customer.phone,
      customer.area,
      customer.address,
      `₹${customer.outstandingBalance?.toFixed(2) || '0.00'}`,
      `₹${customer.totalPaid?.toFixed(2) || '0.00'}`
    ]);
    
    return {
      title: 'Customer Report',
      headers,
      data
    };
  }
  
  static exportOrders(orders: any[], customers: any[], products: any[]) {
    const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total Amount', 'Status'];
    const data = orders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      const itemCount = order.items?.length || 0;
      
      return [
        order.id,
        format(new Date(order.date), 'dd/MM/yyyy'),
        customer?.name || 'Unknown',
        `${itemCount} items`,
        `₹${order.total?.toFixed(2) || '0.00'}`,
        order.status
      ];
    });
    
    return {
      title: 'Orders Report',
      headers,
      data
    };
  }
  
  static exportPayments(payments: any[], customers: any[]) {
    const headers = ['Date', 'Customer', 'Amount', 'Method', 'Notes'];
    const data = payments.map(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      
      return [
        format(new Date(payment.date), 'dd/MM/yyyy'),
        customer?.name || 'Unknown',
        `₹${payment.amount?.toFixed(2) || '0.00'}`,
        payment.method,
        payment.notes || ''
      ];
    });
    
    return {
      title: 'Payments Report',
      headers,
      data
    };
  }
  
  static exportSuppliers(suppliers: any[]) {
    const headers = ['Name', 'Phone', 'Address', 'Email', 'GST Number'];
    const data = suppliers.map(supplier => [
      supplier.name,
      supplier.phone,
      supplier.address,
      supplier.email || '',
      supplier.gstNumber || ''
    ]);
    
    return {
      title: 'Supplier Report',
      headers,
      data
    };
  }
}
