
// Web-only file operations using browser APIs
export class WebFileService {
  static async exportData(data: string, filename: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: 'Failed to export data' };
    }
  }

  static async importData(): Promise<{ success: boolean; data?: string; message?: string; error?: string }> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: false, error: 'No file selected' });
          return;
        }
        
        try {
          const text = await file.text();
          resolve({ success: true, data: text, message: 'Data imported successfully' });
        } catch (error) {
          console.error('Import failed:', error);
          resolve({ success: false, error: 'Failed to read file' });
        }
      };
      
      input.click();
    });
  }

  static async downloadInvoice(data: string, filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download failed:', error);
      return { success: false, error: 'Failed to download invoice' };
    }
  }

  static async printInvoice(data: string): Promise<{ success: boolean; error?: string }> {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return { success: false, error: 'Could not open print window' };
      }
      
      printWindow.document.write(data);
      printWindow.document.close();
      printWindow.print();
      
      return { success: true };
    } catch (error) {
      console.error('Print failed:', error);
      return { success: false, error: 'Failed to print invoice' };
    }
  }
}
