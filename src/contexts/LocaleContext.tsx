/**
 * Locale Context - Manages application locale state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import {
  type Locale,
  getLocaleMessages,
  getCurrentLocale,
  setStoredLocale,
} from '@/locales';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

/**
 * Ant Design locale mapping
 */
const antdLocales = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

/**
 * dayjs locale mapping
 */
const dayjsLocales = {
  'zh-CN': 'zh-cn',
  'en-US': 'en',
};

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getCurrentLocale());

  useEffect(() => {
    // Set dayjs locale
    dayjs.locale(dayjsLocales[locale]);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
    dayjs.locale(dayjsLocales[newLocale]);
  };

  const messages = getLocaleMessages(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <ConfigProvider locale={antdLocales[locale]}>
        <IntlProvider
          locale={locale}
          messages={messages}
          defaultLocale="zh-CN"
        >
          {children}
        </IntlProvider>
      </ConfigProvider>
    </LocaleContext.Provider>
  );
}

/**
 * Hook to use locale context
 */
export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
