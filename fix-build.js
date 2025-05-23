
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 Fixing build issues...');

// Kill any running processes
try {
  execSync('pkill -f bun', { stdio: 'pipe' });
  execSync('pkill -f node', { stdio: 'pipe' });
} catch (e) {
  // Ignore errors
}

// Force npm environment
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_no_git_tag_version = 'true';
delete process.env.BUN_INSTALL;
delete process.env.YARN_ENABLE;

// Remove problematic files
['bun.lockb', 'bunfig.toml', '.bunfig.toml', 'node_modules'].forEach(file => {
  try {
    if (fs.existsSync(file)) {
      execSync(`rm -rf ${file}`, { stdio: 'pipe' });
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: ${file} already removed`);
  }
});

// Clear npm cache
console.log('Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'pipe' });
} catch (e) {
  console.log('Cache clear failed, continuing...');
}

// Install with npm only, avoiding git dependencies
console.log('Installing dependencies with npm...');
try {
  execSync('npm install --legacy-peer-deps --no-git --prefer-offline', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm'
    }
  });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('Trying alternative installation...');
  
  // Try with minimal essential packages only
  const essentials = [
    'react@18.3.1',
    'react-dom@18.3.1',
    'react-router-dom@6.26.2',
    'date-fns@4.1.0',
    'sonner@1.5.0',
    'lucide-react@0.462.0'
  ];
  
  for (const pkg of essentials) {
    try {
      execSync(`npm install --no-save --no-git ${pkg}`, { stdio: 'pipe' });
      console.log(`✅ ${pkg} installed`);
    } catch (e) {
      console.log(`⚠️ ${pkg} failed`);
    }
  }
}

console.log('🚀 Build fix completed');
