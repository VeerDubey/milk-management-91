
#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting with pure npm...');

// Ensure npm environment
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_package_manager = 'npm';
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
delete process.env.BUN_INSTALL;

try {
  execSync('npm run dev', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_user_agent: 'npm',
      npm_config_package_manager: 'npm',
      FORCE_NPM: 'true',
      NO_BUN: 'true'
    }
  });
} catch (error) {
  console.error('Failed to start with npm:', error.message);
  console.log('Try running: node ultimate-npm-fix.js first');
}
