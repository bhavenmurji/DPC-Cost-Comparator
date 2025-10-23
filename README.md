# HealthPartnershipX

Healthcare Partnership and Collaboration Platform

## Overview

HealthPartnershipX is a modern, HIPAA-ready healthcare partnership platform built with TypeScript, React, and Node.js. It enables healthcare organizations to collaborate, share data securely, and manage partnerships effectively.

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Query** - Data fetching and caching
- **React Router** - Navigation

### Backend
- **Node.js 20** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint + Prettier** - Code quality
- **Vitest** - Testing framework

## Project Structure

```
HealthPartnershipX/
├── apps/
│   ├── web/              # Frontend React application
│   └── api/              # Backend API application
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── shared-utils/     # Shared utilities
├── infrastructure/
│   └── docker/           # Docker configurations
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Docker and Docker Compose

### Quick Start

1. **Clone and setup**
   ```bash
   npm run setup
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env.local`
   - Update database and API credentials

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Health: http://localhost:4000/health

### Manual Setup

If the automated setup doesn't work:

```bash
# Install dependencies
npm install

# Start Docker services
cd infrastructure/docker
docker-compose up -d
cd ../..

# Setup database
npm run db:setup

# Start development servers
npm run dev
```

## Available Scripts

### Root Level
- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier
- `npm run setup` - Initial project setup

### Frontend (`apps/web`)
- `npm run dev --workspace=apps/web` - Start frontend dev server
- `npm run build --workspace=apps/web` - Build frontend for production
- `npm run test --workspace=apps/web` - Run frontend tests

### Backend (`apps/api`)
- `npm run dev --workspace=apps/api` - Start backend dev server
- `npm run build --workspace=apps/api` - Build backend for production
- `npm run test --workspace=apps/api` - Run backend tests
- `npm run prisma:generate --workspace=apps/api` - Generate Prisma client
- `npm run prisma:migrate --workspace=apps/api` - Run database migrations

## Development Workflow

### Creating a New Feature

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
   - Frontend code in `apps/web/src`
   - Backend code in `apps/api/src`

3. Test your changes
   ```bash
   npm run test
   npm run lint
   ```

4. Commit and push
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

5. Create a pull request

### Database Changes

1. Update Prisma schema
   ```bash
   # Edit apps/api/prisma/schema.prisma
   ```

2. Create migration
   ```bash
   npm run prisma:migrate --workspace=apps/api
   ```

3. Generate Prisma client
   ```bash
   npm run prisma:generate --workspace=apps/api
   ```

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development, staging, production)

### Optional Variables
- `REDIS_URL` - Redis connection string
- `SMTP_HOST` - Email server configuration
- `SENTRY_DSN` - Error tracking

## HIPAA Compliance

This platform is designed with HIPAA compliance in mind:

- ✅ Encryption at rest and in transit
- ✅ Audit logging for all data access
- ✅ Role-based access control (RBAC)
- ✅ Secure session management
- ✅ Data retention policies

**Note**: Full HIPAA compliance requires proper deployment, configuration, and organizational policies beyond the code.

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

## Deployment

### Production Build

```bash
# Build all applications
npm run build

# Build specific app
npm run build --workspace=apps/web
npm run build --workspace=apps/api
```

### Docker Deployment

```bash
# Build Docker images
docker build -f infrastructure/docker/Dockerfile.web -t healthpartnershipx-web .
docker build -f infrastructure/docker/Dockerfile.api -t healthpartnershipx-api .

# Run with docker-compose
cd infrastructure/docker
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Architecture Documentation

See `docs/architecture/` for detailed architecture documentation.

## API Documentation

See `docs/api/` for API endpoint documentation.

## License

Private - All Rights Reserved

## Support

For issues and questions, please create an issue in the repository.

---

**Generated by Claude Flow Swarm** 🐝
