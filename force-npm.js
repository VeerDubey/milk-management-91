
#!/usr/bin/env node

// Simple script to force npm usage and disable bun completely
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚫 Disabling bun and forcing npm...');

// Kill all bun processes
try {
  execSync('pkill -f bun', { stdio: 'pipe' });
  execSync('killall bun', { stdio: 'pipe' });
} catch (e) {
  // Ignore
}

// Remove bun files
['bun.lockb', 'bunfig.toml', '.bunfig.toml'].forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {}
});

// Set environment
process.env.npm_config_user_agent = 'npm';
process.env.FORCE_NPM = 'true';
delete process.env.BUN_INSTALL;

// Create .npmrc
fs.writeFileSync('.npmrc', `
registry=https://registry.npmjs.org/
git=false
legacy-peer-deps=true
user-agent=npm
package-manager=npm
`);

console.log('✅ Npm forced, bun disabled');
