---
inclusion: always
---

# Project Structure

## Architecture Pattern

Layered architecture with clear separation of concerns:

1. **View Layer**: UI components and pages
2. **State Management Layer**: React Context and custom hooks
3. **Service Layer**: API call abstractions
4. **Utility Layer**: Common utilities and helpers

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthGuard/      # Route protection component
│   ├── PasswordStrength/ # Password strength indicator
│   └── ErrorBoundary/  # Error boundary wrapper
├── layouts/            # Layout components
│   ├── BasicLayout/    # Main app layout (with ProLayout)
│   ├── UserLayout/     # Auth pages layout (login/register)
│   └── BlankLayout/    # Minimal layout (404/403)
├── pages/              # Page components (route-level)
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   ├── UserManagement/ # Admin only
│   ├── AuditLog/       # Admin only
│   ├── 403/
│   └── 404/
├── contexts/           # React Context providers
│   └── AuthContext/    # Authentication state management
├── hooks/              # Custom React hooks
│   ├── useAuth/        # Auth context wrapper
│   └── usePermission/  # Permission checking
├── services/           # API service layer
│   ├── auth.ts         # Authentication APIs
│   ├── session.ts      # Session management APIs
│   └── admin.ts        # Admin APIs
├── utils/              # Utility functions
│   ├── request.ts      # Axios instance with interceptors
│   ├── storage.ts      # LocalStorage wrapper
│   └── validator.ts    # Form validation functions
├── types/              # TypeScript type definitions
│   ├── api.ts          # API request/response types
│   ├── user.ts         # User and role types
│   └── route.ts        # Route configuration types
├── routes/             # Route configuration
│   └── index.tsx       # Route definitions with guards
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

## Module Dependencies

- View Layer → State Management Layer → Service Layer → Utility Layer
- No circular dependencies allowed
- Each layer only depends on layers below it

## Naming Conventions

- **Components**: PascalCase (e.g., `AuthGuard`, `PasswordStrength`)
- **Files**: Match component name (e.g., `AuthGuard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `usePermission`)
- **Services**: camelCase (e.g., `auth.ts`, `session.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `User`, `ApiResponse`)

## Code Organization

- One component per file
- Co-locate tests with source files (e.g., `AuthGuard.test.tsx`)
- Export from index files for cleaner imports
- Group related functionality in directories

## Import Order

1. React and external libraries
2. Internal components and hooks
3. Services and utilities
4. Types
5. Styles

## Testing Structure

- Unit tests: `*.test.tsx` or `*.test.ts`
- Property tests: Include `// Feature: [feature-name], Property X:` comment
- Integration tests: `*.integration.test.tsx`
- Test files co-located with source files
