# Global Error Handling

This document describes the global error handling implementation for the AIOps Web Frontend.

## Overview

The application implements comprehensive error handling at multiple levels:

1. **HTTP Request Errors** - Handled by Axios interceptors
2. **React Component Errors** - Handled by ErrorBoundary
3. **Network Errors** - Automatic retry with exponential backoff

## HTTP Request Error Handling

### Configuration

- **Timeout**: 30 seconds (REQ-NFR-014-A)
- **Retry Attempts**: 2 retries for 5xx errors and network errors (REQ-NFR-014-B)
- **Retry Delay**: Exponential backoff (1s, 2s)

### Error Classification

| Status Code | Behavior | Retry |
|-------------|----------|-------|
| 400 | Show validation error message | No |
| 401 | Clear auth, redirect to login | No |
| 403 | Show permission error | No |
| 404 | Show not found error | No |
| 409 | Show conflict error (optimistic locking) | No |
| 500 | Show server error, retry | Yes |
| Network Error | Show network error, retry | Yes |
| Timeout | Show timeout error, retry | Yes |

### Usage

```typescript
import { get, post, put, del } from '@/utils/request'

// All errors are automatically handled
try {
  const data = await get<User>('/api/users/123')
  // Success
} catch (error) {
  // Error already displayed to user via message.error()
  // Only handle if you need custom logic
}
```

### HandledError

Errors that have been handled by the interceptor are wrapped in `HandledError`:

```typescript
import { isHandledError } from '@/utils/request'

try {
  await post('/api/users', userData)
} catch (error) {
  if (isHandledError(error)) {
    // Error already shown to user, no need to show again
    return
  }
  // Handle unexpected errors
}
```

## ErrorBoundary Component

### Purpose

Catches unhandled React component errors and displays a friendly error page.

### Usage

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Wrap your app or specific components
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
  <App />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, errorInfo) => logToService(error)}>
  <App />
</ErrorBoundary>
```

### Features

- Displays user-friendly error message
- Shows "Retry" button to reset error state
- Shows "Refresh Page" button to reload
- Supports custom fallback UI
- Supports error callback for logging

## Retry Mechanism

### How It Works

1. Request fails with 5xx error or network error
2. Wait 1 second, retry (attempt 1/2)
3. If still fails, wait 2 seconds, retry (attempt 2/2)
4. If still fails, show error to user

### Implementation

```typescript
// Automatic retry for 5xx and network errors
const shouldRetry = (error) => {
  if (!error.response) return true // Network error
  return error.response.status >= 500 // Server error
}

// Exponential backoff
const getRetryDelay = (retryCount) => {
  return 1000 * Math.pow(2, retryCount - 1)
}
```

## Error Messages

All error messages are user-friendly and localized:

```typescript
// Network errors
"网络连接失败，请检查网络设置"
"请求超时，请检查网络连接后重试"

// HTTP errors
"请求参数无效" // 400
"会话已过期，请重新登录" // 401
"您没有权限执行此操作" // 403
"请求的资源不存在" // 404
"数据已被其他用户修改，请刷新后重试" // 409
"服务器错误，请稍后重试" // 500
```

## Testing

### Request Error Handling Tests

```bash
npm test -- src/utils/request.test.ts --run
```

Tests cover:
- Retry mechanism (500 errors, network errors)
- No retry for 4xx errors
- Timeout handling
- Error classification
- Exponential backoff

### ErrorBoundary Tests

```bash
npm test -- src/components/ErrorBoundary/index.test.tsx --run
```

Tests cover:
- Normal rendering
- Error catching
- Retry functionality
- Refresh functionality
- Custom fallback
- Error callback

## Requirements Coverage

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| REQ-NFR-014 | Network error handling | Axios interceptor |
| REQ-NFR-014-A | 30s timeout | `timeout: 30000` |
| REQ-NFR-014-B | Retry mechanism | Exponential backoff, 2 retries |
| REQ-NFR-015 | Form validation errors | 400 error handling |
| REQ-NFR-016 | Permission errors | 403 error handling |
| REQ-NFR-017 | 404 errors | 404 error handling |
| REQ-NFR-018 | Global error boundary | ErrorBoundary component |
| REQ-NFR-019 | Conflict handling | 409 error handling |

## Best Practices

1. **Don't catch errors unnecessarily** - The interceptor handles most cases
2. **Use HandledError check** - Avoid showing duplicate error messages
3. **Wrap critical components** - Use ErrorBoundary for important sections
4. **Log errors** - Use ErrorBoundary's onError callback for monitoring
5. **Test error scenarios** - Always test error paths in your components

## Future Enhancements

- [ ] Error tracking service integration (e.g., Sentry)
- [ ] Offline detection and queue
- [ ] Custom retry strategies per endpoint
- [ ] Error analytics dashboard
