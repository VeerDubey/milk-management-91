
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=== ENFORCING NPM FOR ALL DEPENDENCIES ===');
console.log('This script will bypass Bun and use npm directly to avoid git clone issues.');

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
  
  // Aggressive npm configuration to avoid git completely
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
      execSync('rm -rf node_modules', { stdio: 'inherit' });
    } catch (error) {
      console.warn('Could not fully clean node_modules - this is non-fatal, continuing...');
    }
  }
  
  console.log('Installing @electron/node-gyp directly from npm registry...');
  execSync('npm install @electron/node-gyp@latest --no-git-tag-version --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git --save-exact', { stdio: 'inherit' });
  
  console.log('Installing all dependencies via npm...');
  execSync('npm install --no-git-tag-version --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  console.log('Installing Electron packages separately...');
  execSync('npm install electron@latest electron-builder@latest electron-is-dev@latest electron-log@latest --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  console.log('Installation completed successfully!');
  console.log('You can now run the application using:');
  console.log('  node electron-scripts.js start');
  
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
