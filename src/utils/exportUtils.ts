
import * as XLSX from 'xlsx';
import { exportToPdf } from './pdfUtils';
import { format } from 'date-fns';

// Export data to Excel
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export',
  sheetName: string = 'Sheet1'
) => {
  try {
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

// Export supplier payments to Excel
export const exportSupplierPaymentsToExcel = (payments: any[], suppliers: any[]) => {
  // Format data for export
  const exportData = payments.map(payment => {
    const supplier = suppliers.find(s => s.id === payment.supplierId);
    
    return {
      'Date': payment.date,
      'Supplier': supplier?.name || 'Unknown',
      'Amount': payment.amount.toFixed(2),
      'Payment Method': payment.paymentMethod,
      'Reference Number': payment.referenceNumber || '-',
      'Notes': payment.notes || '-'
    };
  });
  
  // Export to Excel
  return exportToExcel(
    exportData,
    `supplier-payments-${format(new Date(), 'yyyy-MM-dd')}`
  );
};

// Export supplier payments to PDF
export const exportSupplierPaymentsToPdf = (payments: any[], suppliers: any[]) => {
  // Format data for export
  const headers = ['Date', 'Supplier', 'Amount', 'Payment Method', 'Reference', 'Notes'];
  
  const rows = payments.map(payment => {
    const supplier = suppliers.find(s => s.id === payment.supplierId);
    
    return [
      payment.date,
      supplier?.name || 'Unknown',
      `₹${payment.amount.toFixed(2)}`,
      payment.paymentMethod,
      payment.referenceNumber || '-',
      payment.notes || '-'
    ];
  });
  
  // Export to PDF
  return exportToPdf(headers, rows, {
    title: 'Supplier Payments',
    subtitle: `Generated on ${format(new Date(), 'PPP')}`,
    filename: `supplier-payments-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
  });
};
