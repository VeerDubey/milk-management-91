
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Function to execute shell commands and display output
function runCommand(command, options = {}) {
  const { silent = false, exitOnError = true } = options;
  
  if (!silent) {
    console.log(`\n${colors.cyan}>${colors.reset} ${command}\n`);
  }
  
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    if (!silent) {
      console.error(`${colors.red}Command failed:${colors.reset} ${command}`);
      console.error(error.message);
    }
    
    // Special handling for npm install failures
    if (command.includes('npm install') || command.includes('npx')) {
      console.log(`${colors.yellow}Attempting alternative command without git...${colors.reset}`);
      try {
        // Try alternative command without git
        const altCommand = command + ' --no-git';
        console.log(`\n${colors.cyan}>${colors.reset} ${altCommand}\n`);
        execSync(altCommand, { stdio: 'inherit' });
        return true;
      } catch (altError) {
        console.error(`${colors.red}Alternative command also failed:${colors.reset}`, altError.message);
        if (exitOnError) {
          process.exit(1);
        }
        return false;
      }
    } else if (exitOnError) {
      process.exit(1);
    }
    return false;
  }
}

// Create directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  ensureDirectoryExists(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Check if a file exists, and copy from alternative location if it doesn't
function ensureFileExists(targetFile, alternativeSources) {
  if (fs.existsSync(targetFile)) {
    return true;
  }

  for (const source of alternativeSources) {
    if (fs.existsSync(source)) {
      ensureDirectoryExists(path.dirname(targetFile));
      fs.copyFileSync(source, targetFile);
      console.log(`${colors.green}Copied file:${colors.reset} ${path.basename(source)} -> ${path.basename(targetFile)}`);
      return true;
    }
  }
  
  console.warn(`${colors.yellow}Warning:${colors.reset} Could not find file ${path.basename(targetFile)} in any of the alternative locations.`);
  return false;
}

// Ensure build directories exist
function prepareBuildDirectories() {
  ensureDirectoryExists(path.join(__dirname, 'dist'));
  ensureDirectoryExists(path.join(__dirname, 'build'));
  ensureDirectoryExists(path.join(__dirname, 'dist_electron'));
}

// Copy icon file for build resources if needed
function copyIconFile() {
  const targetIcon = path.join(__dirname, 'build/icon-512x512.png');
  const alternativeIcons = [
    path.join(__dirname, 'public/icon-512x512.png'),
    path.join(__dirname, 'public/icon.png'),
    path.join(__dirname, 'public/favicon.png'),
    path.join(__dirname, 'public/favicon.ico'),
    path.join(__dirname, 'src/assets/icon.png'),
    path.join(__dirname, 'src/assets/logo.png')
  ];
  
  ensureFileExists(targetIcon, alternativeIcons);
}

// Ensure required files for Electron exist
function ensureElectronFiles() {
  // Check for main.js
  const mainJsExists = fs.existsSync(path.join(__dirname, 'electron/main.js'));
  if (!mainJsExists) {
    console.warn(`${colors.yellow}Warning:${colors.reset} electron/main.js not found.`);
    console.log('Creating minimal electron/main.js file...');
    
    const mainJsContent = `
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development';

// Create the browser window
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the index.html from a url
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;

    ensureDirectoryExists(path.join(__dirname, 'electron'));
    fs.writeFileSync(path.join(__dirname, 'electron/main.js'), mainJsContent);
    console.log(`${colors.green}Created:${colors.reset} electron/main.js`);
  }
  
  // Check for preload.js
  const preloadJsExists = fs.existsSync(path.join(__dirname, 'electron/preload.js'));
  if (!preloadJsExists) {
    console.warn(`${colors.yellow}Warning:${colors.reset} electron/preload.js not found.`);
    console.log('Creating minimal electron/preload.js file...');
    
    const preloadJsContent = `
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  appInfo: {
    getVersion: () => ipcRenderer.invoke('get-version'),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info')
  },
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),
  saveLog: (logData) => ipcRenderer.invoke('save-log', logData),
  system: {
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
    readFromClipboard: () => ipcRenderer.invoke('read-from-clipboard'),
    isPlatform: (platform) => ipcRenderer.invoke('is-platform', platform)
  },
  downloadInvoice: (data, filename) => ipcRenderer.invoke('download-invoice', data, filename),
  printInvoice: (data) => ipcRenderer.invoke('print-invoice', data),
  getPrinters: () => ipcRenderer.invoke('get-printers')
});
`;

    ensureDirectoryExists(path.join(__dirname, 'electron'));
    fs.writeFileSync(path.join(__dirname, 'electron/preload.js'), preloadJsContent);
    console.log(`${colors.green}Created:${colors.reset} electron/preload.js`);
  }
}

// Check if all necessary dependencies are installed
function checkDependencies() {
  const requiredDeps = [
    'electron',
    'electron-builder',
    'electron-is-dev',
    'electron-log',
    'concurrently',
    'cross-env'
  ];
  
  let allInstalled = true;
  const missingDeps = [];
  
  console.log(`${colors.cyan}Checking required dependencies...${colors.reset}`);
  
  for (const dep of requiredDeps) {
    try {
      require.resolve(dep);
    } catch (e) {
      allInstalled = false;
      missingDeps.push(dep);
    }
  }
  
  if (!allInstalled) {
    console.log(`${colors.yellow}Missing dependencies:${colors.reset} ${missingDeps.join(', ')}`);
    console.log('Installing missing dependencies...');
    runCommand(`npm install --save-dev ${missingDeps.join(' ')}`);
  } else {
    console.log(`${colors.green}All required dependencies are installed.${colors.reset}`);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Log the system information
console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════╗
║ Milk Center Management Application        ║
║ Build Script                              ║
╚══════════════════════════════════════════╝${colors.reset}

${colors.dim}Platform:     ${colors.reset}${os.platform()}
${colors.dim}Architecture: ${colors.reset}${os.arch()}
${colors.dim}Node Version: ${colors.reset}${process.version}
`);

