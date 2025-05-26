
import { ElectronService } from './ElectronService';
import { toast } from 'sonner';

export interface DownloadOptions {
  filename: string;
  data: string | Blob;
  mimeType?: string;
  showNotification?: boolean;
}

export class DownloadService {
  /**
   * Universal download function that works in both Electron and web environments
   */
  static async download(options: DownloadOptions): Promise<boolean> {
    const { filename, data, mimeType = 'application/octet-stream', showNotification = true } = options;
    
    try {
      // Try Electron first if available
      if (ElectronService.isElectron) {
        const dataString = typeof data === 'string' ? data : await this.blobToString(data);
        const result = await ElectronService.exportData(dataString, filename);
        
        if (result.success) {
          if (showNotification) toast.success(`${filename} downloaded successfully`);
          return true;
        }
      }
      
      // Fallback to browser download
      return this.browserDownload(options);
    } catch (error) {
      console.error('Download failed:', error);
      if (showNotification) toast.error('Download failed');
      return false;
    }
  }
  
  /**
   * Browser-based download using blob URLs
   */
  private static browserDownload(options: DownloadOptions): boolean {
    const { filename, data, mimeType, showNotification } = options;
    
    try {
      let blob: Blob;
      
      if (typeof data === 'string') {
        blob = new Blob([data], { type: mimeType });
      } else {
        blob = data;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (showNotification) toast.success(`${filename} downloaded successfully`);
      return true;
    } catch (error) {
      console.error('Browser download failed:', error);
      if (showNotification) toast.error('Download failed');
      return false;
    }
  }
  
  /**
   * Convert blob to string
   */
  private static async blobToString(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  }
  
  /**
   * Download JSON data
   */
  static async downloadJSON(data: any, filename: string): Promise<boolean> {
    const jsonString = JSON.stringify(data, null, 2);
    return this.download({
      filename: filename.endsWith('.json') ? filename : `${filename}.json`,
      data: jsonString,
      mimeType: 'application/json'
    });
  }
  
  /**
   * Download CSV data
   */
  static async downloadCSV(data: string, filename: string): Promise<boolean> {
    return this.download({
      filename: filename.endsWith('.csv') ? filename : `${filename}.csv`,
      data: data,
      mimeType: 'text/csv'
    });
  }
  
  /**
   * Download PDF data
   */
  static async downloadPDF(pdfDoc: any, filename: string): Promise<boolean> {
    const pdfOutput = pdfDoc.output('blob');
    return this.download({
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      data: pdfOutput,
      mimeType: 'application/pdf'
    });
  }
}
