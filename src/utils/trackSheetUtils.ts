// Add necessary imports for calculations and PDF generation
import { TrackSheet, TrackSheetRow } from '@/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// Define types
export interface TrackSheetTemplate {
  id: string;
  name: string;
  rows: TrackSheetRow[];
  createdAt: string;
}

// Utility function to calculate totals
export const calculateTotals = (rows: TrackSheetRow[]) => {
  const totalQuantity = rows.reduce((sum, row) => sum + row.total, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return {
    totalQuantity,
    totalAmount
  };
};

// Utility function to calculate product totals
export const calculateProductTotals = (rows: TrackSheetRow[], products: string[]) => {
  // Initialize product totals object
  const productTotals: Record<string, number> = {};
  
  // Initialize all products with 0
  products.forEach(productName => {
    productTotals[productName] = 0;
  });
  
  // Sum up quantities for each product
  rows.forEach(row => {
    Object.entries(row.quantities).forEach(([productName, quantity]) => {
      if (products.includes(productName)) {
        const numQuantity = quantity === '' ? 0 : typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
        productTotals[productName] = (productTotals[productName] || 0) + (isNaN(numQuantity) ? 0 : numQuantity);
      }
    });
  });
  
  return productTotals;
};

// Function to generate a PDF from track sheet data
export const generateTrackSheetPdf = (trackSheet: TrackSheet, productNames: string[], customers: any[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Vikas Milk Centers - Track Sheet', 14, 22);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Date: ${format(new Date(trackSheet.date), 'yyyy-MM-dd')}`, 14, 32);
  
  // Add vehicle and salesman info if available
  let yPos = 36;
  if (trackSheet.vehicleName) {
    doc.text(`Vehicle: ${trackSheet.vehicleName}`, 14, yPos);
    yPos += 6;
  }
  if (trackSheet.salesmanName) {
    doc.text(`Salesman: ${trackSheet.salesmanName}`, 14, yPos);
    yPos += 6;
  }
  if (trackSheet.routeName) {
    doc.text(`Route: ${trackSheet.routeName}`, 14, yPos);
    yPos += 6;
  }
  
  // Prepare data for table
  const headers = ['Customer', ...productNames, 'Total', 'Amount'];
  const data = trackSheet.rows.map((row: any) => {
    const rowData = [row.name || 'Unknown'];
    productNames.forEach(product => {
      rowData.push(row.quantities[product] || '');
    });
    rowData.push(row.total || 0);
    rowData.push(row.amount || 0);
    return rowData;
  });
  
  // Calculate totals
  const totals = ['Total'];
  const productTotals = calculateProductTotals(trackSheet.rows, productNames);
  
  productNames.forEach(product => {
    totals.push(productTotals[product] || 0);
  });
  
  const totalQuantity = trackSheet.rows.reduce((sum, row) => sum + row.total, 0);
  const totalAmount = trackSheet.rows.reduce((sum, row) => sum + row.amount, 0);
  
  totals.push(totalQuantity);
  totals.push(totalAmount);
  
  // Add table with totals
  (doc as any).autoTable({
    head: [headers],
    body: [...data, totals],
    startY: yPos + 5,
    styles: {
      fontSize: 8
    },
    headStyles: {
      fillColor: [66, 139, 202]
    },
    foot: [totals],
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    }
  });
  
  // Save the PDF
  return doc;
};

// Export track sheet to Excel
export const exportTrackSheetToExcel = (trackSheet: TrackSheet, productNames: string[]) => {
  const headers = ['Customer', ...productNames, 'Total', 'Amount'];
  
  const data = [
    headers,
    ...trackSheet.rows.map(row => {
      const rowData = [row.name];
      productNames.forEach(product => {
        rowData.push(row.quantities[product] || '');
      });
      rowData.push(row.total);
      rowData.push(row.amount);
      return rowData;
    })
  ];
  
  // Calculate totals
  const totals = ['Total'];
  const productTotals = calculateProductTotals(trackSheet.rows, productNames);
  
  productNames.forEach(product => {
    totals.push(productTotals[product] || 0);
  });
  
  const totalQuantity = trackSheet.rows.reduce((sum, row) => sum + row.total, 0);
  const totalAmount = trackSheet.rows.reduce((sum, row) => sum + row.amount, 0);
  
  totals.push(totalQuantity);
  totals.push(totalAmount);
  
  // Add totals row
  data.push(totals);
  
  // Create workbook and worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Track Sheet');
  
  // Set column widths
  const colWidths = headers.map(() => ({ wch: 15 }));
  worksheet['!cols'] = colWidths;
  
  // Add some basic metadata
  workbook.Props = {
    Title: `Track Sheet - ${trackSheet.date}`,
    Subject: `Vehicle: ${trackSheet.vehicleName || 'N/A'}, Salesman: ${trackSheet.salesmanName || 'N/A'}`,
    Author: 'Vikas Milk Centers',
    CreatedDate: new Date()
  };
  
  return workbook;
};

// Function to create a template from track sheet data
export const createTrackSheetTemplate = (name: string, rows: TrackSheetRow[]) => {
  return {
    id: `template-${Date.now()}`,
    name,
    rows,
    createdAt: new Date().toISOString()
  };
};

// Function to create empty track sheet rows
export const createEmptyTrackSheetRows = (customers: any[], products: string[]) => {
  return customers.map(customer => ({
    name: customer.name,
    customerId: customer.id,
    quantities: products.reduce((acc, product) => {
      acc[product] = '';
      return acc;
    }, {} as Record<string, string | number>),
    total: 0,
    amount: 0,
    products // Add the products array to the row
  }));
};

// Function to calculate customer-specific rates for products
export const calculateCustomerRates = (rows: TrackSheetRow[], customerProductRates: any[]) => {
  return rows.map(row => {
    const updatedRow = { ...row };
    let amount = 0;
    
    Object.entries(row.quantities).forEach(([productName, quantity]) => {
      const numQty = Number(quantity) || 0;
      
      // Find customer-specific rate if available
      const customerRate = customerProductRates.find(
        rate => rate.customerId === row.customerId && rate.productId === productName
      );
      
      const rate = customerRate ? customerRate.rate : 0;
      amount += numQty * rate;
    });
    
    updatedRow.amount = amount;
    return updatedRow;
  });
};

// Other utility functions...

export const savePdf = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

export const saveExcel = (workbook: any, filename: string) => {
  XLSX.writeFile(workbook, filename);
};

export const getBlankRow = (products: string[]): TrackSheetRow => {
  return {
    name: '',
    customerId: '',
    quantities: products.reduce((acc, product) => {
      acc[product] = '';
      return acc;
    }, {} as Record<string, string | number>),
    total: 0,
    amount: 0,
    products // Add the products array to the row
  };
};

export const filterEmptyRows = (rows: TrackSheetRow[]): TrackSheetRow[] => {
  return rows.filter(row => {
    // Keep rows that have a customer name and at least one non-zero quantity
    return row.name && Object.values(row.quantities).some(q => q !== '' && q !== 0);
  });
};

// Function to generate a summary report
export const generateSummaryReport = (trackSheets: TrackSheet[], startDate: string, endDate: string) => {
  // Filter track sheets by date range
  const filteredSheets = trackSheets.filter(sheet => {
    const sheetDate = new Date(sheet.date);
    return sheetDate >= new Date(startDate) && sheetDate <= new Date(endDate);
  });
  
  // Extract all product names
  const allProductNames = new Set<string>();
  filteredSheets.forEach(sheet => {
    sheet.rows.forEach(row => {
      Object.keys(row.quantities).forEach(productName => {
        allProductNames.add(productName);
      });
    });
  });
  
  const productNames = Array.from(allProductNames);
  
  // Calculate totals for each product across all sheets
  const productTotals: Record<string, number> = {};
  productNames.forEach(product => {
    productTotals[product] = 0;
  });
  
  // Calculate totals by customer
  const customerTotals: Record<string, { quantity: number; amount: number; products: Record<string, number> }> = {};
  
  filteredSheets.forEach(sheet => {
    sheet.rows.forEach(row => {
      if (!row.name) return;
      
      if (!customerTotals[row.name]) {
        customerTotals[row.name] = {
          quantity: 0,
          amount: 0,
          products: productNames.reduce((acc, prod) => {
            acc[prod] = 0;
            return acc;
          }, {} as Record<string, number>)
        };
      }
      
      Object.entries(row.quantities).forEach(([productName, quantity]) => {
        const numQty = Number(quantity) || 0;
        if (numQty > 0) {
          productTotals[productName] = (productTotals[productName] || 0) + numQty;
          customerTotals[row.name].products[productName] += numQty;
          customerTotals[row.name].quantity += numQty;
        }
      });
      
      customerTotals[row.name].amount += row.amount;
    });
  });
  
  return {
    startDate,
    endDate,
    productNames,
    productTotals,
    customerTotals,
    totalTrackSheets: filteredSheets.length
  };
};
