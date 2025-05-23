
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
    console.error('❌ Force install failed too. Trying web-only installation...');
    try {
      // Skip Electron packages completely
      execSync('npm install --omit=optional --no-git', { stdio: 'inherit' });
      console.log('✅ Web-only installation successful! (Electron features will be unavailable)');
    } catch (thirdError) {
      console.error('💥 All installation attempts failed.');
      console.error(thirdError.message);
      process.exit(1);
    }
  }
}
