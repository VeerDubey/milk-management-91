
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { TrackSheetRow, TrackSheet, Customer, Product } from '@/types';

export interface TrackSheetFilter {
  date?: Date;
  vehicleId?: string;
  salesmanId?: string;
  routeName?: string;
}

// Create an empty track sheet template with sample customers
export const createEmptyTrackSheetRows = (
  productNames: string[],
  customerNames: string[] = []
): TrackSheetRow[] => {
  // Use provided customer names or defaults
  const sampleCustomers = customerNames.length > 0 ? 
    customerNames : 
    ['Customer 1', 'Customer 2', 'Customer 3', 'Customer 4', 'Customer 5'];

  return sampleCustomers.map(name => {
    const quantities: Record<string, number | string> = {};
    
    productNames.forEach(product => {
      quantities[product] = '';
    });

    return {
      name,
      quantities,
      total: 0,
      amount: 0
    };
  });
};

// Create a track sheet template with random data
export const createTrackSheetTemplate = (
  productNames: string[],
  date: Date,
  routeName: string,
  customers: Customer[] = []
): TrackSheetRow[] => {
  // Use actual customers if provided, otherwise use sample names
  const sampleCustomers = customers.length > 0 ? 
    customers.map(c => c.name) :
    [
      'Delhi Dairy',
      'Golden Milk Supply',
      'Sunrise Foods',
      'Sweet Treats Bakery',
      'Mountain View Cafe',
      'Green Valley Store',
      'Fresh Basket Market',
      'Family Restaurant',
      'City Hospital Canteen',
      'Sunlight Hotel'
    ];

  return sampleCustomers.map(name => {
    const quantities: Record<string, number | string> = {};
    let total = 0;
    
    productNames.forEach(product => {
      // Generate random quantity between 0 and 10, with some empty values
      const quantity = Math.random() > 0.2 ? Math.floor(Math.random() * 10) : 0;
      quantities[product] = quantity;
      total += quantity;
    });
    
    // Generate a random amount
    const amount = total * (Math.floor(Math.random() * 30) + 40);

    return {
      name,
      quantities,
      total,
      amount,
      customerId: customers.find(c => c.name === name)?.id
    };
  });
};

// Generate PDF for track sheet
export const generateTrackSheetPdf = (
  title: string,
  date: Date,
  rows: TrackSheetRow[],
  productNames: string[],
  additionalInfo?: Array<{label: string; value: string}>,
  companyName?: string,
  logo?: string
) => {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add company name if provided
  if (companyName) {
    doc.setFontSize(20);
    doc.text(companyName, 14, 15);
    doc.setFontSize(16);
    doc.text(title, 14, 25);
  } else {
    // Add title without company name
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }
  
  // If logo is provided, add it
  if (logo) {
    try {
      doc.addImage(logo, 'JPEG', 180, 10, 20, 20);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add date
  let yPos = companyName ? 35 : 25;
  doc.setFontSize(10);
  doc.text(`Date: ${format(date, 'dd/MM/yyyy')}`, 14, yPos);
  
  // Add additional info if provided
  if (additionalInfo && additionalInfo.length > 0) {
    yPos += 5;
    additionalInfo.forEach(info => {
      doc.text(`${info.label}: ${info.value}`, 14, yPos);
      yPos += 5;
    });
  }

  // Prepare table data
  const tableColumn = ['Customer'];
  productNames.forEach(product => {
    tableColumn.push(product);
  });
  tableColumn.push('Total', 'Amount');
  
  const tableRows = rows.map(row => {
    const rowData = [row.name];
    
    productNames.forEach(product => {
      const qty = row.quantities[product];
      rowData.push(qty === '' || qty === 0 ? '-' : qty.toString());
    });
    
    rowData.push(row.total.toString());
    rowData.push(`₹${row.amount}`);
    
    return rowData;
  });
  
  // Add totals row
  const totals = ['TOTAL'];
  
  productNames.forEach(product => {
    const total = rows.reduce(
      (sum, row) => {
        const qty = row.quantities[product];
        return sum + (typeof qty === 'number' ? qty : 0);
      },
      0
    );
    totals.push(total.toString());
  });
  
  const grandTotalQty = rows.reduce((sum, row) => sum + row.total, 0);
  const grandTotalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  
  totals.push(grandTotalQty.toString());
  totals.push(`₹${grandTotalAmount}`);
  
  tableRows.push(totals);

  // Create table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPos + 5,
    theme: 'grid',
    styles: {
      fontSize: 9
    },
    headStyles: {
      fillColor: [75, 75, 75]
    },
    footStyles: {
      fillColor: [200, 200, 200]
    }
  });
  
  // Add footer with date and page number
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')} - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 10, 
      { align: 'center' }
    );
  }

  // Save the PDF
  return doc.save(`track-sheet-${format(date, 'yyyy-MM-dd')}.pdf`);
};

