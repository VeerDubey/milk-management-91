
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔══════════════════════════════════════════════╗
║        Milk Center Management System         ║
║               Installation Helper            ║
╚══════════════════════════════════════════════╝
`);

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

function runCommand(cmd) {
  try {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    return false;
  }
}

switch (command) {
  case 'npm':
    console.log('Running NPM installation script...');
    runCommand('node use-npm.js');
    break;
    
  case 'fallback':
    console.log('Running fallback installation script...');
    runCommand('node npm-install.js');
    break;
    
  case 'start':
    console.log('Starting the application...');
    runCommand('node electron-scripts.js start');
    break;
    
  case 'build':
    console.log('Building the application...');
    runCommand('node electron-scripts.js build');
    break;
    
  case 'help':
  default:
    console.log(`
Available commands:

  node run.js npm       - Run the npm-based installation (recommended)
  node run.js fallback  - Run the fallback installation script
  node run.js start     - Start the application in development mode
  node run.js build     - Build the application for distribution
`);
}
