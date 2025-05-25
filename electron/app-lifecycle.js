
import { app, BrowserWindow, dialog } from 'electron';
import windowManager from './window-manager.js';
import apiManager from './api-manager.js';
import MenuBuilder from './menuBuilder.js';
import AppUpdater from './updater.js';
import isDev from 'electron-is-dev';

// Platform detection
const isMac = process.platform === 'darwin';

class AppLifecycle {
  constructor() {
    this.mainWindow = null;
  }
  
  async initialize() {
    console.log('Application ready, initializing...');
    
    try {
      // Register all IPC handlers
      apiManager.registerAPIs();
      apiManager.registerAppPathsAPI(app);
      
      // Create the main window
      this.mainWindow = windowManager.createWindow();
      
      // Initialize menu
      MenuBuilder.buildMenu(this.mainWindow);
      
      // Initialize updater in production
      if (!isDev) {
        new AppUpdater(this.mainWindow);
      }
      
      // Set up event handlers
      this.setupEventHandlers();
      
      console.log('Application initialization complete');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      dialog.showErrorBox('Application Error', `Failed to initialize application: ${error.message}`);
      app.quit();
    }
  }
  
  setupEventHandlers() {
    // On macOS, recreate window when dock icon is clicked and no windows are open
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.mainWindow = windowManager.createWindow();
        MenuBuilder.buildMenu(this.mainWindow);
      }
    });
    
    // Quit when all windows are closed, except on macOS where it's common
    // for applications to stay open until explicitly quit with Cmd + Q
    app.on('window-all-closed', () => {
      if (!isMac) {
        app.quit();
      }
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      dialog.showErrorBox('Application Error', `An unexpected error occurred: ${error.message}`);
    });
  }
}

export default new AppLifecycle();
