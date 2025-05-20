
import { dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

/**
 * API for handling invoice operations in the Electron app
 */
class InvoiceAPI {
  /**
   * Download an invoice as PDF
   * @param {Object} event - IPC event
   * @param {string} data - PDF data as base64 string
   * @param {string} filename - Default filename
   * @returns {Promise<Object>} Result with success status and file path
   */
  static async downloadInvoice(event, data, filename = 'invoice.pdf') {
    try {
      // Show save dialog
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Invoice',
        defaultPath: path.join(app.getPath('downloads'), filename),
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
        properties: ['createDirectory']
      });
      
      if (!filePath) {
        return { success: false, error: 'Download cancelled' };
      }
      
      // Convert base64 data to buffer and write to file
      const pdfData = data.split(';base64,').pop();
      fs.writeFileSync(filePath, Buffer.from(pdfData, 'base64'));
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Download invoice error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Print an invoice directly
   * @param {Object} event - IPC event
   * @param {Uint8Array} data - PDF data as binary array
   * @returns {Promise<Object>} Result with success status
   */
  static async printInvoice(event, data) {
    try {
      // Create a temporary file for printing
      const tempPath = path.join(app.getPath('temp'), `print-${Date.now()}.pdf`);
      
      // Handle base64 data if provided in that format
      if (typeof data === 'string' && data.includes('base64')) {
        const pdfData = data.split(';base64,').pop();
        fs.writeFileSync(tempPath, Buffer.from(pdfData, 'base64'));
      } else {
        fs.writeFileSync(tempPath, Buffer.from(data));
      }
      
      // Open the PDF file with the default PDF viewer
      const { shell } = require('electron');
      await shell.openPath(tempPath);
      
      return { success: true };
    } catch (error) {
      console.error('Print invoice error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get list of available printers
   * @param {Object} event - IPC event
   * @returns {Promise<Object>} Result with success status and printers list
   */
  static async getPrinters(event) {
    try {
      // In a real implementation, we would use webContents.getPrinters()
      // But this needs to be called from a renderer process, so we return a placeholder
      return { 
        success: true, 
        printers: [
          { name: 'System Default', isDefault: true },
          { name: 'PDF Writer', isDefault: false },
        ] 
      };
    } catch (error) {
      console.error('Get printers error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default InvoiceAPI;
