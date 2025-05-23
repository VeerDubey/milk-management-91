
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔══════════════════════════════════════════════╗
║        Milk Center Management System         ║
║              NPM Installation                ║
╚══════════════════════════════════════════════╝
`);

// Set npm as the only package manager
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';

// Remove bun files if they exist (no error if missing)
const filesToRemove = ['bun.lockb', 'bunfig.toml'];
filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed ${file}`);
    }
  } catch (error) {
    console.log(`Note: ${file} was already removed or doesn't exist`);
  }
});

function runNpmCommand(command) {
  try {
    console.log(`> ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_git: 'false',
        npm_config_user_agent: 'npm'
      }
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    return false;
  }
}

// Clean and install
console.log('Cleaning npm cache...');
runNpmCommand('npm cache clean --force');

console.log('Installing dependencies...');
const success = runNpmCommand('npm install --legacy-peer-deps --no-git');

if (!success) {
  console.log('Trying alternative installation...');
  runNpmCommand('npm install --legacy-peer-deps --force --no-git');
}

console.log('✅ Installation process completed');
console.log('Run: npm run dev');
