
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('📦 Creating desktop package...');

// Create desktop package structure
const packageDir = 'milk-center-desktop';

// Remove existing package
if (fs.existsSync(packageDir)) {
  fs.rmSync(packageDir, { recursive: true, force: true });
}

// Create package directory
fs.mkdirSync(packageDir, { recursive: true });

// Copy built application
if (fs.existsSync('dist')) {
  execSync(`cp -r dist/* ${packageDir}/`, { stdio: 'pipe' });
} else {
  console.error('❌ No dist folder found. Run "npm run build" first.');
  process.exit(1);
}

// Create launcher script for different platforms
const launcherScripts = {
  'start-windows.bat': `@echo off
start "" "index.html"`,
  'start-mac.sh': `#!/bin/bash
open index.html`,
  'start-linux.sh': `#!/bin/bash
xdg-open index.html`
};

Object.entries(launcherScripts).forEach(([filename, content]) => {
  fs.writeFileSync(path.join(packageDir, filename), content);
  if (filename.endsWith('.sh')) {
    execSync(`chmod +x ${path.join(packageDir, filename)}`, { stdio: 'pipe' });
  }
});

// Create README
const readmeContent = `# Milk Center Desktop Application

## How to Run

### Windows
Double-click \`start-windows.bat\`

### Mac
Double-click \`start-mac.sh\`

### Linux
Double-click \`start-linux.sh\` or run in terminal

## Features
- Complete offline operation
- All data stored locally in browser
- No internet connection required after initial setup
- Full milk center management capabilities

## System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required
`;

fs.writeFileSync(path.join(packageDir, 'README.md'), readmeContent);

// Create zip package
try {
  execSync(`zip -r milk-center-desktop.zip ${packageDir}`, { stdio: 'inherit' });
  console.log('✅ Desktop package created: milk-center-desktop.zip');
} catch (error) {
  console.log('Note: ZIP creation failed, but folder is ready at:', packageDir);
}

console.log(`
🎉 Desktop package ready!
📁 Folder: ${packageDir}/
📦 ZIP: milk-center-desktop.zip
🚀 Fully offline and portable
`);
