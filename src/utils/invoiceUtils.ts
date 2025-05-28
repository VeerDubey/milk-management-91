
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `INV${year}${month}${timestamp}`;
};

export const generateInvoicePdf = (invoiceData: any) => {
  const doc = new jsPDF();
  (doc as any).autoTable = autoTable.bind(doc);
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(139, 92, 246);
  doc.text('INVOICE', 20, 30);
  
  // Company info (you can customize this)
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Vikas Milk Centre', 20, 45);
  doc.text('Your Address Here', 20, 55);
  doc.text('Phone: Your Phone Number', 20, 65);
  
  // Invoice details
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 140, 45);
  doc.text(`Date: ${format(new Date(invoiceData.date), 'dd/MM/yyyy')}`, 140, 55);
  doc.text(`Due Date: ${format(new Date(invoiceData.dueDate), 'dd/MM/yyyy')}`, 140, 65);
  
  // Customer info
  doc.text('Bill To:', 20, 85);
  doc.text(invoiceData.customer.name, 20, 95);
  if (invoiceData.customer.address) {
    doc.text(invoiceData.customer.address, 20, 105);
  }
  if (invoiceData.customer.phone) {
    doc.text(`Phone: ${invoiceData.customer.phone}`, 20, 115);
  }
  
  // Items table
  const headers = ['Description', 'Quantity', 'Unit Price', 'Amount'];
  const data = invoiceData.items.map((item: any) => [
    item.productName,
    item.quantity.toString(),
    `₹${item.unitPrice.toFixed(2)}`,
    `₹${(item.quantity * item.unitPrice).toFixed(2)}`
  ]);
  
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 130,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Subtotal: ₹${invoiceData.subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Total: ₹${invoiceData.total.toFixed(2)}`, 140, finalY + 10);
  
  // Notes
  if (invoiceData.notes) {
    doc.text('Notes:', 20, finalY + 20);
    doc.text(invoiceData.notes, 20, finalY + 30);
  }
  
  // Terms
  if (invoiceData.termsAndConditions) {
    doc.text('Terms & Conditions:', 20, finalY + 45);
    doc.text(invoiceData.termsAndConditions, 20, finalY + 55);
  }
  
  const filename = `invoice-${invoiceData.invoiceNumber}.pdf`;
  doc.save(filename);
};

export const printInvoice = (invoiceData: any) => {
  const doc = new jsPDF();
  (doc as any).autoTable = autoTable.bind(doc);
  
  // Generate the same PDF content as above
  generateInvoicePdf(invoiceData);
  
  // Print instead of download
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
