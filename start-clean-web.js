
#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🌐 Starting clean web application...');

// Ensure clean npm environment
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
delete process.env.BUN_INSTALL;

try {
  execSync('npm run dev', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_NPM: 'true',
      NO_BUN: 'true'
    }
  });
} catch (error) {
  console.error('Failed to start:', error.message);
  console.log('Try running: node fix-web-only-final.js first');
}
