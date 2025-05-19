
import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param columns - Column headers
 * @param data - Table data rows
 * @param filename - Output filename
 */
export function exportToExcel(
  columns: string[],
  data: any[][],
  filename: string = "export.xlsx"
): void {
  try {
    // Ensure filename has correct extension
    if (!filename.toLowerCase().endsWith('.xlsx')) {
      filename += '.xlsx';
    }
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // Apply custom styling for header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      // Apply bold formatting to header cells
      worksheet[cellAddress].s = { font: { bold: true } };
    }
    
    // Write to binary string
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    
    // Convert to Blob
    const blob = new Blob(
      [s2ab(wbout)], 
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    console.log(`Excel file "${filename}" exported successfully`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
}

/**
 * Export table element to Excel
 * @param tableId - DOM ID of the table element
 * @param filename - Output filename
 */
export function exportTableToExcel(tableId: string, filename: string = "export.xlsx"): void {
  try {
    // Ensure filename has correct extension
    if (!filename.toLowerCase().endsWith('.xlsx')) {
      filename += '.xlsx';
    }
    
    const table = document.getElementById(tableId);
    if (!table) {
      throw new Error(`Table with ID "${tableId}" not found`);
    }
    
    // Create workbook from table
    const workbook = XLSX.utils.table_to_book(table, { 
      sheet: "Sheet1",
      raw: false,
      dateNF: "yyyy-mm-dd"
    });
    
    // Write to binary string
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    
    // Create blob and trigger download
    const blob = new Blob(
      [s2ab(wbout)], 
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    console.log(`Table exported to Excel file "${filename}" successfully`);
  } catch (error) {
    console.error("Error exporting table to Excel:", error);
    throw error;
  }
}

/**
 * Convert data to Excel file and return as data URL
 * @param columns - Column headers
 * @param data - Table data rows
 * @param sheetName - Optional sheet name
 * @returns Data URL of Excel file
 */
export function dataToExcelDataUrl(
  columns: string[], 
  data: any[][], 
  sheetName: string = "Sheet1"
): string {
  try {
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Write to binary string
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    
    // Convert to ArrayBuffer
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }
    
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error converting data to Excel URL:", error);
    return '';
  }
}

/**
 * Export data directly to CSV file
 * @param columns - Column headers
 * @param data - Table data rows
 * @param filename - Output filename
 */
export function exportToCSV(
  columns: string[],
  data: any[][],
  filename: string = "export.csv"
): void {
  try {
    // Ensure filename has correct extension
    if (!filename.toLowerCase().endsWith('.csv')) {
      filename += '.csv';
    }
    
    // Create CSV content
    let csvContent = columns.join(',') + '\n';
    
    data.forEach(row => {
      // For each cell, wrap in quotes if needed and escape quotes inside
      const formattedRow = row.map((cell: any) => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvContent += formattedRow.join(',') + '\n';
    });
    
    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    console.log(`CSV file "${filename}" exported successfully`);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw error;
  }
}

/**
 * Export data to PDF (using xlsx to html and then converting to PDF)
 * Note: This is a basic implementation. For more advanced PDF exports,
 * you may want to use a dedicated PDF library like jspdf.
 * @param columns - Column headers
 * @param data - Table data rows
 * @param title - Title for the PDF
 * @param filename - Output filename
 */
export function exportToPDF(
  columns: string[],
  data: any[][],
  title: string = "Export Data",
  filename: string = "export.pdf"
): void {
  // This implementation would require jspdf and jspdf-autotable packages
  // For now, we'll just log a message
  console.warn("PDF export requires additional implementation with jspdf");
}

/**
 * Utility function to convert string to ArrayBuffer
 * @param s - String to convert
 * @returns ArrayBuffer
 */
function s2ab(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }
  return buf;
}
