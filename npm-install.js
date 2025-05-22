
import { execSync } from 'child_process';

console.log('🛠️ Running npm install with fallback options...');

try {
  console.log('Attempting standard npm install...');
  execSync('npm install --legacy-peer-deps --no-git', { stdio: 'inherit' });
  console.log('✅ Installation successful!');
} catch (error) {
  console.error('❌ Standard install failed, trying with force flag...');
  try {
    execSync('npm install --legacy-peer-deps --force --no-git', { stdio: 'inherit' });
    console.log('✅ Force installation successful!');
  } catch (secondError) {
    console.error('❌ Force install failed too. Trying electron packages separately...');
    try {
      // Install electron separately first
      execSync('npm install --no-save electron electron-builder electron-is-dev --force --no-git', { stdio: 'inherit' });
      
      // Then try the problematic node-gyp package
      console.log('Installing node-gyp packages separately...');
      execSync('npm install --no-save @electron/node-gyp node-gyp --force --no-git', { stdio: 'inherit' });
      
      // Then try the rest
      execSync('npm install --legacy-peer-deps --no-git', { stdio: 'inherit' });
      console.log('✅ Split installation successful!');
    } catch (thirdError) {
      console.error('❌ Split install failed too. Last attempt with minimal dependencies...');
      try {
        // Install only the most essential packages
        execSync('npm install --no-save electron electron-builder react react-dom', { stdio: 'inherit' });
        console.log('⚠️ Minimal installation completed. Some features may not work.');
      } catch (finalError) {
        console.error('💥 All installation attempts failed.');
        console.error(finalError.message);
        process.exit(1);
      }
    }
  }
}
