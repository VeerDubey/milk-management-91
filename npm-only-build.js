
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Running npm-only build script (no git)...');

// Kill any bun processes
try {
  execSync('pkill -f bun', { stdio: 'pipe' });
} catch (e) {
  // Ignore errors
}

// Set environmental variables
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_package_manager = 'npm';
delete process.env.BUN_INSTALL;

// Remove problematic files
const filesToRemove = [
  'bun.lockb',
  'bunfig.toml',
  '.bunfig.toml'
];

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    // Ignore errors
  }
});

// Create or update package-lock.json to enforce npm
try {
  execSync('npm install --package-lock-only --no-git', {
    stdio: 'pipe',
    env: { ...process.env, npm_config_git: 'false' }
  });
  console.log('✅ Created package-lock.json for npm');
} catch (e) {
  console.log('Note: Could not create package-lock.json');
}

// Install essential packages directly without git
const essentialPackages = [
  'react',
  'react-dom',
  'date-fns',
  'sonner',
  'lucide-react',
  'clsx',
  'tailwind-merge',
  '@radix-ui/react-dialog',
  '@radix-ui/react-tabs',
  '@hookform/resolvers',
  'react-hook-form'
];

console.log('Installing essential packages (no git)...');
try {
  const npmInstallCommand = `npm install --no-git --legacy-peer-deps ${essentialPackages.join(' ')}`;
  execSync(npmInstallCommand, {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm'
    }
  });
  
  console.log('✅ Essential packages installed successfully');
} catch (error) {
  console.error('❌ Failed to install packages:', error.message);
  
  // Try installing packages one by one as fallback
  console.log('🔄 Attempting to install packages individually...');
  for (const pkg of essentialPackages) {
    try {
      console.log(`Installing ${pkg}...`);
      execSync(`npm install --no-git --legacy-peer-deps ${pkg}`, {
        stdio: 'pipe',
        env: { ...process.env, npm_config_git: 'false' }
      });
    } catch (e) {
      console.log(`⚠️ Couldn't install ${pkg}, continuing...`);
    }
  }
}

// Install jspdf packages separately since they often cause issues
try {
  console.log('Installing PDF generation packages...');
  execSync('npm install --no-git --legacy-peer-deps jspdf jspdf-autotable', {
    stdio: 'pipe',
    env: { ...process.env, npm_config_git: 'false' }
  });
  console.log('✅ PDF packages installed successfully');
} catch (pdfError) {
  console.log('⚠️ Could not install PDF packages, using fallback preview');
}

console.log(`
✅ Build preparation completed!
🚀 The application should now run with npm only, without any git dependencies.
`);
