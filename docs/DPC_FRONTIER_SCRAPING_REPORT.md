# DPC Frontier Detail Scraping Report

## Summary

- **Total Providers Processed**: 2759
- **Successfully Scraped**: 2759 (100%)
- **Failed**: 0
- **Not Found (404)**: 0
- **Rate Limited**: 0

## Data Quality Metrics

| Field | Count | Percentage |
|-------|-------|------------|
| Has Name | 2735 | 99% |
| Has Address | 2759 | 100% |
| Has Phone | 2518 | 91% |
| Has Website | 2759 | 100% |
| Has Email | 8 | 0% |
| Has Pricing | 2150 | 78% |
| Has Physicians | 3 | 0% |

## Sample Enriched Data

```json
[
  {
    "id": "aaetqgycsnre",
    "name": "Preferred Family Medicine",
    "description": "The concierge direct primary care practice of Christopher Highley D.O., Amy Scullion M.D., and Jeremy Bearfield M.D., Ph.D.  located in South Reno, NV. Membership includes comprehensive primary medical care for all ages,  unlimited visits, in-house lab draws, in-house pharmacy, direct access, a wellness program, and minor procedures. ",
    "website": "https://preferredfamilymedicine.com",
    "phone": "775-204-0150",
    "fax": "775-501-6360",
    "specialty": "Family Medicine",
    "address": {
      "street": "9120 Double Diamond Pkwy",
      "city": "Reno",
      "state": "NV",
      "zip": "89521"
    },
    "coordinates": {
      "lat": 39.4470824,
      "lng": -119.7478973
    },
    "pricing": {
      "monthlyFee": 175,
      "annualFee": 0,
      "enrollmentFee": 0
    },
    "physicians": [
      "Christopher Highley",
      "Amy Scullion",
      "Jeremy Bearfield"
    ],
    "acceptingPatients": true
  },
  {
    "id": "aanbwfyumqga",
    "name": "Campbell Family Medicine",
    "description": "Campbell Family Medicine is a membership-based \"direct primary care\" or concierge integrative medical practice. Natural remedies and lifestyle medicine achieve root cause resolution of chronic illness and help prevent heart attack, stroke and dementia. ",
    "website": "http://campbellfamilymedicine.com/",
    "phone": "678-474-4742",
    "fax": "678-474-4924",
    "specialty": "Family Medicine",
    "address": {
      "street": "910 Haw Creek Road",
      "city": "Cumming",
      "state": "GA",
      "zip": "30041"
    },
    "coordinates": {
      "lat": 34.1713812,
      "lng": -84.1340566
    },
    "pricing": {
      "monthlyFee": 359,
      "enrollmentFee": 359
    },
    "physicians": [],
    "acceptingPatients": true
  },
  {
    "id": "aaubzigwvont",
    "name": "Superior Health and Wellness, DPC",
    "website": "https://superiorhealthandwellnessdpc.com",
    "phone": "321-238-8048",
    "specialty": "Family Medicine",
    "address": {
      "street": "835 Oakley Seaver Drive ",
      "city": "Clermont ",
      "state": "Florida",
      "zip": "34711"
    },
    "coordinates": {
      "lat": 28.5526776,
      "lng": -81.7257508
    },
    "pricing": {
      "monthlyFee": 0,
      "enrollmentFee": 0
    },
    "acceptingPatients": true
  },
  {
    "id": "aaudmxqmbwst",
    "name": "Upper Echelon Medical",
    "description": "Orange County's First Integrative Direct Primary Care",
    "website": "https://www.upperechelonmedical.com",
    "phone": "657-212-3212",
    "fax": "657-212-3255",
    "specialty": "Family Medicine",
    "address": {
      "street": "1440 N Harbor Blvd, Suite 110",
      "city": "Fullerton",
      "state": "California",
      "zip": "92835"
    },
    "coordinates": {
      "lat": 33.8854656,
      "lng": -117.9253824
    },
    "pricing": {
      "monthlyFee": 125,
      "enrollmentFee": 125
    },
    "physicians": [],
    "acceptingPatients": true
  },
  {
    "id": "aawcdpmvabdl",
    "name": "Fort Myers DPC",
    "description": "Affordable Primary Care services with easy access to your provider to get the help you need whenever you needed. Hablamos Español",
    "website": "https://fortmyersdpc.com",
    "phone": "239-313-7030",
    "fax": "239-313-7755",
    "specialty": "Family Medicine",
    "address": {
      "street": "4755 Summerlin Rd, Unit 7",
      "city": "Fort Myers ",
      "state": "Florida",
      "zip": "33919"
    },
    "coordinates": {
      "lat": 26.5921717,
      "lng": -81.88311449999999
    },
    "pricing": {
      "monthlyFee": 5,
      "enrollmentFee": 250
    },
    "physicians": [],
    "acceptingPatients": true
  }
]
```

## Errors

No errors

## Next Steps

1. Review failed providers and retry with longer delays
2. Manually verify data quality for sample providers
3. Consider additional data sources for missing information
4. Update frontend to display enriched provider information

---
Generated: 2025-11-16T20:47:54.438Z
