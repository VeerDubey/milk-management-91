
import { app, dialog, shell } from 'electron';
import appLifecycle from './app-lifecycle.js';
import windowManager from './window-manager.js';

// Memory optimization with routine garbage collection
const setupMemoryOptimization = () => {
  setInterval(() => {
    if (global.gc) {
      global.gc();
    }
  }, 30 * 60 * 1000); // Run every 30 minutes
};

// Create the window when Electron has finished initializing
app.whenReady().then(() => {
  try {
    // Initialize the application
    appLifecycle.initialize();
    
    // Setup memory optimization
    setupMemoryOptimization();
    
    // Configure handlers for external links
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
      });
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    dialog.showErrorBox('Application Error', `Failed to initialize application: ${error.message}`);
    app.quit();
  }
}).catch(error => {
  console.error('Failed to initialize application:', error);
  dialog.showErrorBox('Application Error', `Failed to initialize application: ${error.message}`);
  app.quit();
});

