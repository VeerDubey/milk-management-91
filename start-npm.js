
#!/usr/bin/env node

import { execSync } from 'child_process';

// Ensure npm is used
process.env.npm_config_user_agent = 'npm';
process.env.FORCE_NPM = 'true';
delete process.env.BUN_INSTALL;

console.log('🚀 Starting with npm...');

try {
  execSync('npm run dev', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_user_agent: 'npm',
      FORCE_NPM: 'true'
    }
  });
} catch (error) {
  console.error('Failed to start with npm');
  process.exit(1);
}
