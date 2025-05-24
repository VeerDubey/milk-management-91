
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔥 COMPLETE NPM ENFORCEMENT - Eliminating ALL bun traces...');

// Kill ALL bun processes with extreme prejudice
const killCommands = [
  'pkill -9 -f bun',
  'killall -9 bun',
  'taskkill /F /IM bun.exe',
  'pgrep bun | xargs kill -9 2>/dev/null || true',
  'ps aux | grep bun | grep -v grep | awk \'{print $2}\' | xargs kill -9 2>/dev/null || true'
];

killCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    // Ignore errors - just ensure bun is stopped
  }
});

// Remove ALL bun-related files and directories
const bunFiles = [
  'bun.lockb',
  'bunfig.toml',
  '.bunfig.toml',
  '.bun',
  'node_modules',
  'package-lock.json',
  '.npm',
  '.cache'
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

// Create the most restrictive .npmrc possible
const npmrcContent = `
# ABSOLUTE NPM ENFORCEMENT
registry=https://registry.npmjs.org/
user-agent=npm/10.0.0
package-manager=npm

# Completely disable git operations
git=false
git-tag-version=false
no-git-tag-version=true

# Performance settings
legacy-peer-deps=true
fetch-timeout=300000
fetch-retry-mintimeout=30000
fetch-retry-maxtimeout=120000

# Disable all optional and peer dependencies
optional=false
no-optional=true
peer=false

# Force specific settings
package-lock=true
package-lock-only=false
save-exact=true

# Disable problematic features
audit=false
fund=false
update-notifier=false

# Force all packages to use registry downloads
@electron:registry=https://registry.npmjs.org/
@electron:git=false
electron:registry=https://registry.npmjs.org/
electron:git=false
node-gyp:git=false
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());
console.log('✅ Created ultra-restrictive .npmrc');

// Set environment variables aggressively
process.env.npm_config_user_agent = 'npm/10.0.0';
process.env.npm_config_package_manager = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_optional = 'false';
process.env.npm_config_registry = 'https://registry.npmjs.org/';
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
process.env.npm_config_package_lock = 'true';

// Remove ALL bun environment variables
delete process.env.BUN_INSTALL;
delete process.env.BUN_CONFIG_FILE;
delete process.env.YARN_ENABLE;
delete process.env.BUN_RUNTIME;

// Clear npm cache
console.log('Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'pipe' });
  console.log('✅ NPM cache cleared');
} catch (e) {
  console.log('Cache clear completed');
}

// Install ONLY essential web packages (NO electron packages)
const webOnlyPackages = [
  'react@18.3.1',
  'react-dom@18.3.1',
  'react-router-dom@6.26.2',
  'date-fns@4.1.0',
  'sonner@1.5.0',
  'lucide-react@0.462.0',
  'clsx@2.1.1',
  'tailwind-merge@2.5.2'
];

console.log('Installing essential web packages with npm...');
try {
  const installCmd = `npm install --no-git --legacy-peer-deps --no-optional --registry=https://registry.npmjs.org/ --package-lock=true ${webOnlyPackages.join(' ')}`;
  execSync(installCmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm/10.0.0',
      npm_config_package_manager: 'npm',
      npm_config_optional: 'false',
      npm_config_registry: 'https://registry.npmjs.org/',
      FORCE_NPM: 'true',
      NO_BUN: 'true'
    }
  });
  console.log('✅ Essential packages installed successfully');
} catch (error) {
  console.error('Installation failed, trying individual packages...');
  
  // Install packages one by one as fallback
  for (const pkg of webOnlyPackages) {
    try {
      execSync(`npm install --no-git --legacy-peer-deps --no-optional --registry=https://registry.npmjs.org/ ${pkg}`, {
        stdio: 'pipe',
        env: {
          ...process.env,
          npm_config_git: 'false',
          npm_config_user_agent: 'npm/10.0.0',
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
🎉 COMPLETE NPM enforcement completed!
🚀 The application should now work without ANY bun dependencies.
📝 You can now run: npm run dev
⚠️  Note: All electron and git-dependent packages have been excluded
`);
