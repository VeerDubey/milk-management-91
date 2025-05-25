
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log(`
╔══════════════════════════════════════════════╗
║        Milk Center Management System         ║
║               No-Git Installer               ║
╚══════════════════════════════════════════════╝
`);

// Environment setup to prevent Git usage
process.env.npm_config_git = 'false';
process.env.npm_config_git_tag_version = 'false';

// Create essential .npmrc configuration
console.log('Creating .npmrc to disable Git...');
const npmrcContent = `
registry=https://registry.npmjs.org/
git=false
git-tag-version=false
legacy-peer-deps=true
fetch-timeout=600000
`;
fs.writeFileSync('.npmrc', npmrcContent.trim());

// Function to run commands safely
function runCommand(cmd) {
  try {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, npm_config_git: 'false' } });
    return true;
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    return false;
  }
}

// Try different installation approaches
console.log('Attempting npm installation without Git...');
const success = runCommand('npm install --no-git --legacy-peer-deps');

if (!success) {
  console.log('Trying alternative installation with node npm-no-git.js...');
  runCommand('node npm-no-git.js');
}

// Create ElectronService fallback for web-only mode
const electronServicePath = 'src/services/ElectronService.ts';
const electronServiceContent = `
// Web-only fallback for ElectronService
export const ElectronService = {
  isElectron: false,
  
  // File operations
  downloadInvoice: async (data: string, filename: string) => {
    console.log('Web-only mode: Creating download link in browser');
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  },
  
  printInvoice: async (data: string) => {
    console.log('Web-only mode: Opening print dialog in browser');
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = data;
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      try {
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print failed:', e);
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
    
    return { success: true };
  },
  
  getPrinters: async () => {
    return { success: false, printers: [] };
  }
};
`;

// Ensure ElectronService fallback exists
if (!fs.existsSync(electronServicePath)) {
  console.log('Creating ElectronService fallback for web-only mode...');
  fs.mkdirSync(path.dirname(electronServicePath), { recursive: true });
  fs.writeFileSync(electronServicePath, electronServiceContent);
}

console.log('Installation process completed');
console.log('Try running: npm run dev');
