
import { dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

/**
 * File system operations API for the Electron app
 */
class FileSystemAPI {
  /**
   * Export data to a file
   * @param {Object} event - IPC event
   * @param {string} data - Data to export as string
   * @returns {Promise<Object>} Result with success status and file path
   */
  static async exportData(event, data) {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Data',
        defaultPath: `milk-center-backup-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['createDirectory']
      });
      
      if (!filePath) {
        return { success: false, message: 'Export cancelled' };
      }
      
      fs.writeFileSync(filePath, data);
      return { success: true, filePath };
    } catch (error) {
      console.error('Export data error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import data from a file
   * @param {Object} event - IPC event
   * @returns {Promise<Object>} Result with success status and data
   */
  static async importData(event) {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Data',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      });
      
      if (!filePaths || filePaths.length === 0) {
        return { success: false, message: 'Import cancelled' };
      }
      
      const data = fs.readFileSync(filePaths[0], 'utf8');
      return { success: true, data };
    } catch (error) {
      console.error('Import data error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save log to file
   * @param {Object} event - IPC event
   * @param {string} logData - Log data to save
   * @returns {Promise<Object>} Result with success status
   */
  static async saveLog(event, logData) {
    try {
      const logDir = path.join(app.getPath('userData'), 'logs');
      
      // Ensure logs directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logPath = path.join(logDir, `app-log-${timestamp}.txt`);
      
      fs.writeFileSync(logPath, logData);
      return { success: true, path: logPath };
    } catch (error) {
      console.error('Save log error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FileSystemAPI;
