
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Switching from Bun to npm for installation...');

try {
  // Check if Bun lockfile exists and rename it temporarily
  if (fs.existsSync('bun.lockb')) {
    console.log('Found bun.lockb file, renaming it temporarily...');
    fs.renameSync('bun.lockb', 'bun.lockb.backup');
  }
  
  // Run the npm-based installation script
  console.log('Running npm-based installation script...');
  execSync('node install.js', { stdio: 'inherit' });
  
  console.log('\nInstallation completed successfully using npm!');
  console.log('The application should now be able to run without git-related errors.');
  
  // Restore Bun lockfile if it was backed up
  if (fs.existsSync('bun.lockb.backup')) {
    console.log('Restoring bun.lockb file...');
    fs.renameSync('bun.lockb.backup', 'bun.lockb');
  }
} catch (error) {
  console.error('Error during installation:');
  console.error(error.message);
  
  // Restore Bun lockfile if it was backed up
  if (fs.existsSync('bun.lockb.backup')) {
    fs.renameSync('bun.lockb.backup', 'bun.lockb');
  }
  
  process.exit(1);
}
