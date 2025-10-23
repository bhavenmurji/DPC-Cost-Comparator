# Test Suite Installation and Setup

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 16 (for integration tests)

## Installation Steps

### 1. Install Test Dependencies

```bash
npm install
```

This will install all testing dependencies:
- **Vitest** - Fast unit test framework
- **Testing Library** - React component testing
- **Playwright** - E2E browser automation
- **Supertest** - API integration testing
- **Coverage tools** - Code coverage reporting

### 2. Install Playwright Browsers

```bash
npx playwright install --with-deps
```

This installs Chromium, Firefox, and WebKit for cross-browser testing.

### 3. Database Setup (for Integration Tests)

```bash
# Create test database
createdb dpc_test

# Or using psql
psql -U postgres -c "CREATE DATABASE dpc_test;"

# Set environment variable
export DATABASE_URL="postgresql://postgres:password@localhost:5432/dpc_test"

# Run migrations
npm run prisma:migrate --workspace=apps/api
```

### 4. Verify Installation

```bash
# Run all tests
npm test

# You should see output like:
# ✓ tests/unit/costComparison.test.ts (XX tests)
# ✓ tests/unit/providerMatching.test.ts (XX tests)
# ✓ tests/integration/api.test.ts (XX tests)
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security
npm run test:hipaa
```

### Advanced Commands

```bash
# Run single test file
npm test tests/unit/costComparison.test.ts

# Run tests matching pattern
npm test -- -t "should calculate"

# Run with UI
npx vitest --ui

# Debug mode
npm test -- --inspect-brk

# Verbose output
npm test -- --reporter=verbose
```

### E2E Tests

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run E2E tests with UI
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Debug E2E tests
npx playwright test --debug
```

## Configuration Files

### vitest.config.ts
Main configuration for unit and integration tests.

### playwright.config.ts
Configuration for E2E browser tests.

### lighthouserc.json
Configuration for performance testing.

### tests/setup.ts
Global test setup and mocks.

## Test Data

All test fixtures and mock data are in `tests/fixtures/testData.ts`:

```typescript
import {
  mockUsers,
  mockComparisonInputs,
  mockProviders,
  createMockRequest,
  createMockResponse,
} from './fixtures/testData'

// Use in your tests
const input = mockComparisonInputs.healthyYoungAdult
const provider = mockProviders.highlyRated
```

## Coverage Reports

After running `npm run test:coverage`, view reports:

```bash
# Open HTML coverage report
open coverage/index.html

# View in terminal
cat coverage/coverage-summary.json
```

Coverage targets:
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## CI/CD Integration

Tests automatically run on:
- Push to main/develop branches
- Pull requests
- Manual workflow trigger

See `.github/workflows/test.yml` for pipeline configuration.

### Local CI Simulation

```bash
# Run all test suites like CI
npm run test:unit && \
npm run test:integration && \
npm run test:security && \
npm run test:e2e && \
npm run lint
```

## Troubleshooting

### Tests Failing with Database Errors

```bash
# Ensure PostgreSQL is running
pg_ctl status

# Reset test database
dropdb dpc_test
createdb dpc_test
npm run prisma:migrate --workspace=apps/api
```

### Playwright Browser Issues

```bash
# Reinstall browsers
npx playwright install --force --with-deps
```

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Coverage Not Generating

```bash
# Clear cache and reinstall
rm -rf node_modules coverage .vitest
npm install
npm run test:coverage
```

## Environment Variables

Create `.env.test` for test-specific configuration:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:5432/dpc_test
JWT_SECRET=test-secret-key
API_URL=http://localhost:3001
```

## Best Practices

1. **Always run tests before committing**
   ```bash
   npm test
   ```

2. **Keep tests fast** - Unit tests should run in < 100ms each

3. **Use fixtures** - Reuse test data from `testData.ts`

4. **Clean up** - Tests should not leave side effects

5. **Mock external services** - Don't make real API calls

6. **Test edge cases** - Min/max values, empty inputs, errors

7. **Descriptive names** - Test names should explain intent

## Additional Tools

### Security Scanning

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Run OWASP dependency check (requires Java)
dependency-check --project DPC-Cost-Comparator --scan .
```

### Performance Testing

```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Accessibility Testing

```bash
# Run axe-core CLI
npx @axe-core/cli http://localhost:5173
```

## Getting Help

- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Playwright**: https://playwright.dev/
- **Project Issues**: File an issue in the repo

## Next Steps

1. Review test coverage reports
2. Add tests for new features
3. Set up pre-commit hooks
4. Configure IDE test runners
5. Review CI/CD pipeline results
