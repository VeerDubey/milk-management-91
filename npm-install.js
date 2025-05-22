
import { execSync } from 'child_process';

console.log('🛠️ Running npm install with fallback options...');

try {
  console.log('Attempting standard npm install...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Installation successful!');
} catch (error) {
  console.error('❌ Standard install failed, trying with force flag...');
  try {
    execSync('npm install --legacy-peer-deps --force --no-git', { stdio: 'inherit' });
    console.log('✅ Force installation successful!');
  } catch (secondError) {
    console.error('❌ Force install failed too. Last attempt with minimal dependencies...');
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
