
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to execute shell commands and display output
function runCommand(command) {
  console.log(`\n> ${command}\n`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error);
    process.exit(1);
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

// Ensure build directories exist
function prepareBuildDirectories() {
  ensureDirectoryExists(path.join(__dirname, 'dist'));
  ensureDirectoryExists(path.join(__dirname, 'build'));
  ensureDirectoryExists(path.join(__dirname, 'dist_electron'));
}

// Copy icon file for build resources if needed
function copyIconFile() {
  const sourceIcon = path.join(__dirname, 'public/icon-512x512.png');
  const destIcon = path.join(__dirname, 'build/icon-512x512.png');
  
  if (fs.existsSync(sourceIcon) && !fs.existsSync(destIcon)) {
    ensureDirectoryExists(path.join(__dirname, 'build'));
    fs.copyFileSync(sourceIcon, destIcon);
    console.log('Copied icon file to build resources directory');
  } else if (!fs.existsSync(sourceIcon)) {
    console.warn('Warning: Icon file not found at', sourceIcon);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Log the system information
console.log(`
Building Milk Center Management Application
------------------------------------------
Platform: ${os.platform()}
Architecture: ${os.arch()}
Node Version: ${process.version}
------------------------------------------
`);

// Execute the appropriate command based on arguments
switch (command) {
  case 'start':
    // Start both Vite dev server and Electron - use npm to avoid issues
    console.log('Starting development environment...');
    runCommand('npx concurrently "npm run dev -- --host" "cross-env NODE_ENV=development electron electron/main.js"');
    break;

  case 'build':
    // Build for current platform only
    console.log('Building for current platform...');
    prepareBuildDirectories();
    copyIconFile();
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
    console.log('Building for all supported platforms...');
    prepareBuildDirectories();
    copyIconFile();
    runCommand('npm run build');
    runCommand('npx electron-builder --config electron-builder.json');
    break;

  case 'build-win':
    // Build for Windows
    console.log('Building for Windows...');
    prepareBuildDirectories();
    copyIconFile();
    runCommand('npm run build');
    runCommand('npx electron-builder --win --config electron-builder.json');
    break;

  case 'build-mac':
    // Build for macOS
    console.log('Building for macOS...');
    prepareBuildDirectories();
    copyIconFile();
    runCommand('npm run build');
    runCommand('npx electron-builder --mac --config electron-builder.json');
    break;

  case 'build-linux':
    // Build for Linux
    console.log('Building for Linux...');
    prepareBuildDirectories();
    copyIconFile();
    runCommand('npm run build');
    runCommand('npx electron-builder --linux --config electron-builder.json');
    break;

  case 'dev':
    // For development only
    runCommand('npm run build');
    runCommand('cross-env NODE_ENV=development electron electron/main.js');
    break;

  default:
    console.log(`
Electron build script for Milk Center Management
Usage: node electron-scripts.js [command]

Commands:
  start       Start both Vite dev server and Electron for development
  build       Build for current platform only
  build-all   Build for all platforms (requires cross-platform build tools)
  build-win   Build for Windows
  build-mac   Build for macOS
  build-linux Build for Linux
  dev         Build once and start Electron (for testing)
`);
}