// Make sure we have necessary dependencies
checkDependencies();

// Execute the appropriate command based on arguments
switch (command) {
  case 'start':
    // Start both Vite dev server and Electron - ensure all npm usage
    console.log(`${colors.bright}Starting development environment...${colors.reset}`);
    ensureElectronFiles();
    runCommand('npx concurrently --kill-others "npm run dev -- --host" "npx cross-env NODE_ENV=development npx electron electron/main.js"');
    break;

  case 'build':
    // Build for current platform only
    console.log(`${colors.bright}Building for current platform...${colors.reset}`);
    prepareBuildDirectories();
    copyIconFile();
    ensureElectronFiles();
    runCommand('npm run build');
    
    // Ensure electron directory is included in the build
    console.log('Ensuring electron directory is included in the build...');
    
    const platform = os.platform();
    if (platform === 'win32') {
      runCommand('npx electron-builder --win --config electron-builder.json');
    } else if (platform === 'darwin') {
      runCommand('npx electron-builder --mac --config electron-builder.json');
    } else {
      runCommand('npx electron-builder --linux --config electron-builder.json');
    }
    break;

  case 'build-all':
    // Build for all platforms
    console.log(`${colors.bright}Building for all supported platforms...${colors.reset}`);
    console.log(`${colors.yellow}Note:${colors.reset} Cross-platform builds may require additional dependencies.`);
    prepareBuildDirectories();
    copyIconFile();
    ensureElectronFiles();
    runCommand('npm run build');
    runCommand('npx electron-builder --config electron-builder.json');
    break;

  case 'build-win':
    // Build for Windows
    console.log(`${colors.bright}Building for Windows...${colors.reset}`);
    prepareBuildDirectories();
    copyIconFile();
    ensureElectronFiles();
    runCommand('npm run build');
    runCommand('npx electron-builder --win --config electron-builder.json');
    break;

  case 'build-mac':
    // Build for macOS
    console.log(`${colors.bright}Building for macOS...${colors.reset}`);
    prepareBuildDirectories();
    copyIconFile();
    ensureElectronFiles();
    runCommand('npm run build');
    runCommand('npx electron-builder --mac --config electron-builder.json');
    break;

  case 'build-linux':
    // Build for Linux
    console.log(`${colors.bright}Building for Linux...${colors.reset}`);
    prepareBuildDirectories();
    copyIconFile();
    ensureElectronFiles();
    runCommand('npm run build');
    runCommand('npx electron-builder --linux --config electron-builder.json');
    break;

  case 'dev':
    // For development only - ensure all npm usage
    console.log(`${colors.bright}Building once and starting Electron...${colors.reset}`);
    ensureElectronFiles();
    runCommand('npm run build');
    runCommand('npx cross-env NODE_ENV=development npx electron electron/main.js');
    break;

  default:
    console.log(`
${colors.bright}${colors.cyan}Electron build script for Milk Center Management${colors.reset}
Usage: node electron-scripts.js [command]

${colors.bright}Commands:${colors.reset}
  ${colors.green}start${colors.reset}       Start both Vite dev server and Electron for development
  ${colors.green}build${colors.reset}       Build for current platform only
  ${colors.green}build-all${colors.reset}   Build for all platforms (requires cross-platform build tools)
  ${colors.green}build-win${colors.reset}   Build for Windows
  ${colors.green}build-mac${colors.reset}   Build for macOS
  ${colors.green}build-linux${colors.reset} Build for Linux
  ${colors.green}dev${colors.reset}         Build once and start Electron (for testing)
`);
}
