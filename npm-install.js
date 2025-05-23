
import { execSync } from 'child_process';

console.log('🛠️ Running npm install with fallback options...');

// Define required packages for the project
const requiredPackages = [
  'jspdf', 
  'jspdf-autotable', 
  '@radix-ui/react-popover', 
  '@radix-ui/react-tabs', 
  'react-day-picker', 
  'date-fns'
];

// Try different installation approaches
const installApproaches = [
  { 
    name: 'Standard install with no-git', 
    command: `npm install --legacy-peer-deps --no-git ${requiredPackages.join(' ')}` 
  },
  { 
    name: 'Force install with no-git', 
    command: `npm install --legacy-peer-deps --force --no-git ${requiredPackages.join(' ')}` 
  },
  { 
    name: 'Web-only install without optional dependencies', 
    command: `npm install --omit=optional --no-git ${requiredPackages.join(' ')}` 
  },
  { 
    name: 'Install packages individually', 
    command: requiredPackages.map(pkg => `npm install --no-git ${pkg}`).join(' && ') 
  }
];

// Try each approach until one succeeds
let success = false;
for (const approach of installApproaches) {
  try {
    console.log(`Attempting ${approach.name}...`);
    execSync(approach.command, { stdio: 'inherit' });
    console.log(`✅ ${approach.name} successful!`);
    success = true;
    break;
  } catch (error) {
    console.error(`❌ ${approach.name} failed: ${error.message}`);
    console.log('Trying next approach...');
  }
}

if (!success) {
  console.error('💥 All installation attempts failed.');
  console.error('Consider creating a minimal reproduction or using a CDN for required libraries.');
  process.exit(1);
} else {
  console.log('✅ Installation completed successfully!');
}
