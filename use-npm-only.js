
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Configuring project to use npm only (avoiding bun/yarn)...');

// Create .npmrc if it doesn't exist
const npmrcContent = `
registry=https://registry.npmjs.org/
fetch-timeout=600000
fetch-retry-mintimeout=60000
fetch-retry-maxtimeout=300000
legacy-peer-deps=true
prefer-offline=true
git=false
git-tag-version=false
no-git-tag-version=true
strict-ssl=true
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());

// Remove bun lockfile if it exists
try {
  if (fs.existsSync('bun.lockb')) {
    fs.unlinkSync('bun.lockb');
    console.log('Removed bun.lockb');
  }
} catch (e) {
  console.log('No bun lockfile to remove');
}

// Set environment variables to force npm
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';

console.log('✅ Project configured for npm-only usage');

// Run npm install
try {
  console.log('Running npm install...');
  execSync('npm install --legacy-peer-deps --no-git', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm'
    }
  });
  console.log('✅ npm install completed successfully');
} catch (error) {
  console.error('❌ npm install failed:', error.message);
  console.log('Try running: node npm-install.js');
}
