
#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting Milk Center Management System...');

// Force npm environment
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';

try {
  // Try to start with npm
  console.log('Starting with npm...');
  execSync('npm run dev', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_user_agent: 'npm'
    }
  });
} catch (error) {
  console.error('Failed to start application:', error.message);
  console.log('Please run: node install.js first');
}
