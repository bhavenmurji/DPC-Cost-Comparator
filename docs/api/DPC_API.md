# DPC Cost Comparator API Documentation

## Overview

The DPC Cost Comparator API provides endpoints for calculating healthcare cost comparisons between traditional insurance and Direct Primary Care (DPC) + Catastrophic coverage models.

## Base URL

```
http://localhost:4000/api
```

## Endpoints

### 1. Calculate Cost Comparison

Calculate comprehensive cost comparison between traditional insurance and DPC plans.

**Endpoint:** `POST /comparison/calculate`

**Request Body:**
```json
{
  "age": 35,
  "zipCode": "90210",
  "state": "CA",
  "chronicConditions": ["Diabetes", "Hypertension"],
  "annualDoctorVisits": 6,
  "prescriptionCount": 2,
  "currentPremium": 450,
  "currentDeductible": 1500
}
```

**Response:**
```json
{
  "success": true,
  "comparison": {
    "traditionalPremium": 450,
    "traditionalDeductible": 1500,
    "traditionalOutOfPocket": 930,
    "traditionalTotalAnnual": 7830,
    "dpcMonthlyFee": 85,
    "dpcAnnualFee": 1020,
    "catastrophicPremium": 135,
    "catastrophicDeductible": 8000,
    "catastrophicOutOfPocket": 360,
    "dpcTotalAnnual": 3000,
    "annualSavings": 4830,
    "percentageSavings": 61.7,
    "recommendedPlan": "DPC_CATASTROPHIC",
    "breakdown": {
      "traditional": {
        "premiums": 5400,
        "deductible": 1500,
        "copays": 210,
        "prescriptions": 720,
        "outOfPocket": 930,
        "total": 7830
      },
      "dpc": {
        "premiums": 1020,
        "catastrophicPremium": 1620,
        "deductible": 8000,
        "copays": 0,
        "prescriptions": 360,
        "outOfPocket": 360,
        "total": 3000
      }
    }
  },
  "providers": [
    {
      "provider": {
        "id": "prov-1",
        "npi": "1234567890",
        "name": "Dr. Sarah Johnson",
        "practiceName": "Johnson Family Medicine DPC",
        "city": "Springfield",
        "state": "CA",
        "monthlyFee": 75,
        "rating": 4.8,
        "phone": "555-0100"
      },
      "distanceMiles": 3.2,
      "matchScore": 95,
      "matchReasons": [
        "Very close to your location",
        "Highly rated by patients",
        "Specializes in Family Medicine, Internal Medicine"
      ]
    }
  ]
}
```

### 2. Find Matching Providers

Search for DPC providers based on location and criteria.

**Endpoint:** `POST /comparison/providers`

**Request Body:**
```json
{
  "zipCode": "90210",
  "state": "CA",
  "maxDistanceMiles": 50,
  "specialtiesNeeded": ["Family Medicine"],
  "chronicConditions": ["Diabetes"],
  "languagePreference": "Spanish",
  "maxMonthlyFee": 100,
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "providers": [...]
}
```

### 3. Get Provider Details

Retrieve detailed information about a specific DPC provider.

**Endpoint:** `GET /comparison/providers/:id`

**Response:**
```json
{
  "success": true,
  "provider": {
    "id": "prov-1",
    "npi": "1234567890",
    "name": "Dr. Sarah Johnson",
    "practiceName": "Johnson Family Medicine DPC",
    "address": "123 Main Street",
    "city": "Springfield",
    "state": "CA",
    "zipCode": "90210",
    "phone": "555-0100",
    "email": "contact@johnsonfamilydpc.com",
    "website": "https://johnsonfamilydpc.com",
    "monthlyFee": 75,
    "familyFee": 150,
    "acceptingPatients": true,
    "servicesIncluded": [
      "Unlimited office visits",
      "Same-day appointments",
      "Telemedicine",
      "Basic lab work"
    ],
    "specialties": ["Family Medicine", "Internal Medicine"],
    "rating": 4.8,
    "reviewCount": 127
  }
}
```

## Data Models

### ComparisonInput

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| age | number | Yes | Patient age (18-100) |
| zipCode | string | Yes | 5-digit ZIP code |
| state | string | Yes | 2-letter state code |
| chronicConditions | string[] | No | Array of chronic conditions |
| annualDoctorVisits | number | No | Visits per year (default: 4) |
| prescriptionCount | number | No | Monthly prescriptions (default: 0) |
| currentPremium | number | No | Current monthly premium |
| currentDeductible | number | No | Current annual deductible |

### Chronic Conditions

Common condition codes:
- `Diabetes`
- `Hypertension`
- `Asthma`
- `Arthritis`
- `High Cholesterol`
- `Depression/Anxiety`

### Provider Search Criteria

| Field | Type | Description |
|-------|------|-------------|
| zipCode | string | Search center ZIP code |
| state | string | State filter |
| maxDistanceMiles | number | Maximum distance (default: 50) |
| specialtiesNeeded | string[] | Required specialties |
| chronicConditions | string[] | Patient conditions |
| languagePreference | string | Preferred language |
| maxMonthlyFee | number | Maximum monthly DPC fee |
| limit | number | Results limit (default: 10) |

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: age, zipCode, state"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to calculate comparison"
}
```

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per hour per IP
- 1000 requests per day per authenticated user

## Authentication

Most endpoints are currently open for testing. In production:
- Add JWT authentication
- Require authentication for saving comparisons
- Implement role-based access control

## HIPAA Compliance

All requests are logged for audit purposes:
- IP address
- Timestamp
- User ID (if authenticated)
- Action performed
- Resource accessed

Do not log:
- Actual health condition details
- Personal identifiable information
- Financial information

## External API Integration

### Ribbon Health API

Used for provider directory and network verification (when API key is configured).

### Turquoise Health API

Used for procedure cost transparency (when API key is configured).

To configure external APIs, add keys to `.env`:
```
RIBBON_HEALTH_API_KEY=your_key_here
TURQUOISE_HEALTH_API_KEY=your_key_here
```

## Future Enhancements

1. **User Accounts**
   - Save comparison history
   - Favorite providers
   - Email notifications

2. **Advanced Calculations**
   - Family plan pricing
   - Age-banded premiums
   - State-specific regulations

3. **Provider Features**
   - Real-time availability
   - Online booking
   - Reviews and ratings

4. **Cost Transparency**
   - Procedure cost estimates
   - Prescription pricing
   - Network verification

## Support

For API support, contact: dev@healthpartnershipx.com
