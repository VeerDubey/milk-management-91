
import { contextBridge, ipcRenderer } from 'electron';
import log from 'electron-log';

// Log initialization to help diagnose issues
log.info('Preload script initializing...');

// Use a more efficient way to expose methods
const API = {
  // Data import/export
  exportData: (data, filename) => {
    log.info('exportData called from renderer');
    return ipcRenderer.invoke('export-data', data, filename);
  },
  importData: () => {
    log.info('importData called from renderer'); 
    return ipcRenderer.invoke('import-data');
  },
  saveLog: (logData, filename) => {
    log.info('saveLog called from renderer');
    return ipcRenderer.invoke('save-log', logData, filename);
  },
  isElectron: true,
  
  // Event listeners for menu actions
  onMenuExportData: (callback) => {
    log.info('Registering menu-export-data handler');
    ipcRenderer.removeAllListeners('menu-export-data');
    ipcRenderer.on('menu-export-data', () => {
      log.info('Received menu-export-data event');
      callback();
    });
  },
  onMenuImportData: (callback) => {
    log.info('Registering menu-import-data handler');
    ipcRenderer.removeAllListeners('menu-import-data');
    ipcRenderer.on('menu-import-data', () => {
      log.info('Received menu-import-data event');
      callback();
    });
  },
  
  // App info
  appInfo: {
    getVersion: () => {
      log.info('Getting app version');
      return ipcRenderer.invoke('get-version');
    },
    getPlatform: () => process.platform,
    getSystemInfo: () => {
      log.info('Getting system info');
      return ipcRenderer.invoke('get-system-info');
    },
    getAppPaths: () => {
      log.info('Getting app paths');
      return ipcRenderer.invoke('get-app-paths');
    },
  },
  
  // Updates - offline mode
  updates: {
    checkForUpdates: () => {
      log.info('Checking for updates');
      return ipcRenderer.invoke('check-for-updates');
    },
    downloadUpdate: () => {
      log.info('Downloading update');
      return ipcRenderer.invoke('download-update');
    },
    installUpdate: () => {
      log.info('Installing update');
      return ipcRenderer.invoke('install-update');
    },
  },
  
  // System
  system: {
    openExternal: (url) => {
      log.info(`Opening external URL: ${url}`);
      return ipcRenderer.invoke('open-external', url);
    },
    openPath: (path) => {
      log.info(`Opening path: ${path}`);
      return ipcRenderer.invoke('open-path', path);
    },
    copyToClipboard: (text) => {
      log.info('Copying to clipboard');
      return ipcRenderer.invoke('copy-to-clipboard', text);
    },
    readFromClipboard: () => {
      log.info('Reading from clipboard');
      return ipcRenderer.invoke('read-from-clipboard');
    },
    isPlatform: (platform) => {
      return ipcRenderer.invoke('is-platform', platform);
    },
  },
  
  // Invoice operations
  downloadInvoice: (data, filename) => {
    log.info('downloadInvoice called from renderer');
    return ipcRenderer.invoke('download-invoice', data, filename);
  },
  printInvoice: (data) => {
    log.info('printInvoice called from renderer');
    return ipcRenderer.invoke('print-invoice', data);
  },
  getPrinters: () => {
    log.info('getPrinters called from renderer');
    return ipcRenderer.invoke('get-printers');
  }
};

// Expose protected methods in one single operation for better performance
try {
  log.info('Exposing Electron API to renderer process');
  contextBridge.exposeInMainWorld('electron', API);
  log.info('Electron API exposed successfully');
} catch (error) {
  log.error('Failed to expose Electron API:', error);
}
