
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Installing dependencies for Milk Center Management Application...');
console.log('Using npm for all dependencies to ensure compatibility.');

try {
  // Check if npm is installed
  execSync('npm --version', { stdio: 'ignore' });
  
  // Configure npm to use registry directly and avoid git completely
  console.log('Configuring npm to avoid Git-based installations...');
  execSync('npm config set git-tag-version false', { stdio: 'inherit' });
  execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });
  execSync('npm config set fetch-retries 5', { stdio: 'inherit' });
  execSync('npm config set fetch-retry-mintimeout 20000', { stdio: 'inherit' });
  execSync('npm config set fetch-retry-maxtimeout 120000', { stdio: 'inherit' });
  execSync('npm config set fetch-timeout 300000', { stdio: 'inherit' });
  
  console.log('Installing main dependencies...');
  // Using all safety flags to maximize compatibility and avoid git
  execSync('npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps --no-git', { stdio: 'inherit' });
  
  // Explicitly handle problematic packages with special flags
  console.log('Handling potentially problematic packages...');
  try {
    console.log('Installing react-colorful explicitly with --force flag...');
    execSync('npm install --no-save react-colorful@latest --force --legacy-peer-deps --registry=https://registry.npmjs.org/', { stdio: 'inherit' });
  } catch (packageError) {
    console.warn('Warning: Could not install react-colorful. Will attempt to continue without it.');
    console.warn(packageError.message);
  }
  
  console.log('Installing Electron-specific dependencies from npm registry explicitly...');
  // Modify this line to install electron packages directly from npm without git
  execSync('npm install --no-save --ignore-scripts --no-fund --no-audit --legacy-peer-deps --no-git --registry=https://registry.npmjs.org/ electron@latest electron-builder@latest electron-is-dev@latest electron-log@latest', { stdio: 'inherit' });

  // Install explicitly node-gyp without git
  console.log('Installing node-gyp explicitly from npm registry...');
  execSync('npm install --no-save --ignore-scripts --no-fund --no-audit --legacy-peer-deps --no-git --registry=https://registry.npmjs.org/ node-gyp@latest', { stdio: 'inherit' });
  
  // Install @electron/node-gyp explicitly from npm registry - this fixes the git clone issue
  console.log('Installing @electron/node-gyp explicitly from npm registry...');
  execSync('npm install --no-save --ignore-scripts --no-fund --no-audit --legacy-peer-deps --no-git --registry=https://registry.npmjs.org/ @electron/node-gyp@latest', { stdio: 'inherit' });

  // Install lovable-tagger explicitly
  console.log('Installing Lovable tagger plugin...');
  execSync('npm install --no-save --ignore-scripts --no-fund --no-audit --legacy-peer-deps --no-git --registry=https://registry.npmjs.org/ lovable-tagger@latest', { stdio: 'inherit' });

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

