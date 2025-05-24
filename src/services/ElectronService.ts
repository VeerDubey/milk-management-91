
import { WebFileService } from './WebFileService';

// Web-only service that mimics Electron API using browser capabilities
export class ElectronService {
  static isElectron(): boolean {
    return false; // Always false since we're web-only now
  }

  static async exportData(data: string, filename: string = 'backup.json') {
    return WebFileService.exportData(data, filename);
  }

  static async importData() {
    return WebFileService.importData();
  }

  static async downloadInvoice(data: string, filename: string) {
    return WebFileService.downloadInvoice(data, filename);
  }

  static async printInvoice(data: string) {
    return WebFileService.printInvoice(data);
  }

  static async saveLog(logData: string, filename: string) {
    return WebFileService.exportData(logData, filename);
  }

  static getVersion(): Promise<string> {
    return Promise.resolve('1.0.0-web');
  }

  static getPlatform(): string {
    return 'web';
  }

  static async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to copy to clipboard' };
    }
  }

  static async readFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      return { success: true, text };
    } catch (error) {
      return { success: false, error: 'Failed to read from clipboard', text: '' };
    }
  }

  static async openExternal(url: string) {
    try {
      window.open(url, '_blank');
      return true;
    } catch (error) {
      return false;
    }
  }
}
