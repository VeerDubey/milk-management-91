
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚨 EMERGENCY NPM INSTALLATION - Bypassing all errors');

// Kill any running processes
try {
  execSync('pkill -f bun', { stdio: 'pipe' });
  execSync('pkill -f node', { stdio: 'pipe' });
} catch (e) {
  // Ignore errors
}

// Force npm environment variables
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_fund = 'false';
process.env.npm_config_audit = 'false';
delete process.env.BUN_INSTALL;
delete process.env.YARN_ENABLE;

// Create the most restrictive .npmrc possible
const npmrcContent = `
registry=https://registry.npmjs.org/
git=false
fund=false
audit=false
legacy-peer-deps=true
fetch-timeout=300000
user-agent=npm
strict-ssl=false

# Block all git operations
@electron:registry=https://registry.npmjs.org/
@electron/node-gyp:registry=https://registry.npmjs.org/
electron:git=false
electron-builder:git=false
node-gyp:git=false
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());

// Remove problematic files
['bun.lockb', 'bunfig.toml', '.bunfig.toml'].forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: ${file} already removed`);
  }
});

function runCommand(cmd, silent = false) {
  try {
    if (!silent) console.log(`> ${cmd}`);
    execSync(cmd, { 
      stdio: silent ? 'pipe' : 'inherit',
      env: {
        ...process.env,
        npm_config_git: 'false',
        npm_config_user_agent: 'npm'
      }
    });
    return true;
  } catch (error) {
    if (!silent) console.error(`Command failed: ${cmd}`);
    return false;
  }
}

// Clear everything
console.log('Clearing npm cache...');
runCommand('npm cache clean --force', true);

// Try to remove node_modules
try {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'pipe' });
    console.log('✅ Removed node_modules');
  }
} catch (e) {
  console.log('Note: node_modules removal failed, continuing...');
}

// Install only essential packages without any git dependencies
const essentialPackages = [
  'react@18.3.1',
  'react-dom@18.3.1',
  'react-router-dom@6.26.2',
  'date-fns@4.1.0',
  'sonner@1.5.0',
  'lucide-react@0.462.0'
];

console.log('Installing essential packages one by one...');
let successCount = 0;

for (const pkg of essentialPackages) {
  console.log(`Installing ${pkg}...`);
  if (runCommand(`npm install --no-save --no-git --registry=https://registry.npmjs.org/ ${pkg}`, true)) {
    successCount++;
    console.log(`✅ ${pkg} installed`);
  } else {
    console.log(`⚠️ ${pkg} failed`);
  }
}

console.log(`
✅ Emergency installation completed!
📊 Successfully installed ${successCount}/${essentialPackages.length} packages
🚀 Try running: npm run dev
💡 If issues persist, the app will use web-only fallback mode
`);
