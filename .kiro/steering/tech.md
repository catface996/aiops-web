# Technology Stack

## Core Technologies

- **React**: 18.x - Frontend framework with concurrent features
- **TypeScript**: 5.x - Type safety with strict mode enabled
- **Ant Design**: 5.x - Enterprise UI component library
- **Ant Design Pro**: 6.x - Out-of-the-box admin solution
- **React Router**: 6.x - Declarative routing
- **Axios**: Latest stable - HTTP client with interceptors
- **Vite**: 5.x - Fast build tool and dev server

## Testing

- **Vitest**: Latest stable - Unit testing framework
- **React Testing Library**: Component testing
- **fast-check**: Latest stable - Property-based testing (minimum 100 iterations per property)

## Key Technical Decisions

- **State Management**: React Context + Hooks (no Redux - keeps it lightweight)
- **Authentication**: JWT tokens stored in LocalStorage
- **API Base Path**: `/api/v1`
- **Build Target**: ES2015

## Common Commands

```bash
# Development
npm run dev              # Start dev server with HMR
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run type-check       # TypeScript type checking
```

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL
  - Dev: `http://localhost:8080/api/v1`
  - Prod: `https://api.aiops.com/api/v1`
- `VITE_APP_TITLE`: Application title

## Development Setup

1. Vite dev server proxies `/api/v1` to backend
2. Hot Module Replacement (HMR) enabled
3. TypeScript strict mode enforced
4. ESLint + Prettier configured

## Build Configuration

- Code splitting by route (automatic)
- Terser for minification
- Output directory: `dist/`
- Long-term caching with content hashes in filenames
