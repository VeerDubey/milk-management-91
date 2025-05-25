
import { ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import APIRegistry from './api/index.js';

class ApiManager {
  constructor() {
    this.apiRegistry = APIRegistry;
  }

  registerAPIs() {
    console.log('Registering API handlers...');
    
    // Register all APIs using the registry
    this.apiRegistry.registerAll(ipcMain);
    
    // Add any special case handlers here if needed
    ipcMain.handle('check-for-updates', async () => {
      if (isDev) return false;
      const updater = global.updater;
      if (!updater) return false;
      
      try {
        return await updater.checkForUpdates();
      } catch (err) {
        console.error('Failed to check for updates:', err);
        return false;
      }
    });

    ipcMain.handle('download-update', async () => {
      if (isDev) return false;
      const updater = global.updater;
      if (!updater) return false;
      
      try {
        return await updater.downloadUpdate();
      } catch (err) {
        console.error('Failed to download update:', err);
        return false;
      }
    });

    ipcMain.handle('install-update', async () => {
      if (isDev) return;
      const updater = global.updater;
      if (!updater) return;
      
      try {
        updater.quitAndInstall();
      } catch (err) {
        console.error('Failed to install update:', err);
      }
    });
    
    console.log('API handlers registered successfully');
  }
  
  registerAppPathsAPI(app) {
    // Add data directory API
    ipcMain.handle('get-app-paths', () => {
      return {
        userData: app.getPath('userData'),
        documents: app.getPath('documents'),
        downloads: app.getPath('downloads'),
        appData: app.getPath('appData')
      };
    });
  }
}

export default new ApiManager();
