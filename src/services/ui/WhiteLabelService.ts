
export interface BrandingConfig {
  companyName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstNumber?: string;
  centerCount: number;
  customCSS?: string;
}

export interface ResponsiveSettings {
  kioskMode: boolean;
  tabletOptimized: boolean;
  desktopLayout: 'sidebar' | 'topbar' | 'hybrid';
  touchFriendly: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  buttonSize: 'compact' | 'normal' | 'large' | 'extra-large';
  showTooltips: boolean;
  animationsEnabled: boolean;
}

export interface ThemeVariant {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
    letterSpacing: string;
  };
  spacing: {
    scale: number;
    cardPadding: string;
    buttonPadding: string;
  };
}

export class WhiteLabelService {
  private static readonly STORAGE_KEY = 'branding_config';
  private static readonly RESPONSIVE_KEY = 'responsive_settings';
  private static readonly THEME_KEY = 'custom_theme';

  static readonly DEFAULT_BRANDING: BrandingConfig = {
    companyName: 'Vikas Milk Centre',
    logo: '/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png',
    favicon: '/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#10B981',
    backgroundColor: '#0F172A',
    textColor: '#F8FAFC',
    borderColor: '#334155',
    fontFamily: 'Inter, system-ui, sans-serif',
    tagline: 'Trusted Quality Since 1975',
    address: '123 Dairy Lane, Mumbai, Maharashtra 400001',
    phone: '+91 98765 43210',
    email: 'info@vikasmilk.com',
    website: 'www.vikasmilk.com',
    gstNumber: '27ABCDE1234F1Z5',
    centerCount: 1
  };

  static readonly DEFAULT_RESPONSIVE: ResponsiveSettings = {
    kioskMode: false,
    tabletOptimized: true,
    desktopLayout: 'sidebar',
    touchFriendly: true,
    fontSize: 'medium',
    buttonSize: 'normal',
    showTooltips: true,
    animationsEnabled: true
  };

  static readonly PREDEFINED_THEMES: ThemeVariant[] = [
    {
      id: 'modern-blue',
      name: 'Modern Blue',
      description: 'Clean and professional blue theme',
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        border: '#334155',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        letterSpacing: '-0.025em'
      },
      spacing: {
        scale: 1.0,
        cardPadding: '1.5rem',
        buttonPadding: '0.75rem 1.5rem'
      }
    },
    {
      id: 'warm-orange',
      name: 'Warm Orange',
      description: 'Friendly and inviting orange theme',
      colors: {
        primary: '#F97316',
        secondary: '#DC2626',
        accent: '#059669',
        background: '#1C1917',
        surface: '#292524',
        text: '#FAFAF9',
        textMuted: '#A8A29E',
        border: '#44403C',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626'
      },
      typography: {
        fontFamily: 'Outfit, system-ui, sans-serif',
        headingWeight: 700,
        bodyWeight: 400,
        letterSpacing: '0'
      },
      spacing: {
        scale: 1.1,
        cardPadding: '1.75rem',
        buttonPadding: '0.875rem 1.75rem'
      }
    },
    {
      id: 'classic-green',
      name: 'Classic Green',
      description: 'Traditional dairy green theme',
      colors: {
        primary: '#059669',
        secondary: '#0D9488',
        accent: '#F59E0B',
        background: '#064E3B',
        surface: '#065F46',
        text: '#ECFDF5',
        textMuted: '#A7F3D0',
        border: '#047857',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      typography: {
        fontFamily: 'Roboto, system-ui, sans-serif',
        headingWeight: 500,
        bodyWeight: 400,
        letterSpacing: '0.025em'
      },
      spacing: {
        scale: 0.95,
        cardPadding: '1.25rem',
        buttonPadding: '0.625rem 1.25rem'
      }
    }
  ];

  static getBrandingConfig(): BrandingConfig {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? { ...this.DEFAULT_BRANDING, ...JSON.parse(stored) } : this.DEFAULT_BRANDING;
  }

  static setBrandingConfig(config: Partial<BrandingConfig>): void {
    const current = this.getBrandingConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.applyBranding(updated);
  }

  static getResponsiveSettings(): ResponsiveSettings {
    const stored = localStorage.getItem(this.RESPONSIVE_KEY);
    return stored ? { ...this.DEFAULT_RESPONSIVE, ...JSON.parse(stored) } : this.DEFAULT_RESPONSIVE;
  }

