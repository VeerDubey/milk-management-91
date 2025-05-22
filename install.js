
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔══════════════════════════════════════════════╗
║        Milk Center Management System         ║
║              Installation Script             ║
╚══════════════════════════════════════════════╝
`);

// Detect platform and architecture
const platform = os.platform();
const arch = os.arch();
console.log(`Platform: ${platform} (${arch})`);
console.log(`Node version: ${process.version}`);

// Check for problematic Node versions
const nodeVersion = process.version.slice(1).split('.').map(Number);
const isNodeVersionCompatible = nodeVersion[0] >= 16;

if (!isNodeVersionCompatible) {
  console.warn(`
⚠️ Warning: You're using Node.js ${process.version}, but Electron works best with Node.js 16 or higher.
Consider upgrading your Node.js version if you encounter issues.
`);
}

// Utility function to run commands safely
function runCommand(command, options = {}) {
  const { silent = false, ignoreError = false } = options;
  
  try {
    if (!silent) {
      console.log(`\n> ${command}`);
    }
    execSync(command, { stdio: silent ? 'ignore' : 'inherit' });
    return true;
  } catch (error) {
    if (!ignoreError) {
      console.error(`Command failed: ${command}`);
      console.error(error.message);
    }
    return false;
  }
}

// Clean install function
async function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  // Configure npm options for better compatibility
  console.log('Configuring npm for better compatibility...');
  runCommand('npm config set git-tag-version false');
  runCommand('npm config set registry https://registry.npmjs.org/');
  runCommand('npm config set fetch-retries 5');
  runCommand('npm config set fetch-retry-mintimeout 30000');
  runCommand('npm config set fetch-retry-maxtimeout 120000');
  
  // Clear npm cache if needed
  console.log('Cleaning npm cache...');
  runCommand('npm cache clean --force', { silent: true, ignoreError: true });
  
  // Use npm instead of node-gyp directly
  console.log('Setting up build tools...');
  runCommand('npm install --no-save node-gyp@latest --quiet', { ignoreError: true });
  
  // Always use npm for Electron packages - they have complex native dependencies
  console.log('\n⚡ Installing Electron and related packages first...');
  runCommand('npm install --no-save electron electron-builder electron-is-dev electron-log --legacy-peer-deps');
  
  // Install base dependencies
  console.log('\nInstalling main dependencies...');
  const baseInstallSuccess = runCommand('npm install --legacy-peer-deps');
  
  if (!baseInstallSuccess) {
    console.log('\n⚠️ Main installation had issues. Trying with more permissive flags...');
    runCommand('npm install --legacy-peer-deps --force');
  }
  
  // Create necessary directories
  console.log('\n📁 Ensuring all required directories exist...');
  ensureDirectoriesExist();
  
  // Create electron-builder.json if needed
  console.log('Checking for electron-builder.json configuration...');
  ensureElectronBuilderConfig();
  
  console.log('\n✅ Installation completed!');
  console.log(`
🚀 You can now run the application using:
  • Development mode: node electron-scripts.js start
  • Build for your platform: node electron-scripts.js build
  • View more options: node electron-scripts.js
  `);
}

// Ensure required directories exist
function ensureDirectoriesExist() {
  const requiredDirs = [
    'build',
    'dist',
    'dist_electron',
    'electron',
    'electron/api'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

// Ensure electron-builder.json exists with proper configuration
function ensureElectronBuilderConfig() {
  const configPath = path.join(__dirname, 'electron-builder.json');
  if (!fs.existsSync(configPath)) {
    console.log('Creating electron-builder.json configuration file...');
    const defaultConfig = {
      "appId": "com.milkcenter.management",
      "productName": "Milk Center Management",
      "directories": {
        "output": "dist_electron"
      },
      "files": [
        "build/**/*",
        "electron/**/*"
      ],
      "mac": {
        "category": "public.app-category.business",
        "icon": "build/icon-512x512.png"
      },
      "win": {
        "target": "nsis",
        "icon": "build/icon-512x512.png"
      },
      "linux": {
        "target": ["AppImage", "deb"],
        "category": "Office",
        "icon": "build/icon-512x512.png"
      },
      "npmRebuild": false
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  }
}

// Start installation
installDependencies().catch(err => {
  console.error('Installation failed:', err);
  process.exit(1);
});
