
#!/usr/bin/env node

// Emergency npm-only script for when everything else fails
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🆘 Emergency NPM-only setup...');

// Kill any bun processes
try {
  execSync('pkill -f bun', { stdio: 'pipe' });
} catch (e) {
  // Ignore if no bun processes
}

// Set environment to force npm
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';
delete process.env.BUN_INSTALL;
delete process.env.YARN_ENABLE;

// Minimal .npmrc
fs.writeFileSync('.npmrc', 'registry=https://registry.npmjs.org/\ngit=false\nlegacy-peer-deps=true');

// Remove bun files
['bun.lockb', 'bunfig.toml'].forEach(file => {
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (e) {}
});

// Force npm install
try {
  console.log('Running emergency npm install...');
  execSync('npm install --legacy-peer-deps --no-git', { 
    stdio: 'inherit',
    env: { ...process.env, npm_config_git: 'false' }
  });
  console.log('✅ Emergency installation complete');
} catch (error) {
  console.error('❌ Emergency installation failed');
  console.log('Manual steps: rm -rf node_modules && npm cache clean --force && npm install');
}
