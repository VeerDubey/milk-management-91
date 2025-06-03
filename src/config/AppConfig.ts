
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
    offlineMode: boolean;
    multiTenant: boolean;
  };
  database: {
    name: string;
    version: number;
    syncEnabled: boolean;
    backupInterval: number; // in hours
  };
  auth: {
    sessionTimeout: number; // in minutes
    maxLoginAttempts: number;
    requireTwoFactor: boolean;
  };
  business: {
    currency: string;
    taxRate: number;
    fiscalYearStart: string; // MM-DD format
    supportedLanguages: string[];
  };
  sync: {
    cloudProvider: 'none' | 'aws' | 'googlecloud' | 'azure';
    syncInterval: number; // in minutes
    conflictResolution: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  };
  licensing: {
    licenseKey?: string;
    centerCount: number;
    expiryDate?: string;
    features: string[];
  };
}

export const defaultConfig: AppConfig = {
  app: {
    name: 'Vikas Milk Centre Pro',
    version: '2.0.0',
    environment: 'development',
    offlineMode: true,
    multiTenant: true
  },
  database: {
    name: 'vikas_milk_db',
    version: 1,
    syncEnabled: true,
    backupInterval: 24
  },
  auth: {
    sessionTimeout: 480, // 8 hours
    maxLoginAttempts: 5,
    requireTwoFactor: false
  },
  business: {
    currency: 'INR',
    taxRate: 18, // GST 18%
    fiscalYearStart: '04-01', // April 1st
    supportedLanguages: ['en', 'hi', 'mr']
  },
  sync: {
    cloudProvider: 'none',
    syncInterval: 30,
    conflictResolution: 'client-wins'
  },
  licensing: {
    centerCount: 1,
    features: ['basic', 'offline', 'analytics']
  }
};

export class ConfigManager {
  private static config: AppConfig = defaultConfig;

  static getConfig(): AppConfig {
    return this.config;
  }

  static updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    localStorage.setItem('app_config', JSON.stringify(this.config));
  }

  static loadConfig(): void {
    const stored = localStorage.getItem('app_config');
    if (stored) {
      try {
        this.config = { ...defaultConfig, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    }
  }
}
