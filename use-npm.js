
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔══════════════════════════════════════════════╗
║  NPM INSTALLATION FOR ELECTRON APPLICATIONS  ║
║            (Git-Free Installation)           ║
╚══════════════════════════════════════════════╝
`);

// Execute command and handle errors
function runCommand(command, options = {}) {
  const { silent = false } = options;
  
  try {
    if (!silent) {
      console.log(`\n> ${command}`);
    }
    execSync(command, { stdio: silent ? 'ignore' : 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  // 1. Create a clean .npmrc with strict settings
  console.log('📝 Creating optimized .npmrc file...');
  const npmrcContent = `
# Force npm registry for all packages
registry=https://registry.npmjs.org/

# Increase network timeouts
fetch-timeout=600000
fetch-retry-mintimeout=60000
fetch-retry-maxtimeout=300000

# Compatibility settings
legacy-peer-deps=true
strict-peer-dependencies=false

# Explicitly avoid git
git=false
prefer-offline=true

# Force tarball downloads for all packages
@electron:registry=https://registry.npmjs.org/
@electron/node-gyp:registry=https://registry.npmjs.org/
node-gyp:registry=https://registry.npmjs.org/
`;

  fs.writeFileSync(path.join(__dirname, '.npmrc'), npmrcContent.trim());
  console.log('✅ Created optimized .npmrc');

  // 2. Clear npm cache to avoid using cached git references
  console.log('🧹 Cleaning npm cache...');
  runCommand('npm cache clean --force');

  // 3. Install core electron packages first (most problematic)
  console.log('⚡ Installing Electron packages first...');
  const electronCmd = 'npm install --no-save --force --no-git electron electron-builder electron-is-dev electron-log';
  if (!runCommand(electronCmd)) {
    console.error('❌ Failed to install Electron packages');
    process.exit(1);
  }

  // 4. Install node-gyp packages separately with full force flags
  console.log('🔧 Installing node-gyp packages...');
  const nodeGypCmd = 'npm install --no-save --force --no-git @electron/node-gyp node-gyp';
  runCommand(nodeGypCmd);

  // 5. Install all remaining dependencies
  console.log('📦 Installing all dependencies...');
  if (!runCommand('npm install --legacy-peer-deps --no-git')) {
    console.log('⚠️ Standard install had issues, trying with force flag...');
    if (!runCommand('npm install --legacy-peer-deps --force --no-git')) {
      console.error('❌ Installation failed despite all efforts');
      process.exit(1);
    }
  }

  // 6. Final verification step
  console.log('✅ Dependencies installed successfully');
  console.log('🔍 Verifying critical packages...');
  
  try {
    // Check if electron is installed
    require.resolve('electron');
    console.log('✓ Electron package verified');
    
    // Check if electron-builder is installed
    require.resolve('electron-builder');
    console.log('✓ electron-builder package verified');
    
    console.log('\n✨ Installation completed successfully!');
    console.log(`
To start your application:
  • Development: node electron-scripts.js start
  • Build: node electron-scripts.js build
`);
  } catch (error) {
    console.error('⚠️ Some critical packages may be missing:', error.message);
    console.log('Please try running: npm install --legacy-peer-deps --force --no-git');
  }
}

main().catch(err => {
  console.error('Installation failed:', err);
  process.exit(1);
});
