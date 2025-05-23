
import { execSync } from 'child_process';

console.log('🛠️ Running npm install with fallback options...');

// Force npm usage and avoid bun/yarn
process.env.npm_config_user_agent = 'npm';
process.env.npm_config_git = 'false';
process.env.npm_config_git_tag_version = 'false';

// Define required packages for the project
const requiredPackages = [
  'jspdf', 
  'jspdf-autotable', 
  '@radix-ui/react-popover', 
  '@radix-ui/react-tabs', 
  'react-day-picker', 
  'date-fns'
];

// Try different installation approaches with explicit npm usage
const installApproaches = [
  { 
    name: 'Standard npm install with no-git', 
    command: `npm install --legacy-peer-deps --no-git --registry=https://registry.npmjs.org/ ${requiredPackages.join(' ')}` 
  },
  { 
    name: 'Installing packages directly from npm registry with force', 
    command: `npm install --legacy-peer-deps --force --no-git --registry=https://registry.npmjs.org/ ${requiredPackages.join(' ')}` 
  },
  { 
    name: 'Web-only install without optional dependencies', 
    command: `npm install --omit=optional --omit=dev --no-git --registry=https://registry.npmjs.org/ ${requiredPackages.join(' ')}` 
  },
  { 
    name: 'Install packages individually with npm', 
    command: requiredPackages.map(pkg => `npm install --no-git --registry=https://registry.npmjs.org/ ${pkg}`).join(' && ') 
  },
  {
    name: 'Direct tarball installation for problematic packages',
    command: 'npm install --no-git --registry=https://registry.npmjs.org/ https://registry.npmjs.org/jspdf/-/jspdf-3.0.1.tgz && npm install --no-git --registry=https://registry.npmjs.org/ https://registry.npmjs.org/jspdf-autotable/-/jspdf-autotable-5.0.2.tgz'
  }
];

// Try each approach until one succeeds
let success = false;
for (const approach of installApproaches) {
  try {
    console.log(`Attempting ${approach.name}...`);
    execSync(approach.command, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_git: 'false',
        npm_config_user_agent: 'npm'
      }
    });
    console.log(`✅ ${approach.name} successful!`);
    success = true;
    break;
  } catch (error) {
    console.error(`❌ ${approach.name} failed: ${error.message}`);
    console.log('Trying next approach...');
  }
}

if (!success) {
  console.error('💥 All npm installation attempts failed.');
  console.error('Consider creating a minimal reproduction or using a CDN for required libraries.');
  
  // Create fallback adapter for PDF functionality
  console.log('Creating fallback adapter for PDF functionality...');
  try {
    const fallbackPath = './src/utils/pdfFallback.ts';
    const fallbackContent = `
// Fallback PDF utilities when jspdf is not available
export const exportToPdf = () => {
  console.warn('PDF export is not available in this environment');
  return null;
};

export const generatePdfPreview = () => {
  console.warn('PDF preview is not available in this environment');
  return null;
};

export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '₹0.00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '₹0.00';
  }
  
  return \`₹\${numValue.toFixed(2)}\`;
};

export const safeNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return isNaN(numValue) ? 0 : numValue;
};`;
    
    const fs = await import('fs');
    fs.writeFileSync(fallbackPath, fallbackContent);
    console.log('✅ Created fallback PDF utilities');
  } catch (err) {
    console.error('Failed to create fallback:', err);
  }
  
  process.exit(1);
} else {
  console.log('✅ Installation completed successfully with npm!');
}
