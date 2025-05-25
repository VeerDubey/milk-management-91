
import { BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Platform detection
const isMac = process.platform === 'darwin';

class WindowManager {
  constructor() {
    this.mainWindow = null;
    this.APP_NAME = 'Milk Center Management';
  }

  createWindow() {
    console.log('Creating main window...');
    
    // Create the browser window with optimized settings
    this.mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 900,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        // Optimize memory usage
        backgroundThrottling: false,
        // Improve rendering performance 
        offscreen: false
      },
      icon: path.join(__dirname, '../public/icon-512x512.png'),
      show: false, // Don't show until ready to prevent white flash
      backgroundColor: '#0C0D10', // Match app background color
      titleBarStyle: isMac ? 'hiddenInset' : 'default',
      // Make it look more native
      frame: true,
      autoHideMenuBar: false, // Show menu
    });

    // Load the app
    if (isDev) {
      // In development, load from the dev server
      console.log('Running in development mode, loading from dev server...');
      this.mainWindow.loadURL('http://localhost:8080');
      // Open DevTools automatically in development
      this.mainWindow.webContents.openDevTools();
    } else {
      // In production, load the built index.html file
      try {
        // Fix path resolution for packaged apps
        const indexPath = path.join(__dirname, '../dist/index.html');
        console.log('Running in production mode, loading from:', indexPath);
        
        if (!fs.existsSync(indexPath)) {
          throw new Error(`Could not find index.html at ${indexPath}`);
        }
        
        this.mainWindow.loadFile(indexPath);
      } catch (error) {
        console.error('Failed to load index.html:', error);
        throw error;
      }
    }

    // Show window once ready to avoid white flash
    this.mainWindow.once('ready-to-show', () => {
      console.log('Window ready to show');
      this.mainWindow.show();
      this.mainWindow.focus();
    });

    // Set window title
    this.mainWindow.setTitle(this.APP_NAME);
    
    return this.mainWindow;
  }
  
  getMainWindow() {
    return this.mainWindow;
  }
}

export default new WindowManager();
