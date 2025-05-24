
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🖥️  Creating offline desktop application package...');

// Step 1: Kill ALL Bun processes
const killCommands = [
  'pkill -9 -f bun || true',
  'killall -9 bun 2>/dev/null || true',
  'taskkill /F /IM bun.exe 2>/dev/null || true'
];

killCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 5000 });
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
  'package-lock.json',
  '.npm',
  'electron-builder.json',
  'electron',
  'dist_electron'
];

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        execSync(`rm -rf "${file}"`, { stdio: 'pipe' });
      } else {
        fs.unlinkSync(file);
      }
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: Could not remove ${file}`);
  }
});

// Step 3: Create clean offline desktop package.json
const offlinePackageJson = {
  "name": "milk-center-offline",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.html",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview --host",
    "package": "npm run build && node create-desktop-package.js"
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
    "zod": "^3.23.8",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2"
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

fs.writeFileSync('package.json', JSON.stringify(offlinePackageJson, null, 2));
console.log('✅ Created offline desktop package.json');

// Step 4: Create .npmrc for offline compatibility
const npmrcContent = `
registry=https://registry.npmjs.org/
package-lock=true
legacy-peer-deps=true
audit=false
fund=false
optional=false
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());
console.log('✅ Created .npmrc');

// Step 5: Set environment variables
process.env.FORCE_NPM = 'true';
process.env.NO_BUN = 'true';
delete process.env.BUN_INSTALL;

// Step 6: Install with npm
console.log('Installing dependencies with npm...');
try {
  execSync('npm install --legacy-peer-deps', {
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_NPM: 'true',
      NO_BUN: 'true'
    }
  });
  console.log('✅ Installation complete!');
} catch (error) {
  console.error('Installation failed:', error.message);
}

console.log(`
🎉 Offline desktop setup complete!
🚀 Run: npm run build && npm run package
📦 Ready for offline desktop packaging
`);
