
export interface AppConfig {
  companySettings: {
    defaultTaxRate: number;
    gstNumber: string;
    companyRegistration: string;
    fiscalYearStart: string;
    baseCurrency: string;
  };
  stockSettings: {
    lowStockThreshold: number;
    enableFIFO: boolean;
    autoStockAlerts: boolean;
    expiryWarningDays: number;
  };
  reportSettings: {
    defaultExportPath: string;
    autoBackupEnabled: boolean;
    backupRetentionDays: number;
  };
  uiSettings: {
    theme: 'light' | 'dark' | 'auto';
    defaultPageSize: number;
    enableKeyboardShortcuts: boolean;
  };
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    const savedConfig = localStorage.getItem('app_config');
    if (savedConfig) {
      try {
        return { ...this.getDefaultConfig(), ...JSON.parse(savedConfig) };
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
    return this.getDefaultConfig();
  }

  private getDefaultConfig(): AppConfig {
    return {
      companySettings: {
        defaultTaxRate: 18,
        gstNumber: '',
        companyRegistration: '',
        fiscalYearStart: '04-01',
        baseCurrency: 'INR'
      },
      stockSettings: {
        lowStockThreshold: 10,
        enableFIFO: true,
        autoStockAlerts: true,
        expiryWarningDays: 7
      },
      reportSettings: {
        defaultExportPath: 'exports/',
        autoBackupEnabled: true,
        backupRetentionDays: 30
      },
      uiSettings: {
        theme: 'light',
        defaultPageSize: 25,
        enableKeyboardShortcuts: true
      }
    };
  }

  getConfig(): AppConfig {
    return this.config;
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    localStorage.setItem('app_config', JSON.stringify(this.config));
  }

  resetConfig(): void {
    this.config = this.getDefaultConfig();
    localStorage.removeItem('app_config');
  }
}

export default ConfigService;
