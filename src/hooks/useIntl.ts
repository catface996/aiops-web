/**
 * Custom hook for internationalization
 * Wraps react-intl's useIntl with additional utilities
 */
import { useIntl as useReactIntl } from 'react-intl';
import dayjs from 'dayjs';
import { useLocale } from '@/contexts/LocaleContext';

export function useIntl() {
  const intl = useReactIntl();
  const { locale } = useLocale();

  /**
   * Format message with default fallback
   */
  const formatMessage = (
    id: string,
    values?: Record<string, any>,
    defaultMessage?: string
  ) => {
    return intl.formatMessage(
      { id, defaultMessage: defaultMessage || id },
      values
    );
  };

  /**
   * Format date with locale
   */
  const formatDate = (
    date: string | Date | dayjs.Dayjs,
    format?: string
  ): string => {
    const dayjsDate = dayjs(date);
    
    if (!format) {
      // Default format based on locale
      format = locale === 'zh-CN' 
        ? 'YYYY-MM-DD HH:mm:ss' 
        : 'MM/DD/YYYY HH:mm:ss';
    }
    
    return dayjsDate.format(format);
  };

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (date: string | Date | dayjs.Dayjs): string => {
    const dayjsDate = dayjs(date);
    const now = dayjs();
    const diffInSeconds = now.diff(dayjsDate, 'second');
    
    if (diffInSeconds < 60) {
      return locale === 'zh-CN' ? '刚刚' : 'just now';
    }
    
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return locale === 'zh-CN' 
        ? `${minutes}分钟前` 
        : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return locale === 'zh-CN' 
        ? `${hours}小时前` 
        : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return locale === 'zh-CN' 
        ? `${days}天前` 
        : `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(date);
  };

  /**
   * Format number with locale
   */
  const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return intl.formatNumber(value, options);
  };

  /**
   * Format currency
   */
  const formatCurrency = (
    value: number,
    currency: string = 'CNY'
  ): string => {
    return intl.formatNumber(value, {
      style: 'currency',
      currency,
    });
  };

  return {
    ...intl,
    formatMessage,
    formatDate,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    locale,
  };
}
