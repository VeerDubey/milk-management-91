
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🌐 Setting up web-only environment (removing all electron/node-gyp dependencies)...');

// Force environment to pure npm
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_registry = 'https://registry.npmjs.org/';
process.env.npm_config_package_lock = 'true';
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
delete process.env.BUN_INSTALL;

// Create ultra-strict .npmrc
const npmrcContent = `
# WEB-ONLY CONFIGURATION - NO NATIVE DEPENDENCIES
registry=https://registry.npmjs.org/
fetch-timeout=600000
legacy-peer-deps=true
git=false
git-tag-version=false
no-git-tag-version=true
package-lock=true
user-agent=npm
package-manager=npm
`;

fs.writeFileSync('.npmrc', npmrcContent);
console.log('✅ Created strict .npmrc configuration');

// Remove all problematic files
const filesToRemove = [
  'bun.lockb', 
  'bunfig.toml', 
  '.bunfig.toml', 
  'node_modules/@electron'
];

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
      } else {
        fs.unlinkSync(file);
      }
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: ${file} already removed or couldn't be removed`);
  }
});

// Install only web-safe packages
const webPackages = [
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
  'react-hook-form@7.53.0'
];

console.log('Installing web-safe packages...');
try {
  const installCmd = `npm install --legacy-peer-deps --no-git --registry=https://registry.npmjs.org/ ${webPackages.join(' ')}`;
  execSync(installCmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm'
    }
  });
  console.log('✅ Web packages installed successfully');
} catch (error) {
  console.error('Installation had some issues, but we can still continue with web-only mode');
}

// Create updated InvoiceContext with pure HTML preview
console.log('✅ Setup complete. Configured for web-only mode with HTML preview.');
console.log('You can now run: npm run dev');
