# Internationalization (i18n) Guide

This project uses `react-intl` for internationalization support.

## Supported Languages

- **zh-CN**: Simplified Chinese (Default)
- **en-US**: English

## Usage

### 1. Using the `useIntl` Hook

```tsx
import { useIntl } from '@/hooks';

function MyComponent() {
  const { formatMessage, formatDate, locale } = useIntl();

  return (
    <div>
      <h1>{formatMessage('subgraph.list.title')}</h1>
      <p>{formatMessage('subgraph.message.addResourceSuccess', { count: 5 })}</p>
      <span>{formatDate(new Date())}</span>
      <span>Current locale: {locale}</span>
    </div>
  );
}
```

### 2. Using FormattedMessage Component

```tsx
import { FormattedMessage } from 'react-intl';

function MyComponent() {
  return (
    <div>
      <h1>
        <FormattedMessage id="subgraph.list.title" />
      </h1>
      <p>
        <FormattedMessage 
          id="subgraph.message.addResourceSuccess" 
          values={{ count: 5 }}
        />
      </p>
    </div>
  );
}
```

### 3. Switching Language

```tsx
import { LocaleSwitcher } from '@/components';

function Header() {
  return (
    <div>
      <LocaleSwitcher style="button" showIcon={true} />
    </div>
  );
}
```

Or programmatically:

```tsx
import { useLocale } from '@/contexts';

function MyComponent() {
  const { locale, setLocale } = useLocale();

  const handleChangeLanguage = () => {
    setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN');
  };

  return (
    <button onClick={handleChangeLanguage}>
      Switch to {locale === 'zh-CN' ? 'English' : '中文'}
    </button>
  );
}
```

## Date and Time Formatting

### Default Format

```tsx
const { formatDate } = useIntl();

// zh-CN: 2024-12-05 10:30:00
// en-US: 12/05/2024 10:30:00
formatDate(new Date());
```

### Custom Format

```tsx
// Custom format
formatDate(new Date(), 'YYYY/MM/DD');
```

### Relative Time

```tsx
const { formatRelativeTime } = useIntl();

// zh-CN: 5分钟前
// en-US: 5 minutes ago
formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000));
```

## Number Formatting

```tsx
const { formatNumber, formatCurrency } = useIntl();

// Format number with locale
formatNumber(1234567.89);

// Format currency
formatCurrency(1234.56, 'CNY'); // ¥1,234.56
formatCurrency(1234.56, 'USD'); // $1,234.56
```

## Adding New Translations

### 1. Add to Chinese (zh-CN)

Edit `src/locales/zh-CN/subgraph.ts`:

```typescript
export default {
  // ... existing translations
  'my.new.key': '我的新翻译',
};
```

### 2. Add to English (en-US)

Edit `src/locales/en-US/subgraph.ts`:

```typescript
export default {
  // ... existing translations
  'my.new.key': 'My New Translation',
};
```

### 3. Use in Component

```tsx
const { formatMessage } = useIntl();
const text = formatMessage('my.new.key');
```

## Translation Key Naming Convention

Use dot notation with the following structure:

```
<module>.<category>.<specific>

Examples:
- subgraph.list.title
- subgraph.button.create
- subgraph.message.createSuccess
- subgraph.error.loadFailed
- subgraph.confirm.delete.title
```

## Best Practices

1. **Always provide both zh-CN and en-US translations** for new keys
2. **Use descriptive key names** that indicate the context
3. **Group related translations** under the same prefix
4. **Use placeholders** for dynamic content: `{count}`, `{name}`, etc.
5. **Test both languages** when adding new features
6. **Keep translations consistent** across the application

## Locale Persistence

The selected locale is automatically saved to `localStorage` and restored on page reload.

## Ant Design Integration

Ant Design components (DatePicker, Table, etc.) are automatically localized based on the selected language through the `ConfigProvider` in `LocaleContext`.

## dayjs Integration

Date formatting with dayjs is automatically configured to use the correct locale through the `LocaleContext`.
