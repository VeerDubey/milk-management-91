
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Package Resolution Helper');

// Core packages needed for the application
const corePackages = [
  'react', 
  'react-dom', 
  'react-router-dom', 
  'date-fns',
  '@radix-ui/react-popover',
  '@radix-ui/react-tabs',
  'react-day-picker',
  'sonner',
  'clsx',
  'jspdf',
  'jspdf-autotable'
];

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

try {
  // Create .npmrc file to optimize installation
  console.log('Creating .npmrc configuration...');
  const npmrcContent = `
registry=https://registry.npmjs.org/
fetch-timeout=600000
fetch-retry-mintimeout=60000
fetch-retry-maxtimeout=300000
legacy-peer-deps=true
prefer-offline=true
git=false
git-tag-version=false
`;
  fs.writeFileSync(path.join(__dirname, '.npmrc'), npmrcContent.trim());
  console.log('✅ Created .npmrc configuration');
  
  // Install core packages
  console.log('Installing core packages...');
  execSync(`npm install --no-git ${corePackages.join(' ')}`, { stdio: 'inherit' });
  
  console.log('✅ Core packages installed successfully');
  
  // Create a temporary index.html file if needed for web-only mode
  const indexPath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('Creating fallback index.html...');
    const indexContent = `
<!DOCTYPE html>
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
    
    fs.writeFileSync(indexPath, indexContent.trim());
    console.log('✅ Created fallback index.html');
  }
  
  // Ensure PDF utils are available
  console.log('Checking PDF utility availability...');
  const pdfUtilsPath = path.join(__dirname, 'src', 'utils', 'pdfUtils.ts');
  if (!fs.existsSync(pdfUtilsPath)) {
    console.log('Creating fallback PDF utilities...');
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

export const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return '₹0.00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '₹0.00';
  }
  
  return \`₹\${numValue.toFixed(2)}\`;
};

export const safeNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return isNaN(numValue) ? 0 : numValue;
};`;
    
    // Ensure the directory exists
    const utilsDir = path.join(__dirname, 'src', 'utils');
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }
    
    fs.writeFileSync(pdfUtilsPath, fallbackContent);
    console.log('✅ Created fallback PDF utilities');
  }
  
  console.log('✅ Package resolution completed');
  
} catch (error) {
  console.error(`❌ Error resolving packages: ${error.message}`);
  console.log('Please try running the installation manually with:');
  console.log('npm install --no-git --legacy-peer-deps');
  process.exit(1);
}
