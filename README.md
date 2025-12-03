# AIOps Web Frontend

Enterprise-grade frontend application for the AIOps platform, providing secure user authentication, role-based access control (RBAC), and administrative capabilities.

## Core Features

- User registration and authentication (username/email login)
- Session management with JWT tokens
- Role-based routing and menu control (User, Admin)
- User management interface (Admin only)
- Audit log viewing (Admin only)
- IT resource management and topology visualization
- Agent configuration and execution
- LLM service integration

## Topology Visualization

The platform provides powerful topology visualization capabilities for IT resources:

![Topology Diagram 1](doc/image/%E6%8B%93%E6%89%91%E5%9B%BE-1.png)

*Interactive topology view showing resource relationships and dependencies*

![Topology Diagram 2](doc/image/%E6%8B%93%E6%89%91%E5%9B%BE-2.png)

*Detailed topology diagram with agent associations and monitoring status*

## Technology Stack

- **React** 18.x - Frontend framework with concurrent features
- **TypeScript** 5.x - Type safety with strict mode enabled
- **Ant Design** 5.x - Enterprise UI component library
- **Ant Design Pro** 6.x - Out-of-the-box admin solution
- **React Router** 6.x - Declarative routing
- **Axios** - HTTP client with interceptors
- **Vite** 5.x - Fast build tool and dev server
- **Vitest** - Unit testing framework

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

Create `.env.development` and `.env.production` files:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_TITLE=AIOps Platform
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── layouts/            # Layout components (BasicLayout, UserLayout, BlankLayout)
├── pages/              # Page components (route-level)
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── router/             # Route configuration
└── main.tsx            # Application entry point
```

## User Roles

- **Regular User**: Access to dashboard and personal settings
- **System Administrator**: Full access including user management and audit logs

## Documentation

For detailed feature documentation, see the [doc/features](doc/features) directory.

## License

[Your License Here]
