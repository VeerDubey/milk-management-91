
/**
 * Auto-updater module for the Electron app
 * Currently configured for offline-only mode
 */
import { dialog } from 'electron';
import log from 'electron-log';

class AppUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    
    // Store reference to updater globally
    global.updater = this;
    
    log.info('AppUpdater initialized in offline-only mode');
  }
  
  async checkForUpdates() {
    log.info('Update checking disabled in offline mode');
    // Always return false in offline mode
    return false;
  }
  
  async downloadUpdate() {
    log.info('Update downloading disabled in offline mode');
    // Always return false in offline mode
    return false;
  }
  
  quitAndInstall() {
    log.info('Update installation disabled in offline mode');
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Offline Mode',
      message: 'This application is configured for offline use only.',
      detail: 'Please check for new versions manually at the official website.',
      buttons: ['OK']
    });
  }
}

export default AppUpdater;
