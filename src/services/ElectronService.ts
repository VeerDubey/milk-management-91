
// ElectronService.ts - Unified interface for Electron functionality with web fallbacks

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
  
  // System operations
  system: {
    openExternal: async (url: string) => {
      if (typeof window !== 'undefined' && window.electron) {
        return await window.electron.system.openExternal(url);
      }
      
      // Web fallback
      console.log('Electron not available: Opening URL in new tab');
      window.open(url, '_blank');
      return true;
    },
    
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
    },
    
    isPlatform: async (platform: string) => {
      if (typeof window !== 'undefined' && window.electron) {
        return await window.electron.system.isPlatform(platform);
      }
      
      // Web fallback - detect browser platform
      const userAgent = navigator.userAgent.toLowerCase();
      if (platform === 'windows') return userAgent.includes('win');
      if (platform === 'mac') return userAgent.includes('mac');
      if (platform === 'linux') return userAgent.includes('linux');
      return false;
    }
  },
  
  // Data import/export operations
  exportData: async (data: string, filename: string) => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.exportData(data, filename);
    }
    
    // Web fallback for data export (same as download)
    console.log('Electron not available: Creating download link in browser for data export');
    const link = document.createElement('a');
    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  },
  
  importData: async () => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.importData();
    }
    
    // Web fallback for data import
    console.log('Electron not available: Using file input dialog for data import');
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      
      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          resolve({ success: false, error: 'No file selected' });
          document.body.removeChild(input);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = reader.result as string;
            resolve({ success: true, data });
          } catch (error) {
            resolve({ success: false, error: 'Failed to read file' });
          }
          document.body.removeChild(input);
        };
        
        reader.onerror = () => {
          resolve({ success: false, error: 'Failed to read file' });
          document.body.removeChild(input);
        };
        
        reader.readAsText(file);
      };
      
      document.body.appendChild(input);
      input.click();
    });
  },
  
  // Log saving operation
  saveLog: async (data: string, filename: string) => {
    if (typeof window !== 'undefined' && window.electron) {
      return await window.electron.saveLog(data, filename);
    }
    
    // Web fallback for log saving (same as download)
    console.log('Electron not available: Creating download link in browser for log saving');
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  }
};
