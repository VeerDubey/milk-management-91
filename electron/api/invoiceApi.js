
import { dialog, BrowserWindow, shell, app } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import electron from 'electron';
import log from 'electron-log';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Invoice API functions for Electron
 */
const invoiceApi = {
  /**
   * Download invoice as PDF
   * @param {Event} event - IPC event
   * @param {string} pdfDataUri - PDF data URI string
   * @param {string} filename - Suggested filename
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async downloadInvoice(event, pdfDataUri, filename) {
    try {
      if (!pdfDataUri) {
        throw new Error('Invalid PDF data');
      }

      // Extract base64 data from dataURI
      const base64Data = pdfDataUri.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid PDF data format');
      }

      // Default path for saving
      const documentsDir = app.getPath('documents');
      const defaultPath = path.join(documentsDir, filename || 'invoice.pdf');
      
      // Show save dialog
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Invoice',
        defaultPath,
        filters: [
          { name: 'PDF Documents', extensions: ['pdf'] }
        ]
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Save canceled' };
      }

      // Write file
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      log.info(`Invoice saved to: ${filePath}`);
      
      // Open the containing folder
      shell.showItemInFolder(filePath);
      
      return { success: true, filePath };
    } catch (error) {
      log.error('Error saving invoice:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Print invoice directly
   * @param {Event} event - IPC event
   * @param {string} pdfDataUri - PDF data URI string
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async printInvoice(event, pdfDataUri) {
    try {
      if (!pdfDataUri) {
        throw new Error('Invalid PDF data');
      }

      // Create a hidden browser window for printing
      const win = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      // Load the PDF data
      await win.loadURL(pdfDataUri);
      
      // Print the PDF
      try {
        await win.webContents.print({}, (success, errorType) => {
          win.close();
          if (!success) {
            log.error(`Print failed: ${errorType}`);
            return { success: false, error: `Print failed: ${errorType}` };
          }
        });
        
        return { success: true };
      } catch (printError) {
        win.close();
        throw printError;
      }
    } catch (error) {
      log.error('Error printing invoice:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get available printers
   * @returns {Promise<{success: boolean, printers: any[], error?: string}>}
   */
  async getPrinters() {
    try {
      const printerList = electron.webContents 
        ? electron.webContents.getAllWebContents()[0]?.getPrinters() 
        : [];
      
      return { 
        success: true, 
        printers: printerList || [] 
      };
    } catch (error) {
      log.error('Error getting printers:', error);
      return { success: false, printers: [], error: error.message };
    }
  }
};

export default invoiceApi;
