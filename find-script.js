
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the electron-scripts.js file
function findScript(startDir) {
  console.log(`Searching for electron-scripts.js in ${startDir}`);
  
  // Check if the file exists in the current directory
  const scriptPath = path.join(startDir, 'electron-scripts.js');
  if (fs.existsSync(scriptPath)) {
    console.log(`Found electron-scripts.js at: ${scriptPath}`);
    return scriptPath;
  }
  
  // Check parent directory (but not beyond the root)
  const parentDir = path.dirname(startDir);
  if (parentDir !== startDir) {
    return findScript(parentDir);
  }
  
  console.error('Could not find electron-scripts.js');
  return null;
}

// Find and execute the script
const scriptPath = findScript(__dirname);
if (scriptPath) {
  console.log(`Please run: node ${scriptPath} [command]`);
} else {
  console.error('Error: Could not locate electron-scripts.js');
}

