# Test Suite Documentation

Comprehensive testing suite for the DPC Cost Comparator application with 90%+ code coverage.

## Test Structure

```
tests/
├── unit/                    # Unit tests for business logic
│   ├── costComparison.test.ts
│   ├── providerMatching.test.ts
│   └── frontend-components.test.tsx
├── integration/             # API integration tests
│   ├── api.test.ts
│   └── middleware.test.ts
├── e2e/                     # End-to-end workflow tests
│   └── userWorkflows.test.ts
├── security/                # Security and compliance tests
│   ├── hipaa-compliance.test.ts
│   └── penetration.test.ts
├── fixtures/                # Test data and mocks
│   └── testData.ts
└── setup.ts                 # Global test setup
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Security Tests
```bash
npm run test:security
npm run test:hipaa
```

### With Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Test Categories

### 1. Unit Tests (tests/unit/)

Tests individual functions and components in isolation.

**Cost Comparison Service Tests:**
- Basic cost calculations
- Age-based premium calculations
- Chronic condition adjustments
- State-specific pricing
- Edge cases (min/max age, zero visits, etc.)
- Cost breakdown structure validation

**Provider Matching Service Tests:**
- Provider search and filtering
- Match score calculation
- Distance-based sorting
- Specialty matching
- Language preferences
- Rating boosts

**Frontend Component Tests:**
- Form rendering and validation
- User interactions
- Edge case handling
- Accessibility features

**Coverage Target:** >80%

### 2. Integration Tests (tests/integration/)

Tests API endpoints with real request/response cycles.

**API Tests:**
- POST /api/comparison/calculate
- POST /api/comparison/providers
- GET /api/comparison/providers/:id
- Error handling
- Input validation
- Response format validation

**Middleware Tests:**
- Authentication (Bearer tokens)
- Authorization (role-based access)
- Audit logging
- CORS protection

**Coverage Target:** >75%

### 3. E2E Tests (tests/e2e/)

Tests complete user workflows through the application.

**User Workflows:**
- Cost comparison form submission
- Provider search and filtering
- Mobile responsiveness
- Accessibility (keyboard navigation, screen readers)
- Error scenarios

**Tools:** Playwright

**Browsers Tested:**
- Chrome
- Firefox
- Safari
- Mobile Chrome
- Mobile Safari

### 4. Security Tests (tests/security/)

Tests security vulnerabilities and HIPAA compliance.

**HIPAA Compliance:**
- Data encryption (at rest and in transit)
- Audit logging (all PHI access)
- Access controls (authentication and authorization)
- Data minimization
- Session management
- Breach detection

**Penetration Tests:**
- SQL injection protection
- XSS (Cross-Site Scripting) protection
- Authentication bypass attempts
- Brute force protection
- Input validation
- CORS protection
- File upload security

**Security Scan Tools:**
- npm audit
- OWASP Dependency Check
- Snyk
- SonarCloud

## Coverage Requirements

| Metric     | Target | Current |
|------------|--------|---------|
| Statements | >80%   | -       |
| Branches   | >75%   | -       |
| Functions  | >80%   | -       |
| Lines      | >80%   | -       |

## CI/CD Pipeline

Tests run automatically on:
- Every push to main/develop
- Every pull request

### Pipeline Stages:

1. **Unit Tests** - Fast, isolated tests
2. **Integration Tests** - API endpoint tests with database
3. **Security Tests** - Vulnerability scanning and HIPAA compliance
4. **E2E Tests** - Full browser automation tests
5. **Lint & Type Check** - Code quality and TypeScript validation
6. **Accessibility Tests** - WCAG 2.1 AA compliance
7. **Performance Tests** - Lighthouse CI

See `.github/workflows/test.yml` for full configuration.

## Test Data & Fixtures

Reusable mock data available in `tests/fixtures/testData.ts`:

- Mock users (admin, doctor, patient)
- Mock comparison inputs (various ages, conditions)
- Mock comparison results
- Mock providers and matches
- Mock audit logs
- Mock security events
- Helper functions

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { calculateComparison } from '../services/costComparison.service'

describe('calculateComparison', () => {
  it('should calculate costs for healthy adult', async () => {
    const input = {
      age: 35,
      zipCode: '90001',
      state: 'CA',
      chronicConditions: [],
      annualDoctorVisits: 4,
      prescriptionCount: 0,
    }

    const result = await calculateComparison(input)

    expect(result.traditionalTotalAnnual).toBeGreaterThan(0)
    expect(result.dpcTotalAnnual).toBeGreaterThan(0)
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../server'

describe('POST /api/comparison/calculate', () => {
  it('should return comparison results', async () => {
    const response = await request(app)
      .post('/api/comparison/calculate')
      .send({
        age: 35,
        zipCode: '90001',
        state: 'CA',
      })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.comparison).toBeDefined()
  })
})
```

### Component Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import ComparisonForm from './ComparisonForm'

describe('ComparisonForm', () => {
  it('should render form fields', () => {
    const mockSubmit = vi.fn()
    render(<ComparisonForm onSubmit={mockSubmit} />)

    expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
  })

  it('should submit form with valid data', () => {
    const mockSubmit = vi.fn()
    render(<ComparisonForm onSubmit={mockSubmit} />)

    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '35' },
    })
    fireEvent.click(screen.getByRole('button'))

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ age: 35 })
    )
  })
})
```

## Best Practices

1. **Test First:** Write tests before or alongside implementation (TDD)
2. **One Assertion per Test:** Each test should verify one specific behavior
3. **Descriptive Names:** Test names should explain what and why
4. **Arrange-Act-Assert:** Structure tests clearly
5. **Mock External Dependencies:** Keep tests isolated
6. **Use Test Data Builders:** Reuse fixtures from `testData.ts`
7. **Avoid Test Interdependence:** Each test should be independent

## Debugging Tests

### Run Single Test File
```bash
npm test tests/unit/costComparison.test.ts
```

### Run Single Test
```bash
npm test -- -t "should calculate costs"
```

### Debug Mode
```bash
npm test -- --inspect-brk
```

### Verbose Output
```bash
npm test -- --reporter=verbose
```

## Continuous Improvement

- Review coverage reports after each run
- Add tests for new features before merging
- Update tests when requirements change
- Monitor flaky tests and fix immediately
- Keep test execution time under 5 minutes

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/)
