# Input Validation Documentation

## Overview

This document describes the comprehensive input validation implementation using Zod schema validation for security hardening of the DPC Cost Comparator API.

## Security Benefits

Input validation prevents:
- **Invalid Data Types**: Ensures all fields match expected types
- **Out-of-Range Values**: Enforces business rules and realistic limits
- **Injection Attacks**: Sanitizes and validates all user inputs
- **Malformed Requests**: Rejects requests with invalid formats
- **Additional Fields**: Strict mode prevents unexpected data

## Implementation Architecture

### 1. Validation Schemas (`src/backend/validators/schemas.ts`)

Centralized Zod schemas define all validation rules:

```typescript
import { ComparisonInputSchema } from '../validators/schemas';

// Example schema structure
export const ComparisonInputSchema = z.object({
  age: z.number().int().min(18).max(100),
  zipCode: z.string().regex(/^\d{5}$/),
  state: z.string().length(2),
  // ... more fields
}).strict();
```

### 2. Validation Middleware (`src/backend/middleware/validation.ts`)

Generic middleware applies validation to any endpoint:

```typescript
import { validate, validateBody, validateQuery, validateParams } from '../middleware/validation';

// Usage in routes
router.post('/calculate', validateBody(ComparisonInputSchema), handler);
```

### 3. Updated Routes

All routes now use validation middleware:
- `/api/comparison/calculate` - Cost comparison endpoint
- `/api/comparison/providers` - Provider search endpoint
- `/api/comparison/providers/:id` - Provider details endpoint
- `/api/v1/cost-comparison/calculate` - Alternative calculation endpoint
- `/api/v1/dpc-providers/search` - DPC provider search
- `/api/v1/dpc-providers/:id` - DPC provider details

## Validation Rules

### Age Validation
- **Type**: Integer
- **Range**: 18-100 years
- **Reason**: Legal adults only, realistic age range

### ZIP Code Validation
- **Format**: Exactly 5 digits
- **Pattern**: `/^\d{5}$/`
- **Example**: `90210`, `10001`

### State Code Validation
- **Format**: 2 uppercase letters
- **Values**: Valid US state codes (including DC)
- **Example**: `CA`, `NY`, `FL`

### Doctor Visits Validation
- **Type**: Integer
- **Range**: 0-50 visits per year
- **Default**: 4
- **Reason**: Realistic healthcare utilization

### Prescriptions Validation
- **Type**: Integer
- **Range**: 0-20 per month
- **Default**: 0
- **Reason**: Typical medication counts

### Distance Validation
- **Type**: Integer
- **Range**: 1-100 miles
- **Default**: 50 miles
- **Reason**: Reasonable search radius

### Monetary Amount Validation
- **Type**: Number (float)
- **Range**: Non-negative, up to 2 decimal places
- **Maximum**: Varies by field (premiums: $10,000, deductibles: $50,000)
- **Reason**: Prevent unrealistic values

### Array Validations
- **Chronic Conditions**: Max 10 items, each max 100 chars
- **Specialties**: Max 10 items, each max 100 chars
- **Reason**: Prevent abuse and ensure reasonable data

## Error Response Format

All validation errors return a consistent format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "age",
      "message": "Age must be at least 18"
    },
    {
      "field": "zipCode",
      "message": "ZIP code must be exactly 5 digits"
    }
  ]
}
```

### HTTP Status Codes
- **400 Bad Request**: Validation failed
- **500 Internal Server Error**: Unexpected validation error

## Usage Examples

### Valid Request
```bash
curl -X POST http://localhost:3001/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "zipCode": "90210",
    "state": "CA",
    "chronicConditions": ["diabetes"],
    "annualDoctorVisits": 8,
    "prescriptionCount": 3
  }'
```

**Response**: `200 OK` with calculation results

### Invalid Request - Age Too Young
```bash
curl -X POST http://localhost:3001/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 17,
    "zipCode": "90210",
    "state": "CA"
  }'
```

**Response**: `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "age",
      "message": "Age must be at least 18"
    }
  ]
}
```

### Invalid Request - Invalid ZIP Code
```bash
curl -X POST http://localhost:3001/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "zipCode": "ABC12",
    "state": "CA"
  }'
