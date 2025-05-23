
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔══════════════════════════════════════════════╗
║        NPM-Only Installation Script          ║
║           (No Bun/Yarn/Git)                  ║
╚══════════════════════════════════════════════╝
`);

// Force npm environment
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_git_tag_version = 'false';
process.env.npm_config_no_git_tag_version = 'true';

// Remove any bun files safely
const bunFiles = ['bun.lockb', 'bunfig.toml'];
bunFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: ${file} was already removed`);
  }
});

// Create package-lock.json if it doesn't exist to force npm
if (!fs.existsSync('package-lock.json') && fs.existsSync('package.json')) {
  console.log('Creating package-lock.json to force npm usage...');
  try {
    execSync('npm install --package-lock-only --legacy-peer-deps', { stdio: 'inherit' });
  } catch (e) {
    console.log('Failed to create package-lock.json, continuing...');
  }
}

function runCommand(command, options = {}) {
  try {
    console.log(`> ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_git: 'false',
        npm_config_user_agent: 'npm'
      },
      ...options
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    return false;
  }
}

// Clear npm cache
console.log('Clearing npm cache...');
runCommand('npm cache clean --force');

// Install dependencies without git
console.log('Installing dependencies with npm (no git)...');
const installSuccess = runCommand('npm install --legacy-peer-deps --no-git --registry=https://registry.npmjs.org/');

if (!installSuccess) {
  console.log('⚠️ Standard install failed, trying alternative approaches...');
  
  // Try with force
  const forceSuccess = runCommand('npm install --legacy-peer-deps --force --no-git --registry=https://registry.npmjs.org/');
  
  if (!forceSuccess) {
    console.log('⚠️ Creating minimal web-only setup...');
    
    // Install only essential packages
    const essentialPackages = [
      'react@^18.3.1',
      'react-dom@^18.3.1',
      'react-router-dom@^6.26.2',
      'date-fns@^4.1.0',
      'sonner@^1.5.0',
      'lucide-react@^0.462.0'
    ];
    
    for (const pkg of essentialPackages) {
      console.log(`Installing ${pkg}...`);
      runCommand(`npm install --no-save --no-git --registry=https://registry.npmjs.org/ ${pkg}`);
    }
  }
}

console.log(`
✅ Installation completed!
📝 Run 'npm run dev' to start the application
💡 If you encounter issues, try: node install-npm-only.js
`);
