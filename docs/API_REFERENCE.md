# API Reference - Ignite Health Partnerships

## Base URL

```
http://localhost:4000
```

## Authentication

Currently, the API does not require authentication. Authentication will be added in future versions.

---

## Provider Endpoints

### Search Providers

Search for DPC providers by location.

**Endpoint:** `GET /api/providers/search`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `zipCode` | string | Yes | - | 5-digit ZIP code |
| `radius` | number | No | 25 | Search radius in miles (1-100) |
| `limit` | number | No | 20 | Number of results (1-100) |
| `offset` | number | No | 0 | Pagination offset |

**Example Request:**

```bash
curl "http://localhost:4000/api/providers/search?zipCode=10001&radius=25&limit=10"
```

**Example Response:**

```json
{
  "success": true,
  "count": 10,
  "searchParams": {
    "zipCode": "10001",
    "radius": 25,
    "limit": 10,
    "offset": 0
  },
  "coordinates": {
    "lat": 40.7506,
    "lng": -73.9971
  },
  "providers": [
    {
      "id": "abc123",
      "name": "Downtown Health DPC",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "phone": "(212) 555-1234",
      "website": "https://downtownhealthdpc.com",
      "monthlyFee": 75,
      "servicesOffered": ["Lab Discounts", "Home Visits"],
      "rating": 4.5,
      "verified": true,
      "distance": 0.5,
      "location": {
        "latitude": 40.7506,
        "longitude": -73.9971
      },
      "dataSource": {
        "source": "dpc_frontier",
        "lastScraped": "2025-01-09T10:30:00Z",
        "dataQualityScore": 85
      }
    }
  ]
}
```

---

### Get Provider by ID

Get detailed information for a single provider.

**Endpoint:** `GET /api/providers/:id`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Provider ID |

**Example Request:**

```bash
curl "http://localhost:4000/api/providers/abc123"
```

**Example Response:**

```json
{
  "success": true,
  "provider": {
    "id": "abc123",
    "name": "Downtown Health DPC",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "phone": "(212) 555-1234",
    "website": "https://downtownhealthdpc.com",
    "monthlyFee": 75,
    "servicesOffered": ["Lab Discounts", "Home Visits", "Medication Dispensing"],
    "rating": 4.5,
    "verified": true,
    "location": {
      "latitude": 40.7506,
      "longitude": -73.9971
    },
    "dataSource": {
      "source": "dpc_frontier",
      "sourceUrl": "https://mapper.dpcfrontier.com/practice/abc123",
      "lastScraped": "2025-01-09T10:30:00Z",
      "dataQualityScore": 85,
      "verified": true
    },
    "createdAt": "2025-01-09T08:00:00Z",
    "updatedAt": "2025-01-09T10:30:00Z"
  }
}
```

---

### Get Provider Statistics

Get aggregated statistics about DPC providers.

**Endpoint:** `GET /api/providers/stats/summary`

**Example Request:**

```bash
curl "http://localhost:4000/api/providers/stats/summary"
```

**Example Response:**

```json
{
  "success": true,
  "stats": {
    "total": 2734,
    "verified": 2100,
    "averageMonthlyFee": 78.50,
    "topStates": [
      { "state": "CA", "count": 312 },
      { "state": "TX", "count": 289 },
      { "state": "FL", "count": 245 },
      { "state": "NY", "count": 187 },
      { "state": "IL", "count": 156 }
    ]
  }
}
```

---

## Prescription Endpoints

### Search Medications

Search for medications by name.

**Endpoint:** `GET /api/prescriptions/search`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` or `query` | string | Yes | Search term (medication name) |

**Example Request:**

```bash
curl "http://localhost:4000/api/prescriptions/search?q=lisinopril"
```

**Example Response:**

```json
{
  "success": true,
  "count": 1,
  "query": "lisinopril",
  "medications": [
    {
      "medicationName": "Lisinopril",
      "genericName": "Lisinopril",
      "strength": "2.5mg, 5mg, 10mg, 20mg, 40mg",
      "form": "Tablet",
      "category": "Cardiovascular",
      "conditions": ["High Blood Pressure", "Heart Failure"],
      "pricing": {
        "walmart4Dollar": {
          "price30Day": 4.00,
          "price90Day": 10.00,
          "available": true
        }
      }
    }
  ]
}
```

---

### Get Medication Pricing

Get pricing information for a specific medication.

**Endpoint:** `GET /api/prescriptions/pricing`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` or `medicationName` | string | Yes | Medication name |
| `genericName` | string | No | Generic name |
| `strength` | string | No | Dosage strength |

**Example Request:**

```bash
curl "http://localhost:4000/api/prescriptions/pricing?name=Metformin&genericName=Metformin+HCl&strength=500mg"
```

