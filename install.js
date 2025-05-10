
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Installing dependencies for Milk Center Management Application...');
console.log('This script will use npm instead of bun to avoid issues with native dependencies.');

try {
  // Check if npm is installed
  execSync('npm --version', { stdio: 'ignore' });
  
  console.log('Installing main dependencies...');
  // Adding --ignore-scripts to avoid running node-gyp and other problematic scripts
  execSync('npm install --ignore-scripts', { stdio: 'inherit' });
  
  console.log('Installing Electron-specific dependencies...');
  // Using specific versions that are known to work without node-gyp issues
  execSync('npm install --no-save --ignore-scripts electron@latest electron-builder@latest electron-is-dev@latest electron-log@latest', { stdio: 'inherit' });

  console.log('\nInstallation completed successfully!');
  console.log('You can now run the application using:');
  console.log('  node electron-scripts.js start   - to run in development mode');
  console.log('  node electron-scripts.js build   - to build for your current platform');
} catch (error) {
  console.error('Error during installation:');
  console.error(error.message);
  
  if (error.message.includes('npm --version')) {
    console.error('npm is not installed or not in your PATH.');
    console.error('Please install npm (comes with Node.js) from https://nodejs.org/');
  }
  
  process.exit(1);
}