// Function to calculate product-wise totals
export const calculateProductTotals = (
  rows: TrackSheetRow[],
  productNames: string[]
): Record<string, number> => {
  const totals: Record<string, number> = {};
  
  productNames.forEach(product => {
    const total = rows.reduce(
      (sum, row) => {
        const qty = row.quantities[product];
        return sum + (typeof qty === 'number' ? qty : 0);
      }, 
      0
    );
    totals[product] = total;
  });
  
  return totals;
};

// Function to calculate total amounts and quantities
export const calculateTotals = (rows: TrackSheetRow[]) => {
  const totalQuantity = rows.reduce((sum, row) => sum + row.total, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  
  return {
    totalQuantity,
    totalAmount
  };
};

// Convert orders to track sheet rows
export const ordersToTrackSheetRows = (
  orders: any[], // Using any since we don't know the exact structure
  customers: Customer[],
  products: Product[],
  date: string
): TrackSheetRow[] => {
  // Filter orders for the specific date
  const dateOrders = orders.filter(order => order.date === date);
  
  // Group orders by customer
  const customerMap: Record<string, { items: any[], total: number, amount: number }> = {};
  
  dateOrders.forEach(order => {
    if (!customerMap[order.customerId]) {
      customerMap[order.customerId] = {
        items: [],
        total: 0,
        amount: 0
      };
    }
    
    order.items.forEach((item: any) => {
      customerMap[order.customerId].items.push(item);
      customerMap[order.customerId].total += item.quantity;
      customerMap[order.customerId].amount += item.quantity * item.unitPrice;
    });
  });
  
  // Convert to track sheet rows
  const rows: TrackSheetRow[] = [];
  
  Object.entries(customerMap).forEach(([customerId, data]) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const quantities: Record<string, number | string> = {};
    
    // Set all product quantities to 0 initially
    products.forEach(product => {
      quantities[product.name] = 0;
    });
    
    // Update quantities from order items
    data.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        // Add to existing quantity for this product
        const currentQty = quantities[product.name];
        quantities[product.name] = (typeof currentQty === 'number' ? currentQty : 0) + item.quantity;
      }
    });
    
    rows.push({
      name: customer.name,
      customerId,
      quantities,
      total: data.total,
      amount: data.amount
    });
  });
  
  return rows;
};

// Export track sheet data to CSV
export const exportToCSV = (
  rows: TrackSheetRow[], 
  productNames: string[], 
  filename: string
) => {
  // Create header row
  const headers = ['Customer', ...productNames, 'Total', 'Amount'];
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = rows.map(row => {
    const values = [row.name];
    
    productNames.forEach(product => {
      const qty = row.quantities[product];
      values.push(qty === '' ? '' : qty.toString());
    });
    
    values.push(row.total.toString());
    values.push(row.amount.toString());
    
    return values.join(',');
  });
  
  // Add totals row
  const totalRow = ['TOTAL'];
  
  productNames.forEach(product => {
    const total = rows.reduce(
      (sum, row) => {
        const qty = row.quantities[product];
        return sum + (typeof qty === 'number' ? qty : 0);
      },
      0
    );
    totalRow.push(total.toString());
  });
  
  const grandTotalQty = rows.reduce((sum, row) => sum + row.total, 0);
  const grandTotalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  
  totalRow.push(grandTotalQty.toString());
  totalRow.push(grandTotalAmount.toString());
  
  dataRows.push(totalRow.join(','));
  
  // Combine all rows
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
