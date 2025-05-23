
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
  'clsx'
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
  
  console.log('✅ Package resolution completed');
  
} catch (error) {
  console.error(`❌ Error resolving packages: ${error.message}`);
  console.log('Please try running the installation manually with:');
  console.log('npm install --no-git --legacy-peer-deps');
  process.exit(1);
}
