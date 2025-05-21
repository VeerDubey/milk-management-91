
import { ipcMain, dialog, clipboard, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import API modules
import appInfo from './appInfo.js';
import fileSystem from './fileSystem.js';
import system from './system.js';
import invoiceApi from './invoiceApi.js';

/**
 * API Registry for centralizing all IPC handlers
 */
const APIRegistry = {
  /**
   * Registers all IPC handlers for the application
   * @param {Electron.IpcMain} ipcMain - The Electron IPC main instance
   */
  registerAll(ipcMain) {
    // Register app info APIs
    ipcMain.handle('get-version', () => appInfo.getVersion());
    ipcMain.handle('get-system-info', () => appInfo.getSystemInfo());
    
    // Register file system APIs
    ipcMain.handle('export-data', (event, data) => fileSystem.exportData(event, data));
    ipcMain.handle('import-data', () => fileSystem.importData());
    ipcMain.handle('save-log', (event, logData) => fileSystem.saveLog(event, logData));
    
    // Register system APIs
    ipcMain.handle('open-external', (event, url) => system.openExternal(event, url));
    ipcMain.handle('open-path', (event, path) => system.openPath(event, path));
    ipcMain.handle('copy-to-clipboard', (event, text) => system.copyToClipboard(event, text));
    ipcMain.handle('read-from-clipboard', () => system.readFromClipboard());
    ipcMain.handle('is-platform', (event, platform) => system.isPlatform(event, platform));
    
    // Register invoice APIs
    ipcMain.handle('download-invoice', (event, data, filename) => invoiceApi.downloadInvoice(event, data, filename));
    ipcMain.handle('print-invoice', (event, data) => invoiceApi.printInvoice(event, data));
    ipcMain.handle('get-printers', () => invoiceApi.getPrinters());
    
    console.log('All API handlers registered successfully');
  }
};

export default APIRegistry;
