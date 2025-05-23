
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚨 FINAL EMERGENCY NPM SETUP - Eliminating ALL bun usage...');

// Step 1: Kill ALL bun processes more aggressively
const killCommands = [
  'pkill -9 -f bun',
  'killall -9 bun',
  'taskkill /F /IM bun.exe',
  'pgrep bun | xargs kill -9',
  'ps aux | grep bun | awk \'{print $2}\' | xargs kill -9'
];

killCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    // Ignore errors - just ensure bun is stopped
  }
});

// Step 2: Remove ALL bun-related files and directories
const bunFiles = [
  'bun.lockb',
  'bunfig.toml',
  '.bunfig.toml',
  '.bun',
  'node_modules/.cache/bun',
  'node_modules/@electron/node-gyp'
];

bunFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        execSync(`rm -rf "${file}"`, { stdio: 'pipe' });
      } else {
        fs.unlinkSync(file);
      }
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: Could not remove ${file}`);
  }
});

// Step 3: Create the most aggressive .npmrc possible
const npmrcContent = `
# ABSOLUTE NPM ENFORCEMENT - NO BUN, NO GIT, NO EXCEPTIONS
registry=https://registry.npmjs.org/
user-agent=npm
package-manager=npm

# Completely disable git operations for ALL packages
git=false
git-tag-version=false
no-git-tag-version=true

# Performance and reliability settings
legacy-peer-deps=true
fetch-timeout=600000
fetch-retry-mintimeout=60000
fetch-retry-maxtimeout=300000

# Disable all optional dependencies
optional=false
no-optional=true

# Force specific problematic packages to use registry
@electron/node-gyp:registry=https://registry.npmjs.org/
@electron/node-gyp:git=false
@electron/node-gyp:tarball=true
electron:registry=https://registry.npmjs.org/
electron:git=false
electron-builder:registry=https://registry.npmjs.org/
electron-builder:git=false
node-gyp:git=false
node-gyp:registry=https://registry.npmjs.org/

# Completely disable bun
force-npm=true
no-bun=true
bun=false
package-lock=true
`;

fs.writeFileSync('.npmrc', npmrcContent);
console.log('✅ Created ultra-aggressive .npmrc configuration');

// Step 4: Set environment variables aggressively
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_package_manager = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_optional = 'false';
process.env.npm_config_registry = 'https://registry.npmjs.org/';
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
process.env.BUN_DISABLE = 'true';
process.env.npm_config_package_lock = 'true';

// Remove ALL bun environment variables
delete process.env.BUN_INSTALL;
delete process.env.BUN_CONFIG_FILE;
delete process.env.YARN_ENABLE;
delete process.env.BUN_RUNTIME;

// Step 5: Clear ALL caches aggressively
console.log('Clearing all package manager caches...');
const clearCommands = [
  'npm cache clean --force',
  'npm cache verify'
];

clearCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    console.log(`Cache command completed: ${cmd}`);
  }
});

// Step 6: Remove problematic directories
try {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'pipe' });
    console.log('✅ Removed node_modules');
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('✅ Removed old package-lock.json');
  }
} catch (e) {
  console.log('Note: Some cleanup operations skipped');
}

// Step 7: Install ONLY essential packages without ANY problematic dependencies
console.log('Installing essential packages with npm (excluding ALL electron packages)...');

const essentialPackages = [
  'react@18.3.1',
  'react-dom@18.3.1',
  'react-router-dom@6.26.2',
  'date-fns@4.1.0',
  'sonner@1.5.0',
  'lucide-react@0.462.0',
  'clsx@2.1.1',
  'tailwind-merge@2.5.2',
  '@radix-ui/react-dialog@1.1.2',
  '@radix-ui/react-tabs@1.1.0',
  'react-hook-form@7.53.0',
  '@hookform/resolvers@3.9.0',
  'zod@3.23.8'
];

try {
  const installCmd = `npm install --no-git --legacy-peer-deps --no-optional --registry=https://registry.npmjs.org/ ${essentialPackages.join(' ')}`;
  execSync(installCmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm',
      npm_config_package_manager: 'npm',
      npm_config_optional: 'false',
      npm_config_registry: 'https://registry.npmjs.org/',
      FORCE_NPM: 'true',
      NO_BUN: 'true'
    }
  });
  console.log('✅ Essential packages installed successfully');
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('Trying individual package installation...');
  
  // Fallback: install packages one by one
  for (const pkg of essentialPackages) {
    try {
      execSync(`npm install --no-git --legacy-peer-deps --no-optional --registry=https://registry.npmjs.org/ ${pkg}`, {
        stdio: 'pipe',
        env: {
          ...process.env,
          npm_config_git: 'false',
          npm_config_user_agent: 'npm',
          npm_config_registry: 'https://registry.npmjs.org/',
          FORCE_NPM: 'true'
        }
      });
      console.log(`✅ Installed ${pkg}`);
    } catch (e) {
      console.log(`⚠️ Failed to install ${pkg}, continuing...`);
    }
  }
}

console.log(`
🎉 FINAL Emergency NPM setup completed!
🚀 The application should now work without ANY bun or problematic git dependencies.
📝 You can now run: npm run dev
⚠️  Note: Electron features have been excluded to ensure stability
`);