```

**Response**: `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "zipCode",
      "message": "ZIP code must be exactly 5 digits"
    }
  ]
}
```

### Multiple Validation Errors
```bash
curl -X POST http://localhost:3001/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 17,
    "zipCode": "ABC",
    "state": "CALIFORNIA",
    "annualDoctorVisits": -5
  }'
```

**Response**: `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "age",
      "message": "Age must be at least 18"
    },
    {
      "field": "zipCode",
      "message": "ZIP code must be exactly 5 digits"
    },
    {
      "field": "state",
      "message": "State code must be 2 characters"
    },
    {
      "field": "annualDoctorVisits",
      "message": "Doctor visits cannot be negative"
    }
  ]
}
```

## Advanced Features

### Strict Mode
All schemas use `.strict()` to reject unexpected fields:

```typescript
// This will fail validation
{
  "age": 35,
  "zipCode": "90210",
  "state": "CA",
  "hackerField": "injection attempt"  // ❌ Rejected
}
```

### Multiple Validation Targets
Validate body, query, and params simultaneously:

```typescript
router.get('/providers/:id',
  validateMultiple({
    params: ProviderIdSchema,
    query: PaginationSchema
  }),
  handler
);
```

### Optional Validation
For PATCH endpoints or optional fields:

```typescript
router.patch('/profile',
  validateOptional(ProfileUpdateSchema),
  handler
);
```

### Type Safety
Exported TypeScript types from schemas:

```typescript
import { ComparisonInput, ProviderSearchInput } from '../validators/schemas';

function handler(input: ComparisonInput) {
  // TypeScript knows all fields and types
  const { age, zipCode, state } = input;
}
```

## Testing

### Test File Location
`/home/bmurji/Development/DPC-Cost-Comparator/tests/validation/validation.test.examples.ts`

### Test Coverage
- Valid requests (minimal and complete)
- Edge cases (min/max values)
- Invalid data types
- Out-of-range values
- Malformed inputs
- Missing required fields
- Additional unexpected fields

### Running Tests
```bash
# Run validation tests
npm test -- validation

# Run all tests with coverage
npm run test:coverage
```

## Security Considerations

### What is Protected
✅ Type safety (strings, numbers, arrays)
✅ Range validation (min/max values)
✅ Format validation (regex patterns)
✅ Length limits (prevent DoS)
✅ Required fields enforcement
✅ Strict mode (no extra fields)

### What is NOT Protected
❌ SQL injection in business logic (use parameterized queries)
❌ XSS in responses (sanitize output separately)
❌ Authentication/authorization (use separate middleware)
❌ Rate limiting (use express-rate-limit)
❌ CSRF protection (use CSRF tokens)

## Best Practices

1. **Always validate at API boundary**: Don't trust client-side validation
2. **Fail fast**: Return errors immediately when validation fails
3. **Clear error messages**: Help developers debug issues
4. **Log validation failures**: Monitor for attack patterns
5. **Update schemas regularly**: As requirements evolve
6. **Test edge cases**: Min/max values, empty arrays, null values
7. **Document changes**: Update this doc when adding new validations

## Maintenance

### Adding New Validations

1. **Add schema** to `validators/schemas.ts`:
```typescript
export const NewFeatureSchema = z.object({
  field: z.string().min(1).max(100),
});
```

2. **Export types**:
```typescript
export type NewFeatureInput = z.infer<typeof NewFeatureSchema>;
```

3. **Apply to routes**:
```typescript
router.post('/new-feature', validateBody(NewFeatureSchema), handler);
```

4. **Add tests** to `tests/validation/validation.test.examples.ts`

5. **Update this documentation**

### Schema Versioning

When making breaking changes to validation:
1. Version your API endpoints (`/api/v2/...`)
2. Maintain old schemas for backward compatibility
3. Document migration path for clients
4. Set deprecation timeline for old endpoints

## Performance

- **Validation cost**: ~1-5ms per request
- **Async validation**: Uses `parseAsync()` for non-blocking
- **Schema compilation**: Schemas compiled once at startup
- **Memory overhead**: Minimal (~100KB for all schemas)

## Related Documentation

- [Zod Documentation](https://github.com/colinhacks/zod)
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Support

For questions or issues:
1. Check test examples for usage patterns
2. Review Zod error messages for details
3. Consult this documentation for rules
4. Contact the security team for guidance
