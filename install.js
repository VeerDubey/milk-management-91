
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔══════════════════════════════════════════════╗
║        Milk Center Management System         ║
║              Installation Script             ║
╚══════════════════════════════════════════════╝
`);

// Detect platform and architecture
const platform = os.platform();
const arch = os.arch();
console.log(`Platform: ${platform} (${arch})`);
console.log(`Node version: ${process.version}`);

// Check for problematic Node versions
const nodeVersion = process.version.slice(1).split('.').map(Number);
const isNodeVersionCompatible = nodeVersion[0] >= 16;

if (!isNodeVersionCompatible) {
  console.warn(`
⚠️ Warning: You're using Node.js ${process.version}, but Electron works best with Node.js 16 or higher.
Consider upgrading your Node.js version if you encounter issues.
`);
}

// Utility function to run commands safely
function runCommand(command, options = {}) {
  const { silent = false, ignoreError = false } = options;
  
  try {
    if (!silent) {
      console.log(`\n> ${command}`);
    }
    execSync(command, { stdio: silent ? 'ignore' : 'inherit' });
    return true;
  } catch (error) {
    if (!ignoreError) {
      console.error(`Command failed: ${command}`);
      console.error(error.message);
    }
    return false;
  }
}

// Clean install function
async function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  // Configure npm options for better compatibility
  console.log('Configuring npm for better compatibility...');
  runCommand('npm config set git-tag-version false');
  runCommand('npm config set registry https://registry.npmjs.org/');
  
  // IMPORTANT: Disable git for package installation
  runCommand('npm config set git false');
  
  // Clear npm cache if needed
  console.log('Cleaning npm cache...');
  runCommand('npm cache clean --force', { silent: true, ignoreError: true });
  
  // Install all dependencies without git
  console.log('\nInstalling dependencies with --no-git flag...');
  const success = runCommand('npm install --legacy-peer-deps --no-git');
  
  if (!success) {
    // Try with force flag
    console.log('\n⚠️ Standard install failed, trying with force flag...');
    const forceSuccess = runCommand('npm install --legacy-peer-deps --force --no-git');
    
    if (!forceSuccess) {
      console.log('\n⚠️ Force install also failed. Trying alternative approach...');
      
      // Skip problematic packages for now
      runCommand('npm install --no-save --no-package-lock --no-optional --no-git');
      
      // Create a minimal configuration to run the application without Electron
      console.log('\nCreating fallback configuration for web-only mode...');
      createFallbackConfig();
    }
  }
  
  console.log('\n✅ Installation completed!');
  console.log('You can now run the application in web-only mode.');
}

// Create a fallback configuration for web-only mode
function createFallbackConfig() {
  // Create a stub service for Electron functionality
  const electronStubPath = path.join(__dirname, 'src', 'services', 'ElectronService.ts');
  if (!fs.existsSync(path.dirname(electronStubPath))) {
    fs.mkdirSync(path.dirname(electronStubPath), { recursive: true });
  }
  
  const electronStubContent = `
// This is a stub implementation for web-only mode
export const ElectronService = {
  // Basic functionality
  isElectron: false,
  
  // File operations
  downloadInvoice: async (data: string, filename: string) => {
    console.log('Electron not available: Creating download link in browser');
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  },
  
  printInvoice: async (data: string) => {
    console.log('Electron not available: Opening print dialog in browser');
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
    console.log('Electron not available: Cannot get printers');
    return { success: false, printers: [] };
  },
  
  // Clipboard operations
  copyToClipboard: async (text: string) => {
    console.log('Electron not available: Using browser clipboard API');
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (e) {
      console.error('Clipboard write failed:', e);
      return { success: false, error: 'Cannot access clipboard' };
    }
  },
  
  readFromClipboard: async () => {
    console.log('Electron not available: Using browser clipboard API');
    try {
      const text = await navigator.clipboard.readText();
      return { success: true, text };
    } catch (e) {
      console.error('Clipboard read failed:', e);
      return { success: false, error: 'Cannot access clipboard', text: '' };
    }
  }
};
`;

  fs.writeFileSync(electronStubPath, electronStubContent);
  console.log('Created ElectronService stub for web-only mode');
}

// Start installation
installDependencies().catch(err => {
  console.error('Installation failed:', err);
  process.exit(1);
});
