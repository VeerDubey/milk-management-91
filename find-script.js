
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

console.log(`
${colors.cyan}╔══════════════════════════════════════════════╗
║        Milk Center Management System         ║
║            Script Locator Utility            ║
╚══════════════════════════════════════════════╝${colors.reset}
`);

// Find the electron-scripts.js file
function findScript(startDir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return null;
  
  console.log(`${colors.bright}Searching for electron-scripts.js in ${startDir}${colors.reset}`);
  
  // Check if the file exists in the current directory
  const scriptPath = path.join(startDir, 'electron-scripts.js');
  if (fs.existsSync(scriptPath)) {
    console.log(`${colors.green}Found electron-scripts.js at: ${scriptPath}${colors.reset}`);
    return scriptPath;
  }
  
  // Check parent directory (but not beyond the root)
  const parentDir = path.dirname(startDir);
  if (parentDir !== startDir) {
    return findScript(parentDir, depth + 1, maxDepth);
  }
  
  console.error(`${colors.red}Could not find electron-scripts.js${colors.reset}`);
  return null;
}

// Look for alternative scripts if the main one isn't found
function findAlternativeScripts(startDir) {
  console.log(`\n${colors.yellow}Looking for alternative scripts...${colors.reset}`);
  
  const alternatives = [
    'package.json',
    'setup.js', 
    'install.js',
    'build.js'
  ];
  
  const found = [];
  
  for (const alt of alternatives) {
    const filePath = path.join(startDir, alt);
    if (fs.existsSync(filePath)) {
      console.log(`${colors.green}Found: ${alt}${colors.reset}`);
      found.push(alt);
    }
  }
  
  return found;
}

// Find and execute the script
const scriptPath = findScript(__dirname);
if (scriptPath) {
  console.log(`\n${colors.bright}${colors.green}Script found!${colors.reset}\n`);
  console.log(`Please run: ${colors.cyan}node ${scriptPath} [command]${colors.reset}`);
  console.log(`For example: ${colors.cyan}node ${scriptPath} start${colors.reset} to start the development server`);
  console.log(`Or: ${colors.cyan}node ${scriptPath} build${colors.reset} to build the application\n`);
} else {
  console.error(`\n${colors.red}Error: Could not locate electron-scripts.js${colors.reset}`);
  
  const alternatives = findAlternativeScripts(__dirname);
  
  if (alternatives.includes('package.json')) {
    console.log(`\n${colors.bright}Try running standard npm commands:${colors.reset}`);
    console.log(`${colors.cyan}npm install${colors.reset} - to install dependencies`);
    console.log(`${colors.cyan}npm run dev${colors.reset} - to start development server`);
    console.log(`${colors.cyan}npm run build${colors.reset} - to build the application`);
  }
  
  if (alternatives.includes('install.js')) {
    console.log(`\n${colors.bright}Try running the installation script:${colors.reset}`);
    console.log(`${colors.cyan}node install.js${colors.reset} - to set up the application`);
  }
}

// Provide help for creating the script if it's missing
if (!scriptPath) {
  console.log(`\n${colors.yellow}If you need to create electron-scripts.js, please use the installation script or check documentation.${colors.reset}`);
}
