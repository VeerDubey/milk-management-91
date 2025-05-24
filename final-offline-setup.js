
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Final Offline Desktop Setup - Complete Solution...');

// Step 1: Complete cleanup
const filesToRemove = [
  'bun.lockb', '.bun', 'bunfig.toml', '.bunfig.toml',
  'node_modules', 'package-lock.json', '.npm'
];

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      execSync(`rm -rf "${file}"`, { stdio: 'pipe' });
      console.log(`✅ Removed ${file}`);
    }
  } catch (e) {
    console.log(`Note: Could not remove ${file}`);
  }
});

// Step 2: Create final package.json
const finalPackageJson = {
  "name": "milk-center-offline-desktop",
  "private": true,
  "version": "1.0.0",
  "type": "module",
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
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
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

fs.writeFileSync('package.json', JSON.stringify(finalPackageJson, null, 2));

// Step 3: Create .npmrc
fs.writeFileSync('.npmrc', `
registry=https://registry.npmjs.org/
legacy-peer-deps=true
package-lock=true
audit=false
fund=false
`.trim());

// Step 4: Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_NPM: 'true' }
  });
  console.log('✅ Installation complete!');
  
  // Step 5: Build and package
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Creating desktop package...');
  execSync('npm run package', { stdio: 'inherit' });
  
  console.log(`
🎉 Offline Desktop Application Ready!
📦 Package: milk-center-desktop.zip
🚀 Fully offline and portable
💡 No internet required after setup
  `);
  
} catch (error) {
  console.error('Setup failed:', error.message);
}
