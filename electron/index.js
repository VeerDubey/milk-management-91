
// This is a simple index file to facilitate module exports in Electron

// Import and re-export main modules
import appLifecycle from './app-lifecycle.js';
import windowManager from './window-manager.js';
import { app } from 'electron';

// Export a simplified API
export {
  app,
  appLifecycle,
  windowManager
};

// Add a default export for ESM compatibility
export default {
  app,
  appLifecycle,
  windowManager
};
