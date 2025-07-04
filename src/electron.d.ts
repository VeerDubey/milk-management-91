
interface ElectronAPI {
  // Data operations
  exportData: (data: string, filename: string) => Promise<{ success: boolean; filePath?: string; message?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; data?: string; message?: string; error?: string }>;
  saveLog: (logData: string, filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  isElectron: boolean;
  
  // Event listeners
  onMenuExportData: (callback: () => void) => void;
  onMenuImportData: (callback: () => void) => void;
  
  // App info
  appInfo: {
    getVersion: () => Promise<string>;
    getPlatform: () => string;
    getSystemInfo: () => Promise<{
      platform: string;
      osVersion: string;
      osName: string;
      architecture: string;
      cpuCores: number;
      totalMemory: number;
      freeMemory: number;
      nodeVersion: string;
      electronVersion: string;
      chromeVersion: string;
    }>;
    getAppPaths: () => Promise<{
      appData: string;
      userData: string;
      temp: string;
      exe: string;
      desktop: string;
      documents: string;
      downloads: string;
      logs: string;
    }>;
  };
  
  // Updates
  updates: {
    checkForUpdates: () => Promise<boolean>;
    downloadUpdate: () => Promise<boolean>;
    installUpdate: () => Promise<void>;
  };
  
  // System
  system: {
    openExternal: (url: string) => Promise<boolean>;
    openPath: (path: string) => Promise<boolean>;
    copyToClipboard: (text: string) => Promise<{success: boolean, error?: string}>;
    readFromClipboard: () => Promise<{success: boolean, error?: string, text: string}>;
    isPlatform: (platform: string) => Promise<boolean>;
  };

  // Invoice operations
  downloadInvoice: (data: string, filename: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  printInvoice: (data: string) => Promise<{ success: boolean; error?: string }>;
  getPrinters: () => Promise<{ success: boolean; printers: any[] }>;
}

declare interface Window {
  electron?: ElectronAPI;
}