**Example Response:**

```json
{
  "success": true,
  "medication": {
    "medicationName": "Metformin",
    "genericName": "Metformin HCl",
    "strength": "500mg",
    "pricing": {
      "walmart4Dollar": {
        "price30Day": 4.00,
        "price90Day": 10.00,
        "available": true
      },
      "estimated": {
        "lowPrice": 8.00,
        "highPrice": 20.00,
        "averagePrice": 12.00,
        "source": "ESTIMATE"
      }
    }
  }
}
```

---

### Calculate Prescription Costs

Calculate total costs for multiple medications.

**Endpoint:** `POST /api/prescriptions/calculate-costs`

**Request Body:**

```json
{
  "medications": ["Lisinopril", "Metformin", "Atorvastatin"]
}
```

**Validation:**
- `medications`: Array of strings (1-20 medications)

**Example Request:**

```bash
curl -X POST "http://localhost:4000/api/prescriptions/calculate-costs" \
  -H "Content-Type: application/json" \
  -d '{
    "medications": ["Lisinopril", "Metformin", "Atorvastatin"]
  }'
```

**Example Response:**

```json
{
  "success": true,
  "summary": {
    "medications": [
      {
        "medicationName": "Lisinopril",
        "genericName": "Lisinopril",
        "pricing": {
          "walmart4Dollar": {
            "price30Day": 4.00,
            "price90Day": 10.00,
            "available": true
          }
        },
        "category": "Cardiovascular",
        "conditions": ["High Blood Pressure", "Heart Failure"]
      },
      {
        "medicationName": "Metformin",
        "genericName": "Metformin HCl",
        "pricing": {
          "walmart4Dollar": {
            "price30Day": 4.00,
            "price90Day": 10.00,
            "available": true
          }
        },
        "category": "Diabetes",
        "conditions": ["Type 2 Diabetes"]
      },
      {
        "medicationName": "Atorvastatin",
        "genericName": "Atorvastatin Calcium",
        "pricing": {
          "walmart4Dollar": {
            "price30Day": 4.00,
            "price90Day": 10.00,
            "available": true
          }
        },
        "category": "Cholesterol",
        "conditions": ["High Cholesterol"]
      }
    ],
    "totalMonthly": 12.00,
    "totalAnnual": 144.00,
    "savingsPrograms": {
      "walmart": {
        "availableCount": 3,
        "monthlyCost": 12.00,
        "annualCost": 144.00,
        "savings": 576.00
      },
      "costco": {
        "estimatedMonthlyCost": 12.00,
        "estimatedAnnualCost": 144.00,
        "membershipCost": 60.00,
        "totalAnnualWithMembership": 204.00
      }
    },
    "recommendations": [
      "All 3 medications are available in Walmart's $4 program! This could save you significantly.",
      "Paying cash at Walmart could save you $576.00/year vs typical insurance copays."
    ]
  }
}
```

---

### Get Walmart $4 Program

Get complete details of Walmart's $4/$10 prescription program.

**Endpoint:** `GET /api/prescriptions/walmart-program`

**Example Request:**

```bash
curl "http://localhost:4000/api/prescriptions/walmart-program"
```

**Example Response:**

```json
{
  "success": true,
  "program": {
    "id": "walmart-4-dollar",
    "name": "Walmart $4 Prescriptions",
    "pharmacy": "Walmart",
    "type": "GENERIC_DISCOUNT",
    "requiresMembership": false,
    "medicationCount": 30,
    "medications": [
      {
        "id": "walmart-4-amlodipine",
        "name": "Amlodipine",
        "genericName": "Amlodipine Besylate",
        "strength": "2.5mg, 5mg, 10mg",
        "form": "Tablet",
        "category": "Cardiovascular",
        "conditions": ["High Blood Pressure", "Angina"],
        "price30Day": 4.00,
        "price90Day": 10.00
      }
    ],
    "lastVerified": "2025-01-09T00:00:00Z"
  }
}
```

---

### Get All Pharmacy Programs

List all pharmacy savings programs.

**Endpoint:** `GET /api/prescriptions/programs`

**Example Request:**

```bash
curl "http://localhost:4000/api/prescriptions/programs"
```

**Example Response:**

```json
{
  "success": true,
  "count": 1,
  "programs": [
    {
      "id": "walmart-4-dollar",
      "name": "Walmart $4 Prescriptions",
      "pharmacy": "Walmart",
      "type": "GENERIC_DISCOUNT",
      "requiresMembership": false,
      "membershipCost": null,
      "medicationCount": 30,
      "lastVerified": "2025-01-09T00:00:00Z"
    }
  ]
}
```

---

## Cost Comparison Endpoints

### Calculate Cost Comparison

