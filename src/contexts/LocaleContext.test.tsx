/**
 * LocaleContext tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { LocaleProvider, useLocale } from './LocaleContext';
import { ReactNode } from 'react';

describe('LocaleContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleProvider>{children}</LocaleProvider>
  );

  it('should provide default locale', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });
    
    expect(result.current.locale).toBeDefined();
    expect(['zh-CN', 'en-US']).toContain(result.current.locale);
  });

  it('should allow changing locale', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });
    
    act(() => {
      result.current.setLocale('en-US');
    });
    
    expect(result.current.locale).toBe('en-US');
  });

  it('should persist locale to localStorage', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });
    
    act(() => {
      result.current.setLocale('en-US');
    });
    
    expect(localStorage.getItem('locale')).toBe('en-US');
  });

  it('should restore locale from localStorage', () => {
    localStorage.setItem('locale', 'en-US');
    
    const { result } = renderHook(() => useLocale(), { wrapper });
    
    expect(result.current.locale).toBe('en-US');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useLocale());
    }).toThrow('useLocale must be used within a LocaleProvider');
  });

  it('should render children with IntlProvider', () => {
    const TestComponent = () => {
      const { locale } = useLocale();
      return <div data-testid="locale">{locale}</div>;
    };

    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    const localeElement = screen.getByTestId('locale');
    expect(['zh-CN', 'en-US']).toContain(localeElement.textContent);
  });
});
