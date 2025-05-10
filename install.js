
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Installing dependencies for Milk Center Management Application...');
console.log('This script will use npm instead of bun to avoid issues with native dependencies.');

try {
  // Check if npm is installed
  execSync('npm --version', { stdio: 'ignore' });
  
  console.log('Installing main dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installation completed successfully!');
  console.log('You can now run the application using:');
  console.log('  npm run electron:start   - to run in development mode');
  console.log('  npm run electron:build   - to build for your current platform');
} catch (error) {
  console.error('Error during installation:');
  console.error(error.message);
  
  if (error.message.includes('npm --version')) {
    console.error('npm is not installed or not in your PATH.');
    console.error('Please install npm (comes with Node.js) from https://nodejs.org/');
  }
  
  process.exit(1);
}
