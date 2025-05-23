
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 Running fallback installation...');

// Create .npmrc to avoid git operations
const npmrcContent = `
registry=https://registry.npmjs.org/
git=false
legacy-peer-deps=true
fetch-timeout=600000
`;

fs.writeFileSync('.npmrc', npmrcContent.trim());

// Essential packages only - avoiding problematic electron packages
const essentialPackages = [
  'react@^18.3.1',
  'react-dom@^18.3.1',
  'date-fns@^4.1.0',
  '@radix-ui/react-dialog@^1.1.2',
  '@radix-ui/react-tabs@^1.1.0',
  'sonner@^1.5.0',
  'lucide-react@^0.462.0'
];

try {
  console.log('Installing essential packages...');
  execSync(`npm install --no-git --legacy-peer-deps ${essentialPackages.join(' ')}`, { 
    stdio: 'inherit',
    env: { ...process.env, npm_config_git: 'false' }
  });
  
  console.log('✅ Essential packages installed successfully');
  
  // Try to install jsPDF separately
  try {
    console.log('Attempting to install PDF packages...');
    execSync('npm install --no-git --legacy-peer-deps jspdf@^3.0.1', { 
      stdio: 'inherit',
      env: { ...process.env, npm_config_git: 'false' }
    });
    console.log('✅ PDF packages installed');
  } catch (pdfError) {
    console.warn('⚠️ PDF packages failed to install, using fallback preview');
  }
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('The application will use fallback preview mode.');
}