Compare DPC + Catastrophic insurance vs Traditional insurance.

**Endpoint:** `POST /api/comparison/calculate`

**Request Body:**

```json
{
  "age": 35,
  "zipCode": "10001",
  "state": "NY",
  "income": 50000,
  "chronicConditions": [],
  "annualDoctorVisits": 3,
  "prescriptionCount": 2,
  "currentPremium": 400,
  "currentDeductible": 3000
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:4000/api/comparison/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "zipCode": "10001",
    "state": "NY",
    "income": 50000,
    "chronicConditions": [],
    "annualDoctorVisits": 3,
    "prescriptionCount": 2
  }'
```

**Example Response:**

```json
{
  "success": true,
  "comparison": {
    "traditional": {
      "monthlyPremium": 400,
      "annualPremium": 4800,
      "deductible": 3000,
      "totalAnnualCost": 7800
    },
    "dpcCatastrophic": {
      "dpcMembershipMonthly": 75,
      "dpcMembershipAnnual": 900,
      "catastrophicPremiumMonthly": 150,
      "catastrophicPremiumAnnual": 1800,
      "catastrophicDeductible": 8000,
      "estimatedOutOfPocketCosts": 500,
      "totalAnnualCost": 3200
    },
    "savings": 4600,
    "savingsPercentage": 59.0
  },
  "providers": [
    {
      "id": "abc123",
      "name": "Downtown Health DPC",
      "distance": 0.5,
      "monthlyFee": 75
    }
  ],
  "dataSource": "api",
  "planDetails": {
    "catastrophic": {
      "monthlyPremium": 150,
      "deductible": 8000,
      "outOfPocketMax": 9100
    }
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

### Validation Error (400)

```json
{
  "success": false,
  "error": "Invalid request parameters",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["zipCode"],
      "message": "Expected string, received number"
    }
  ]
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Provider not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Failed to search providers"
}
```

---

## Rate Limiting

Currently, there are no rate limits. Rate limiting will be implemented in future versions.

---

## Pagination

Endpoints that support pagination use `limit` and `offset` query parameters:

- `limit`: Number of results to return (default: 20, max: 100)
- `offset`: Number of results to skip (default: 0)

Example:
```bash
# Get results 21-40
curl "http://localhost:4000/api/providers/search?zipCode=10001&limit=20&offset=20"
```

---

## Versioning

Current API version: **0.2.0**

The API version is included in all root endpoint responses.

---

## Complete API Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/api/providers/search` | Search providers by location |
| GET | `/api/providers/:id` | Get provider details |
| GET | `/api/providers/stats/summary` | Get provider statistics |
| GET | `/api/prescriptions/search` | Search medications |
| GET | `/api/prescriptions/pricing` | Get medication pricing |
| POST | `/api/prescriptions/calculate-costs` | Calculate prescription costs |
| GET | `/api/prescriptions/walmart-program` | Get Walmart $4 program |
| GET | `/api/prescriptions/programs` | List pharmacy programs |
| POST | `/api/comparison/calculate` | Calculate cost comparison |

---

## Testing the API

### Using cURL

```bash
# Test health check
curl http://localhost:4000/health

# Test provider search
curl "http://localhost:4000/api/providers/search?zipCode=10001&radius=25"

# Test prescription search
curl "http://localhost:4000/api/prescriptions/search?q=metformin"

# Test cost calculation
curl -X POST http://localhost:4000/api/prescriptions/calculate-costs \
  -H "Content-Type: application/json" \
  -d '{"medications": ["Lisinopril", "Metformin"]}'
```

### Using Postman

Import the following collection:

```json
{
  "info": {
    "name": "Ignite Health Partnerships API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Providers",
      "item": [
        {
          "name": "Search Providers",
          "request": {
            "method": "GET",
            "url": "http://localhost:4000/api/providers/search?zipCode=10001&radius=25"
          }
        }
      ]
    },
    {
      "name": "Prescriptions",
      "item": [
        {
          "name": "Search Medications",
          "request": {
            "method": "GET",
            "url": "http://localhost:4000/api/prescriptions/search?q=metformin"
          }
        }
      ]
    }
  ]
}
```

---

## Next Steps

1. **Populate Database**: Run `npm run scrape:dpc` to add real provider data
2. **Import Walmart Program**: Run `npm run import:walmart` for prescription pricing
3. **Start Server**: Run `npm run dev` to start the API
4. **Test Endpoints**: Use cURL or Postman to test all endpoints
5. **Build Frontend**: Integrate these endpoints into your React/Next.js frontend

---

## Support

- **Documentation**: See `/docs` folder
- **Issues**: Report at GitHub repository
- **Setup Guide**: See [GETTING_STARTED.md](GETTING_STARTED.md)
