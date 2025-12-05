/**
 * Internationalization configuration
 */
import zhCN from './zh-CN';
import enUS from './en-US';

export type Locale = 'zh-CN' | 'en-US';

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export const localeNames = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};

export const defaultLocale: Locale = 'zh-CN';

/**
 * Get locale messages by locale key
 */
export function getLocaleMessages(locale: Locale) {
  return locales[locale] || locales[defaultLocale];
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): Locale {
  const browserLang = navigator.language;
  
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  
  if (browserLang.startsWith('en')) {
    return 'en-US';
  }
  
  return defaultLocale;
}

/**
 * Get stored locale from localStorage
 */
export function getStoredLocale(): Locale | null {
  const stored = localStorage.getItem('locale');
  if (stored && (stored === 'zh-CN' || stored === 'en-US')) {
    return stored as Locale;
  }
  return null;
}

/**
 * Store locale to localStorage
 */
export function setStoredLocale(locale: Locale): void {
  localStorage.setItem('locale', locale);
}

/**
 * Get current locale (stored > browser > default)
 */
export function getCurrentLocale(): Locale {
  return getStoredLocale() || getBrowserLocale();
}
