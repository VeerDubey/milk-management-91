
interface ElectronAPI {
  // Data operations
  exportData: (data: string) => Promise<{ success: boolean; filePath?: string; message?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; data?: string; message?: string; error?: string }>;
  saveLog: (logData: string) => Promise<{ success: boolean; path?: string; error?: string }>;
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
    copyToClipboard: (text: string) => Promise<boolean>;
    readFromClipboard: () => Promise<string>;
    isPlatform: (platform: string) => Promise<boolean>;
  };
  
  // Database operations
  db?: {
    initialize: () => Promise<{ success: boolean; error?: string }>;
    save: (table: string, data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    query: (table: string, params?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    getById: (table: string, id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    delete: (table: string, id: string | string[]) => Promise<{ success: boolean; deleted?: number; error?: string }>;
    importTable: (table: string, data: any[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  };
}

declare interface Window {
  electron?: ElectronAPI;
}
