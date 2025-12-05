/**
 * Locale Switcher Component
 * Allows users to switch between supported languages
 */
import React from 'react';
import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useLocale } from '@/contexts/LocaleContext';
import { localeNames, type Locale } from '@/locales';

interface LocaleSwitcherProps {
  /**
   * Display style: 'button' | 'text'
   */
  style?: 'button' | 'text';
  /**
   * Show icon
   */
  showIcon?: boolean;
}

export function LocaleSwitcher({ 
  style = 'button',
  showIcon = true 
}: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocale();

  const items: MenuProps['items'] = [
    {
      key: 'zh-CN',
      label: localeNames['zh-CN'],
      onClick: () => setLocale('zh-CN'),
    },
    {
      key: 'en-US',
      label: localeNames['en-US'],
      onClick: () => setLocale('en-US'),
    },
  ];

  const currentLocaleName = localeNames[locale];

  if (style === 'text') {
    return (
      <Dropdown menu={{ items, selectedKeys: [locale] }} placement="bottomRight">
        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          {showIcon && <GlobalOutlined />}
          {currentLocaleName}
        </span>
      </Dropdown>
    );
  }

  return (
    <Dropdown menu={{ items, selectedKeys: [locale] }} placement="bottomRight">
      <Button icon={showIcon ? <GlobalOutlined /> : undefined}>
        {currentLocaleName}
      </Button>
    </Dropdown>
  );
}

export default LocaleSwitcher;
