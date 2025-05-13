
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
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // Write to file and trigger download
    XLSX.writeFile(workbook, filename);
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
    const table = document.getElementById(tableId);
    if (!table) {
      throw new Error(`Table with ID "${tableId}" not found`);
    }
    
    const workbook = XLSX.utils.table_to_book(table);
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error("Error exporting table to Excel:", error);
    throw error;
  }
}

/**
 * Convert data to Excel file and return as data URL
 * @param columns - Column headers
 * @param data - Table data rows
 * @returns Data URL of Excel file
 */
export function dataToExcelDataUrl(columns: string[], data: any[][]): string {
  try {
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // Write to binary string
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    
    // Convert to data URL
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }
    
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error converting data to Excel URL:", error);
    return '';
  }
}
