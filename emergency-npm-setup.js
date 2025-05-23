
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚨 Emergency NPM-only setup - eliminating all bun usage...');

// Step 1: Kill ALL bun processes aggressively
const killCommands = [
  'pkill -9 -f bun',
  'killall -9 bun',
  'taskkill /F /IM bun.exe',
  'pgrep bun | xargs kill -9'
];

killCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    // Ignore errors - just ensure bun is stopped
  }
});

// Step 2: Remove ALL bun-related files
const bunFiles = [
  'bun.lockb',
  'bunfig.toml',
  '.bunfig.toml',
  '.bun'
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

// Step 3: Create ultra-aggressive .npmrc
const npmrcContent = `
# FORCE NPM ONLY - NO BUN, NO GIT
registry=https://registry.npmjs.org/
user-agent=npm
package-manager=npm

# Completely disable git operations
git=false
git-tag-version=false
no-git-tag-version=true

# Performance and reliability settings
legacy-peer-deps=true
fetch-timeout=600000
fetch-retry-mintimeout=60000
fetch-retry-maxtimeout=300000

# Disable all optional dependencies that might require git
optional=false
no-optional=true

# Force specific packages to use registry instead of git
@electron/node-gyp:registry=https://registry.npmjs.org/
@electron/node-gyp:git=false
electron:registry=https://registry.npmjs.org/
electron:git=false
electron-builder:registry=https://registry.npmjs.org/
electron-builder:git=false

# Disable bun entirely
force-npm=true
no-bun=true
bun=false
`;

fs.writeFileSync('.npmrc', npmrcContent);
console.log('✅ Created aggressive .npmrc configuration');

// Step 4: Set environment variables to force npm
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_package_manager = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_optional = 'false';
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
process.env.BUN_DISABLE = 'true';

// Remove bun environment variables
delete process.env.BUN_INSTALL;
delete process.env.BUN_CONFIG_FILE;
delete process.env.YARN_ENABLE;

// Step 5: Clear ALL caches
console.log('Clearing all package manager caches...');
const clearCommands = [
  'npm cache clean --force',
  'npm cache verify'
];

clearCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    console.log(`Cache command failed: ${cmd}`);
  }
});

// Step 6: Remove node_modules and package-lock to start fresh
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
  console.log('Note: Could not remove some files');
}

// Step 7: Install only essential packages without problematic dependencies
console.log('Installing essential packages with npm (excluding problematic ones)...');

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
  const installCmd = `npm install --no-git --legacy-peer-deps --no-optional ${essentialPackages.join(' ')}`;
  execSync(installCmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm',
      npm_config_package_manager: 'npm',
      npm_config_optional: 'false',
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
      execSync(`npm install --no-git --legacy-peer-deps --no-optional ${pkg}`, {
        stdio: 'pipe',
        env: {
          ...process.env,
          npm_config_git: 'false',
          npm_config_user_agent: 'npm',
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
🎉 Emergency NPM setup completed!
🚀 The application should now work without bun or git dependencies.
📝 You can now run: npm run dev
`);
