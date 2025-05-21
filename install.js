
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Installing dependencies for Milk Center Management Application...');
console.log('Using npm for all dependencies to ensure compatibility.');

try {
  // Check if npm is installed
  execSync('npm --version', { stdio: 'ignore' });
  
  // Configure npm to use registry directly and completely avoid git
  console.log('Configuring npm to avoid Git-based installations completely...');
  execSync('npm config set git-tag-version false', { stdio: 'inherit' });
  execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });
  execSync('npm config set fetch-retries 5', { stdio: 'inherit' });
  execSync('npm config set fetch-retry-mintimeout 20000', { stdio: 'inherit' });
  execSync('npm config set fetch-retry-maxtimeout 120000', { stdio: 'inherit' });
  execSync('npm config set fetch-timeout 300000', { stdio: 'inherit' });
  
  // This is critical - disable git operations for npm
  execSync('npm config set git false', { stdio: 'inherit' });
  
  console.log('Installing main dependencies...');
  // Using all safety flags to maximize compatibility and avoid git
  execSync('npm install --no-git-tag-version --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  // First install @electron/node-gyp explicitly without git and with exact version
  console.log('Installing @electron/node-gyp explicitly from npm registry...');
  execSync('npm install @electron/node-gyp@latest --save-exact --no-git-tag-version --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  // Explicitly handle problematic packages with special flags
  console.log('Handling potentially problematic packages...');
  try {
    console.log('Installing react-colorful explicitly with --force flag...');
    execSync('npm install react-colorful@latest --force --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  } catch (packageError) {
    console.warn('Warning: Could not install react-colorful. Will attempt to continue without it.');
    console.warn(packageError.message);
  }
  
  console.log('Installing Electron-specific dependencies from npm registry explicitly...');
  // Modify this line to install electron packages directly from npm without git
  execSync('npm install electron@latest electron-builder@latest electron-is-dev@latest electron-log@latest --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });

  // Install explicitly node-gyp without git
  console.log('Installing node-gyp explicitly from npm registry...');
  execSync('npm install node-gyp@latest --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });
  
  // Reinstall @electron/node-gyp explicitly from npm registry again as a final step
  console.log('Reinstalling @electron/node-gyp explicitly from npm registry to finalize...');
  execSync('npm install @electron/node-gyp@latest --save-exact --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });

  // Install lovable-tagger explicitly
  console.log('Installing Lovable tagger plugin...');
  execSync('npm install lovable-tagger@latest --ignore-scripts --no-fund --no-audit --legacy-peer-deps --registry=https://registry.npmjs.org/ --no-git', { stdio: 'inherit' });

  console.log('\nInstallation completed successfully!');
  console.log('You can now run the application using:');
  console.log('  node electron-scripts.js start   - to run in development mode');
  console.log('  node electron-scripts.js build   - to build for your current platform');
  
  console.log('\nIf you encounter any issues with bun install, please run:');
  console.log('  node force-npm.js');
} catch (error) {
  console.error('Error during installation:');
  console.error(error.message);
  
  if (error.message.includes('npm --version')) {
    console.error('npm is not installed or not in your PATH.');
    console.error('Please install npm (comes with Node.js) from https://nodejs.org/');
  } else {
    console.error('\nTrying alternative approach...');
    console.error('Please run: node force-npm.js');
  }
  
  process.exit(1);
}
