
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 Running npm-only installation (no Git)...');

// Create .npmrc to disable git operations
const npmrcContent = `
registry=https://registry.npmjs.org/
git=false
legacy-peer-deps=true
fetch-timeout=600000
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());

// Define essential packages
const essentialPackages = [
  'react', 
  'react-dom', 
  'react-router-dom',
  'date-fns',
  'sonner',
  'lucide-react',
  '@radix-ui/react-dialog',
  '@radix-ui/react-tabs'
];

console.log('Installing essential packages without Git...');
try {
  execSync('npm install --no-git --legacy-peer-deps ' + essentialPackages.join(' '), { 
    stdio: 'inherit',
    env: { ...process.env, npm_config_git: 'false' }
  });
  
  console.log('✅ Essential packages installed successfully');
  
  // Try to install PDF generation packages separately
  console.log('Attempting to install PDF packages...');
  try {
    execSync('npm install --no-git --legacy-peer-deps jspdf@latest jspdf-autotable@latest', { 
      stdio: 'inherit',
      env: { ...process.env, npm_config_git: 'false' }
    });
    console.log('✅ PDF packages installed successfully');
  } catch (pdfError) {
    console.warn('⚠️ PDF packages installation failed, will use fallback preview');
  }
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('The application will use fallback preview mode');
  
  // Create minimal index.html for web-only mode if needed
  if (!fs.existsSync('./index.html')) {
    const minimalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Milk Center Management</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
    fs.writeFileSync('./index.html', minimalHtml);
    console.log('Created minimal index.html for web-only mode');
  }
}
