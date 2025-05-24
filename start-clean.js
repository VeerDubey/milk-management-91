
#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting clean web application...');

// Set npm environment
process.env.npm_config_user_agent = 'npm';
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
delete process.env.BUN_INSTALL;

try {
  execSync('npm run dev', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_user_agent: 'npm',
      FORCE_NPM: 'true',
      NO_BUN: 'true'
    }
  });
} catch (error) {
  console.error('Failed to start:', error.message);
  console.log('Try running: node force-web-only.js first');
}
