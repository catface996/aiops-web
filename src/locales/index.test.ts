/**
 * Internationalization utilities tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getLocaleMessages,
  getBrowserLocale,
  getStoredLocale,
  setStoredLocale,
  getCurrentLocale,
  defaultLocale,
} from './index';

describe('Internationalization utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getLocaleMessages', () => {
    it('should return zh-CN messages', () => {
      const messages = getLocaleMessages('zh-CN');
      expect(messages).toBeDefined();
      expect(messages['subgraph.list.title']).toBe('子图管理');
    });

    it('should return en-US messages', () => {
      const messages = getLocaleMessages('en-US');
      expect(messages).toBeDefined();
      expect(messages['subgraph.list.title']).toBe('Subgraph Management');
    });

    it('should return default locale messages for invalid locale', () => {
      const messages = getLocaleMessages('invalid' as any);
      expect(messages).toBeDefined();
      expect(messages['subgraph.list.title']).toBe('子图管理');
    });
  });

  describe('getStoredLocale', () => {
    it('should return null when no locale is stored', () => {
      expect(getStoredLocale()).toBeNull();
    });

    it('should return stored locale', () => {
      localStorage.setItem('locale', 'en-US');
      expect(getStoredLocale()).toBe('en-US');
    });

    it('should return null for invalid stored locale', () => {
      localStorage.setItem('locale', 'invalid');
      expect(getStoredLocale()).toBeNull();
    });
  });

  describe('setStoredLocale', () => {
    it('should store locale in localStorage', () => {
      setStoredLocale('en-US');
      expect(localStorage.getItem('locale')).toBe('en-US');
    });

    it('should update stored locale', () => {
      setStoredLocale('zh-CN');
      expect(localStorage.getItem('locale')).toBe('zh-CN');
      
      setStoredLocale('en-US');
      expect(localStorage.getItem('locale')).toBe('en-US');
    });
  });

  describe('getCurrentLocale', () => {
    it('should return stored locale if available', () => {
      setStoredLocale('en-US');
      expect(getCurrentLocale()).toBe('en-US');
    });

    it('should return default locale when no stored locale', () => {
      const locale = getCurrentLocale();
      expect(['zh-CN', 'en-US']).toContain(locale);
    });
  });

  describe('defaultLocale', () => {
    it('should be zh-CN', () => {
      expect(defaultLocale).toBe('zh-CN');
    });
  });
});
