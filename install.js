
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Installing dependencies for Milk Center Management Application...');
console.log('Using npm for all dependencies to ensure compatibility.');

try {
  // Check if npm is installed
  execSync('npm --version', { stdio: 'ignore' });
  
  console.log('Installing main dependencies...');
  // Using --no-fund and --legacy-peer-deps to improve compatibility
  execSync('npm install --ignore-scripts --no-fund --legacy-peer-deps', { stdio: 'inherit' });
  
  console.log('Installing Electron-specific dependencies...');
  // Adding explicit flags to avoid Git-based installation issues
  execSync('npm install --no-save --ignore-scripts --no-fund --legacy-peer-deps --no-git electron@latest electron-builder@latest electron-is-dev@latest electron-log@latest', { stdio: 'inherit' });

  // Install lovable-tagger explicitly
  console.log('Installing Lovable tagger plugin...');
  execSync('npm install --no-save --ignore-scripts --legacy-peer-deps lovable-tagger@latest', { stdio: 'inherit' });

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
