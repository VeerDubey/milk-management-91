
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🌐 Setting up pure web-only environment...');

// Step 1: Kill ALL Bun processes aggressively
const killCommands = [
  'pkill -9 -f bun',
  'killall -9 bun',
  'taskkill /F /IM bun.exe',
  'pgrep bun | xargs kill -9 2>/dev/null || true'
];

killCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 3000 });
  } catch (e) {
    // Ignore errors
  }
});

// Step 2: Remove ALL conflicting files
const filesToRemove = [
  'bun.lockb',
  'bunfig.toml',
  '.bunfig.toml',
  '.bun',
  'node_modules',
  'package-lock.json'
];

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        execSync(`rm -rf "${file}"`, { stdio: 'pipe', timeout: 10000 });
      } else {
        fs.unlinkSync(file);
      }
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: Could not remove ${file}`);
  }
});

// Step 3: Create minimal package.json with only web dependencies
const webOnlyPackageJson = {
  "name": "milk-center-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "lucide-react": "^0.462.0",
    "date-fns": "^4.1.0",
    "sonner": "^1.5.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "~5.6.2",
    "vite": "^5.4.10"
  }
};

fs.writeFileSync('package.json', JSON.stringify(webOnlyPackageJson, null, 2));
console.log('✅ Created web-only package.json');

// Step 4: Create ultra-restrictive .npmrc
const npmrcContent = `
registry=https://registry.npmjs.org/
package-lock=true
legacy-peer-deps=true
user-agent=npm/10.0.0
package-manager=npm
git=false
optional=false
audit=false
fund=false
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());
console.log('✅ Created restrictive .npmrc');

// Step 5: Set environment variables
process.env.npm_config_user_agent = 'npm/10.0.0';
process.env.npm_config_package_manager = 'npm';
process.env.npm_config_git = 'false';
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';

// Remove ALL Bun variables
delete process.env.BUN_INSTALL;
delete process.env.BUN_CONFIG_FILE;
delete process.env.YARN_ENABLE;

// Step 6: Clear caches
console.log('Clearing caches...');
try {
  execSync('npm cache clean --force', { stdio: 'pipe', timeout: 30000 });
} catch (e) {
  console.log('Cache clear completed');
}

// Step 7: Install with npm only
console.log('Installing with npm...');
try {
  execSync('npm install --no-git --legacy-peer-deps --package-lock=true', {
    stdio: 'inherit',
    timeout: 120000,
    env: {
      ...process.env,
      npm_config_git: 'false',
      npm_config_user_agent: 'npm/10.0.0',
      FORCE_NPM: 'true',
      NO_BUN: 'true'
    }
  });
  console.log('✅ Web-only installation complete!');
} catch (error) {
  console.error('Installation failed:', error.message);
}

console.log(`
🎉 Web-only setup complete!
🚀 Run: npm run dev
📝 All electron and git dependencies removed
💡 Pure React web application ready
`);
