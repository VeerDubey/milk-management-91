
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('=== FORCIBLY USING NPM INSTEAD OF BUN ===');
console.log('This script will ensure we use npm for everything and completely ignore Bun.');

try {
  // Check if npm is installed
  execSync('npm --version', { stdio: 'pipe' });
  
  // Delete Bun lockfile if it exists
  if (fs.existsSync('bun.lockb')) {
    console.log('Deleting bun.lockb...');
    try {
      fs.unlinkSync('bun.lockb');
    } catch (error) {
      console.warn('Could not delete bun.lockb - this is non-fatal, continuing...');
      console.warn(error.message);
    }
  }
  
  // Backup package-lock.json if it exists
  if (fs.existsSync('package-lock.json')) {
    console.log('Backing up package-lock.json...');
    try {
      fs.copyFileSync('package-lock.json', 'package-lock.json.backup');
    } catch (error) {
      console.warn('Could not backup package-lock.json - this is non-fatal, continuing...');
    }
  }
  
  // Aggressive npm configuration to bypass git completely
  console.log('Configuring npm to avoid git completely...');
  execSync('npm config set git-tag-version false', { stdio: 'inherit' });
  execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });
  execSync('npm config set fetch-retries 5', { stdio: 'inherit' });
  execSync('npm config set fetch-retry-mintimeout 20000', { stdio: 'inherit' });
  execSync('npm config set fetch-retry-maxtimeout 120000', { stdio: 'inherit' });
  execSync('npm config set fetch-timeout 300000', { stdio: 'inherit' });
  execSync('npm config set git false', { stdio: 'inherit' });
  
  // Clean installation directory to resolve potential conflicts
  console.log('Cleaning node_modules directory...');
  if (fs.existsSync('node_modules')) {
    try {
      if (os.platform() === 'win32') {
        execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
      } else {
        execSync('rm -rf node_modules', { stdio: 'inherit' });
      }
    } catch (error) {
      console.warn('Could not fully clean node_modules - this is non-fatal, continuing...');
    }
  }
  
  // First install node-gyp explicitly
  console.log('Installing node-gyp and @electron/node-gyp directly from npm registry...');
  execSync('npm install node-gyp@latest @electron/node-gyp@latest --save-exact --no-git-tag-version --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  // Install all dependencies
  console.log('Installing all dependencies via npm...');
  execSync('npm install --no-git-tag-version --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  // Ensure Electron packages are installed separately
  console.log('Installing Electron packages separately...');
  execSync('npm install electron@latest electron-builder@latest electron-is-dev@latest electron-log@latest --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  console.log('Installation completed successfully!');
  console.log('You can now run the application using:');
  console.log('  node electron-scripts.js start');
  
} catch (error) {
  console.error('Error during installation:');
  console.error(error.message);
  
  // Restore backup if it exists
  if (fs.existsSync('package-lock.json.backup')) {
    fs.copyFileSync('package-lock.json.backup', 'package-lock.json');
  }
  
  process.exit(1);
}
