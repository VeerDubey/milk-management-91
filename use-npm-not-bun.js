
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=== SWITCHING FROM BUN TO NPM FOR INSTALLATION ===');
console.log('This script will bypass Bun and use npm directly to avoid git clone issues with @electron/node-gyp.');

try {
  // Check if npm is installed
  execSync('npm --version', { stdio: 'pipe' });
  
  // Back up any existing lockfiles to prevent conflicts
  if (fs.existsSync('bun.lockb')) {
    console.log('Backing up bun.lockb...');
    fs.renameSync('bun.lockb', 'bun.lockb.backup');
  }
  
  if (fs.existsSync('package-lock.json')) {
    console.log('Backing up package-lock.json...');
    fs.renameSync('package-lock.json', 'package-lock.json.backup');
  }
  
  // Run our force-npm.js script which has all the needed settings
  console.log('Running force-npm.js to complete installation...');
  execSync('node force-npm.js', { stdio: 'inherit' });
  
  console.log('Installation completed successfully using npm!');
  console.log('You can now run the application using: node electron-scripts.js start');
  
  // Restore backup files
  if (fs.existsSync('bun.lockb.backup')) {
    fs.renameSync('bun.lockb.backup', 'bun.lockb');
  }
  
  if (fs.existsSync('package-lock.json.backup')) {
    fs.renameSync('package-lock.json.backup', 'package-lock.json');
  }
  
} catch (error) {
  console.error('Error during installation:');
  console.error(error.message);
  
  // Restore backup files on error
  if (fs.existsSync('bun.lockb.backup')) {
    fs.renameSync('bun.lockb.backup', 'bun.lockb');
  }
  
  if (fs.existsSync('package-lock.json.backup')) {
    fs.renameSync('package-lock.json.backup', 'package-lock.json');
  }
  
  process.exit(1);
}