  static setResponsiveSettings(settings: Partial<ResponsiveSettings>): void {
    const current = this.getResponsiveSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.RESPONSIVE_KEY, JSON.stringify(updated));
    this.applyResponsiveSettings(updated);
  }

  static applyBranding(config: BrandingConfig): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', config.primaryColor);
    root.style.setProperty('--secondary-color', config.secondaryColor);
    root.style.setProperty('--accent-color', config.accentColor);
    root.style.setProperty('--background-color', config.backgroundColor);
    root.style.setProperty('--text-color', config.textColor);
    root.style.setProperty('--border-color', config.borderColor);
    root.style.setProperty('--font-family', config.fontFamily);

    // Update document title and favicon
    document.title = config.companyName;
    this.updateFavicon(config.favicon);

    // Apply custom CSS if provided
    if (config.customCSS) {
      this.injectCustomCSS(config.customCSS);
    }

    console.log('Branding applied:', config.companyName);
  }

  static applyResponsiveSettings(settings: ResponsiveSettings): void {
    const root = document.documentElement;
    
    // Apply responsive classes
    root.classList.toggle('kiosk-mode', settings.kioskMode);
    root.classList.toggle('tablet-optimized', settings.tabletOptimized);
    root.classList.toggle('touch-friendly', settings.touchFriendly);
    root.classList.toggle('animations-disabled', !settings.animationsEnabled);
    
    // Font size scaling
    const fontSizeMap = {
      'small': '0.875rem',
      'medium': '1rem',
      'large': '1.125rem',
      'extra-large': '1.25rem'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
    
    // Button size scaling
    const buttonSizeMap = {
      'compact': '0.5rem 1rem',
      'normal': '0.75rem 1.5rem',
      'large': '1rem 2rem',
      'extra-large': '1.25rem 2.5rem'
    };
    root.style.setProperty('--button-padding', buttonSizeMap[settings.buttonSize]);

    console.log('Responsive settings applied:', settings);
  }

  static applyTheme(theme: ThemeVariant): void {
    const root = document.documentElement;
    
    // Apply color scheme
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    
    // Apply typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--heading-weight', theme.typography.headingWeight.toString());
    root.style.setProperty('--body-weight', theme.typography.bodyWeight.toString());
    root.style.setProperty('--letter-spacing', theme.typography.letterSpacing);
    
    // Apply spacing
    root.style.setProperty('--spacing-scale', theme.spacing.scale.toString());
    root.style.setProperty('--card-padding', theme.spacing.cardPadding);
    root.style.setProperty('--button-padding-theme', theme.spacing.buttonPadding);
    
    // Store current theme
    localStorage.setItem(this.THEME_KEY, JSON.stringify(theme));
    
    console.log('Theme applied:', theme.name);
  }

  static getCurrentTheme(): ThemeVariant | null {
    const stored = localStorage.getItem(this.THEME_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static generateCustomTheme(name: string, baseTheme: ThemeVariant, customizations: Partial<ThemeVariant>): ThemeVariant {
    return {
      ...baseTheme,
      ...customizations,
      id: `custom-${Date.now()}`,
      name,
      colors: { ...baseTheme.colors, ...customizations.colors },
      typography: { ...baseTheme.typography, ...customizations.typography },
      spacing: { ...baseTheme.spacing, ...customizations.spacing }
    };
  }

  private static updateFavicon(faviconUrl: string): void {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = faviconUrl;
      document.head.appendChild(newFavicon);
    }
  }

  private static injectCustomCSS(css: string): void {
    const existingStyle = document.getElementById('custom-branding-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'custom-branding-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  static exportBrandingConfig(): string {
    const config = this.getBrandingConfig();
    const responsive = this.getResponsiveSettings();
    const theme = this.getCurrentTheme();
    
    return JSON.stringify({
      branding: config,
      responsive,
      theme,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  static importBrandingConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      
      if (imported.branding) {
        this.setBrandingConfig(imported.branding);
      }
      
      if (imported.responsive) {
        this.setResponsiveSettings(imported.responsive);
      }
      
      if (imported.theme) {
        this.applyTheme(imported.theme);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import branding config:', error);
      return false;
    }
  }

  static initialize(): void {
    const config = this.getBrandingConfig();
    const settings = this.getResponsiveSettings();
    const theme = this.getCurrentTheme();
    
    this.applyBranding(config);
    this.applyResponsiveSettings(settings);
    
    if (theme) {
      this.applyTheme(theme);
    }
    
    console.log('White Label Service initialized');
  }

  static resetToDefaults(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.RESPONSIVE_KEY);
    localStorage.removeItem(this.THEME_KEY);
    
    this.applyBranding(this.DEFAULT_BRANDING);
    this.applyResponsiveSettings(this.DEFAULT_RESPONSIVE);
    
    const customStyle = document.getElementById('custom-branding-css');
    if (customStyle) {
      customStyle.remove();
    }
    
    console.log('Branding reset to defaults');
  }
}
