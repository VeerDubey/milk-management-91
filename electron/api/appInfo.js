
import { app } from 'electron';
import os from 'os';
import path from 'path';

/**
 * Application information API
 */
class AppInfoAPI {
  /**
   * Get application version
   * @returns {string} Application version
   */
  static getVersion() {
    return app.getVersion();
  }

  /**
   * Get detailed system information
   * @returns {Object} System information
   */
  static getSystemInfo() {
    return {
      platform: process.platform,
      osVersion: os.release(),
      osName: os.type(),
      architecture: os.arch(),
      cpuCores: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)),
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome
    };
  }

  /**
   * Get application paths
   * @returns {Object} Application paths
   */
  static getAppPaths() {
    return {
      appData: app.getPath('appData'),
      userData: app.getPath('userData'),
      temp: app.getPath('temp'),
      exe: app.getPath('exe'),
      desktop: app.getPath('desktop'),
      documents: app.getPath('documents'),
      downloads: app.getPath('downloads'),
      logs: path.join(app.getPath('userData'), 'logs')
    };
  }
}

export default AppInfoAPI;
