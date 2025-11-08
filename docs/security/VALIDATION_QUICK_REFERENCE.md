# Input Validation Quick Reference

## TL;DR

All API endpoints now use Zod validation. Invalid requests return `400 Bad Request` with detailed error messages.

---

## Quick Start

### Importing Validation

```typescript
// Import middleware
import { validateBody, validateQuery, validateParams } from '../middleware/validation';

// Import schemas
import {
  ComparisonInputSchema,
  ProviderSearchSchema,
  ProviderIdSchema,
} from '../validators/schemas';
```

### Using Validation in Routes

```typescript
// Body validation (POST requests)
router.post('/calculate',
  validateBody(ComparisonInputSchema),
  async (req, res) => {
    // req.body is validated and type-safe
    const { age, zipCode, state } = req.body;
    // ...
  }
);

// Query validation (GET requests with query params)
router.get('/search',
  validateQuery(ProviderSearchSchema),
  async (req, res) => {
    // req.query is validated and type-safe
    const { zipCode, state, limit } = req.query;
    // ...
  }
);

// Params validation (GET /resource/:id)
router.get('/providers/:id',
  validateParams(ProviderIdSchema),
  async (req, res) => {
    // req.params is validated and type-safe
    const { id } = req.params;
    // ...
  }
);
```

---

## Validation Rules Cheat Sheet

| Field | Type | Min | Max | Format | Default | Required |
|-------|------|-----|-----|--------|---------|----------|
| `age` | int | 18 | 100 | - | - | ✅ |
| `zipCode` | string | 5 | 5 | `/^\d{5}$/` | - | ✅ |
| `state` | string | 2 | 2 | US state code | - | ✅ |
| `annualDoctorVisits` | int | 0 | 50 | - | 4 | ❌ |
| `prescriptionCount` | int | 0 | 20 | - | 0 | ❌ |
| `chronicConditions` | array | - | 10 items | max 100 chars each | `[]` | ❌ |
| `currentPremium` | float | 0 | 10000 | 2 decimals | - | ❌ |
| `currentDeductible` | float | 0 | 50000 | 2 decimals | - | ❌ |
| `maxDistanceMiles` | int | 1 | 100 | - | 50 | ❌ |
| `limit` | int | 1 | 50 | - | 10 | ❌ |

---

## Common Validation Errors

### 1. Invalid Age
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

### 2. Invalid ZIP Code
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

### 3. Invalid State Code
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "state",
      "message": "Invalid US state code"
    }
  ]
}
```

### 4. Missing Required Field
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "zipCode",
      "message": "Required"
    }
  ]
}
```

### 5. Unknown Field (Strict Mode)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "unknownField",
      "message": "Unrecognized key(s) in object"
    }
  ]
}
```

---

## Test Your Endpoint

### Valid Request
```bash
curl -X POST http://localhost:3001/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "zipCode": "90210",
    "state": "CA"
  }'
```
**Expected**: `200 OK`

### Invalid Request
```bash
curl -X POST http://localhost:3001/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 17,
    "zipCode": "ABC",
    "state": "CA"
  }'
