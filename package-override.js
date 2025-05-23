
#!/usr/bin/env node

// Override any package manager detection to force npm
import fs from 'fs';

console.log('🔧 Overriding package manager detection...');

// Create package-lock.json to force npm detection
const packageLockContent = {
  "name": "milk-center-management",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "milk-center-management",
      "version": "0.1.0"
    }
  }
};

fs.writeFileSync('package-lock.json', JSON.stringify(packageLockContent, null, 2));

// Create npm configuration
const npmConfig = `
registry=https://registry.npmjs.org/
git=false
legacy-peer-deps=true
user-agent=npm
package-manager=npm
optional=false
`;

fs.writeFileSync('.npmrc', npmConfig);

console.log('✅ Package manager forced to npm');
