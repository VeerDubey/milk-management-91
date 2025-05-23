
// ElectronService.ts - Fallback implementation for when Electron is not available

/**
 * This service provides a unified interface for Electron functionality,
 * with fallbacks for web-only mode.
 */
export const ElectronService = {
  // Feature detection
  isElectron: typeof window !== 'undefined' && 
    window.electron !== undefined,
  
  // File operations
  downloadInvoice: async (data: string, filename: string) => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.downloadInvoice(data, filename);
    }
    
    // Web fallback for downloading
    console.log('Electron not available: Creating download link in browser');
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  },
  
  printInvoice: async (data: string) => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.printInvoice(data);
    }
    
    // Web fallback for printing
    console.log('Electron not available: Opening print dialog in browser');
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = data;
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      try {
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print failed:', e);
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
    
    return { success: true };
  },
  
  getPrinters: async () => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.getPrinters();
    }
    
    // Web fallback
    console.log('Electron not available: Cannot get printers');
    return { success: false, printers: [] };
  },
  
  // Clipboard operations
  copyToClipboard: async (text: string) => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.system.copyToClipboard(text);
    }
    
    // Web fallback for clipboard
    console.log('Electron not available: Using browser clipboard API');
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (e) {
      console.error('Clipboard write failed:', e);
      return { success: false, error: 'Cannot access clipboard' };
    }
  },
  
  readFromClipboard: async () => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.system.readFromClipboard();
    }
    
    // Web fallback for clipboard
    console.log('Electron not available: Using browser clipboard API');
    try {
      const text = await navigator.clipboard.readText();
      return { success: true, text };
    } catch (e) {
      console.error('Clipboard read failed:', e);
      return { success: false, error: 'Cannot access clipboard', text: '' };
    }
  }
};

// Add TypeScript interface for the Electron API
declare global {
  interface Window {
    electron?: {
      isElectron: boolean;
      downloadInvoice: (data: string, filename: string) => Promise<{success: boolean, error?: string}>;
      printInvoice: (data: string) => Promise<{success: boolean, error?: string}>;
      getPrinters: () => Promise<{success: boolean, printers: any[]}>;
      system: {
        openExternal: (url: string) => Promise<boolean>;
        copyToClipboard: (text: string) => Promise<{success: boolean, error?: string}>;
        readFromClipboard: () => Promise<{success: boolean, error?: string, text: string}>;
        isPlatform: (platform: string) => Promise<boolean>;
      };
    };
  }
}
