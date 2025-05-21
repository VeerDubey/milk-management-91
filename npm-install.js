
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
  
  // Configure npm to use registry directly
  console.log('Configuring npm to use registry directly...');
  execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });
  execSync('npm config set git false', { stdio: 'inherit' });
  
  // Install all dependencies
  console.log('Installing all dependencies via npm...');
  execSync('npm install --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  // Install @electron/node-gyp explicitly with a fixed version directly from npm
  console.log('Installing @electron/node-gyp explicitly...');
  execSync('npm install @electron/node-gyp@1.0.0 --save-exact --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  console.log('Installation completed successfully!');
  
} catch (error) {
  console.error('Error during installation:');
  console.error(error.message);
  process.exit(1);
}