```
**Expected**: `400 Bad Request` with error details

---

## Creating New Schemas

### Step 1: Define Schema
```typescript
// src/backend/validators/schemas.ts
export const MyNewSchema = z.object({
  field1: z.string().min(1).max(100),
  field2: z.number().int().min(0).max(100),
  field3: z.array(z.string()).max(10).optional(),
}).strict();
```

### Step 2: Export Type
```typescript
export type MyNewInput = z.infer<typeof MyNewSchema>;
```

### Step 3: Apply to Route
```typescript
router.post('/my-endpoint',
  validateBody(MyNewSchema),
  handler
);
```

### Step 4: Write Tests
```typescript
describe('MyNewSchema', () => {
  it('should accept valid request', async () => {
    const response = await request(app)
      .post('/my-endpoint')
      .send({ field1: 'test', field2: 50 });
    expect(response.status).toBe(200);
  });
});
```

---

## Troubleshooting

### Problem: Validation always fails
**Solution**: Check that data types match (strings as strings, numbers as numbers)

### Problem: Optional fields cause errors
**Solution**: Ensure schema uses `.optional()` or `.default(value)`

### Problem: Error messages unclear
**Solution**: Add custom error messages with `.min(10, 'Must be at least 10')`

### Problem: Need to accept additional fields
**Solution**: Remove `.strict()` from schema (not recommended for security)

### Problem: Validation too slow
**Solution**: Use `.parseAsync()` for non-blocking validation (already implemented)

---

## Advanced Usage

### Multiple Validations
```typescript
router.get('/providers/:id',
  validateMultiple({
    params: ProviderIdSchema,
    query: PaginationSchema,
  }),
  handler
);
```

### Optional Validation (PATCH endpoints)
```typescript
router.patch('/profile',
  validateOptional(ProfileUpdateSchema),
  handler
);
```

### Custom Validation
```typescript
const CustomSchema = z.object({
  email: z.string().email().refine(
    async (email) => await isEmailUnique(email),
    { message: 'Email already exists' }
  ),
});
```

---

## Resources

- **Full Documentation**: `/home/bmurji/Development/DPC-Cost-Comparator/docs/security/INPUT_VALIDATION.md`
- **Test Examples**: `/home/bmurji/Development/DPC-Cost-Comparator/tests/validation/validation.test.examples.ts`
- **Zod Docs**: https://github.com/colinhacks/zod
- **OWASP Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

---

## Common Patterns

### Age Range
```typescript
z.number().int().min(18).max(100)
```

### ZIP Code
```typescript
z.string().regex(/^\d{5}$/)
```

### US State Code
```typescript
z.string().length(2).regex(/^[A-Z]{2}$/)
```

### Email
```typescript
z.string().email()
```

### URL
```typescript
z.string().url()
```

### UUID
```typescript
z.string().uuid()
```

### Phone Number (US)
```typescript
z.string().regex(/^\d{10}$/)
```

### Money (2 decimals)
```typescript
z.number().nonnegative().refine(
  val => /^\d+(\.\d{0,2})?$/.test(val.toString())
)
```

### Array with Max Items
```typescript
z.array(z.string()).max(10)
```

### Optional with Default
```typescript
z.number().default(10).optional()
```

---

## TypeScript Integration

```typescript
import { z } from 'zod';
import type { ComparisonInput } from '../validators/schemas';

// Type-safe handler
async function handler(req: Request<{}, {}, ComparisonInput>, res: Response) {
  // req.body is typed as ComparisonInput
  const { age, zipCode, state } = req.body;

  // TypeScript knows all field types
  const ageString: string = age.toString(); // OK
  const zipLength: number = zipCode.length; // OK
}
```

---

## Quick Checklist

When adding validation to an endpoint:

- [ ] Import validation middleware
- [ ] Import or create schema
- [ ] Apply middleware before handler
- [ ] Remove manual validation code
- [ ] Test with valid request
- [ ] Test with invalid request
- [ ] Verify error format
- [ ] Update API documentation
- [ ] Add test cases
- [ ] Check TypeScript types

---

## Performance Tips

1. **Reuse schemas**: Don't create new schemas per request
2. **Use async validation**: Already implemented via `parseAsync()`
3. **Compile once**: Schemas compiled at module load
4. **Skip validation in development**: Use environment flags if needed
5. **Monitor metrics**: Track validation times in production

---

## Security Reminders

✅ **DO**: Validate all user inputs at API boundary
✅ **DO**: Use strict mode to reject unknown fields
✅ **DO**: Set reasonable max limits on arrays and strings
✅ **DO**: Return clear error messages
✅ **DO**: Log validation failures for monitoring

❌ **DON'T**: Trust client-side validation alone
❌ **DON'T**: Skip validation for "trusted" clients
❌ **DON'T**: Expose internal error details
❌ **DON'T**: Allow unlimited array sizes
❌ **DON'T**: Accept arbitrary string lengths

---

**Last Updated**: 2025-10-30
**Version**: 1.0.0
