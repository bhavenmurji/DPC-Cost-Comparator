# Legal Compliance Checklist
## Data Integration for DPC Cost Comparator

**Date:** October 30, 2025
**Status:** Pre-Implementation Review Required
**Priority:** CRITICAL

---

## Executive Summary

This checklist ensures compliance with all data source terms of service, licensing agreements, and legal requirements for integrating real-world health insurance data.

**CRITICAL DECISION REQUIRED:**
Before proceeding with implementation, determine if the DPC Cost Comparator is:
- [ ] **Non-Commercial** (research, public service, educational)
- [ ] **Commercial** (for-profit SaaS, revenue-generating)

This decision determines which data sources can be legally used.

---

## Pre-Implementation Checklist

### 1. Business Model Classification

**Status:** ⚠️ REQUIRES DECISION

- [ ] Define primary business model:
  - [ ] Non-profit / Public Service
  - [ ] Commercial SaaS (paid subscriptions)
  - [ ] Freemium (free with paid upgrades)
  - [ ] Advertising-supported
  - [ ] Affiliate marketing (DPC provider referrals)

- [ ] Document revenue streams:
  - [ ] User subscriptions: $____/month
  - [ ] Provider listings: $____/provider
  - [ ] Advertising: $____/year
  - [ ] Data licensing: $____/year
  - [ ] Other: ________________

- [ ] Legal review by attorney:
  - [ ] Attorney consulted: Name __________ Date __________
  - [ ] Opinion on "commercial use": ________________
  - [ ] Signed legal opinion on file: [ ] Yes [ ] No

**Impact:** Determines if RWJF HIX Compare data can be used.

---

## Data Source Compliance Matrix

### 2. CMS Healthcare.gov API

**License:** Public Domain (Federal Government Data)
**Commercial Use:** ✅ Permitted
**Status:** 🟢 Low Risk

#### Requirements Checklist

- [ ] **Registration:**
  - [ ] Registered for Healthcare.gov developer account
  - [ ] API key obtained: Key ID __________
  - [ ] Developer agreement signed: Date __________

- [ ] **Terms of Service Compliance:**
  - [ ] Read full ToS: https://www.healthcare.gov/developers/terms-of-service
  - [ ] Understand prohibited uses (misrepresentation of plans)
  - [ ] Agree to update data regularly (at least quarterly)
  - [ ] Will not cache data longer than permitted (verify current limit)

- [ ] **Attribution Requirements:**
  - [ ] Display "Data provided by Centers for Medicare & Medicaid Services"
  - [ ] Link to https://www.healthcare.gov on all pages using CMS data
  - [ ] Include "Last Updated: [DATE]" for all plan information
  - [ ] Disclaimer: "Verify plan details with insurance provider"

- [ ] **Data Accuracy:**
  - [ ] Will not alter or misrepresent plan information
  - [ ] Will display all material plan details (not selectively hide)
  - [ ] Will update data when CMS releases updates

- [ ] **Rate Limiting:**
  - [ ] Implement rate limiting per API guidelines
  - [ ] Respect Retry-After headers
  - [ ] Will not scrape or bypass API

**Compliance Code Review:**
```typescript
// Example attribution implementation
const cmsAttribution = {
  source: "Centers for Medicare & Medicaid Services",
  url: "https://www.healthcare.gov",
  lastUpdated: new Date().toISOString(),
  disclaimer: "Verify plan details with your insurance provider"
}
```

---

### 3. HCCI HealthPrices.org

**License:** Public Access (Verify Current Terms)
**Commercial Use:** ⚠️ VERIFY REQUIRED
**Status:** 🟡 Medium Risk

#### Requirements Checklist

- [ ] **Terms Verification:**
  - [ ] Read current ToS: https://healthprices.org/terms
  - [ ] Confirm commercial use is permitted: [ ] Yes [ ] No [ ] Unclear
  - [ ] If commercial use restricted, determine if we qualify for exception
  - [ ] Document ToS version reviewed: Version _____ Date _____

- [ ] **Attribution Requirements:**
  - [ ] Display "Cost data from Health Care Cost Institute (HCCI)"
  - [ ] Link to https://healthprices.org
  - [ ] Include data year in all cost displays
  - [ ] Cite methodology if making cost comparisons

- [ ] **Data Usage Limitations:**
  - [ ] Will not resell raw HCCI data
  - [ ] Will only use for cost comparison purposes
  - [ ] Will not misrepresent cost data
  - [ ] Understand geographic level restrictions (if any)

- [ ] **Update Frequency:**
  - [ ] Check for data updates quarterly
  - [ ] Invalidate cached data older than ____ months (verify in ToS)

**Action Required:**
- [ ] Email HCCI support to confirm commercial use: ___________@hccci.org
- [ ] Document response in legal files
- [ ] If commercial use prohibited, identify alternative data source

---

### 4. RWJF HIX Compare Dataset

**License:** Non-Commercial Use Only
**Commercial Use:** ❌ PROHIBITED
**Status:** 🔴 HIGH RISK FOR COMMERCIAL USE

#### Critical Decision Point

**If DPC Cost Comparator is COMMERCIAL:**
- [ ] **DO NOT use RWJF data** in production
- [ ] Remove RWJF integration from roadmap
- [ ] Find alternative data source (e.g., Turquoise Health API)
- [ ] Update architecture to use only CMS + HCCI

**If DPC Cost Comparator is NON-COMMERCIAL:**
- [ ] Proceed with RWJF integration
- [ ] Complete checklist below

#### Non-Commercial Use Checklist

- [ ] **Registration & Access:**
  - [ ] Registered on RWJF website
  - [ ] Downloaded data use agreement
  - [ ] Signed data use agreement: Date __________
  - [ ] Agreement on file: Location __________

- [ ] **License Compliance:**
  - [ ] Read full license: https://www.rwjf.org/en/library/research/...
  - [ ] Understand "non-commercial" definition
  - [ ] Confirm our use case qualifies
  - [ ] No revenue generation from RWJF data

- [ ] **Attribution Requirements:**
  - [ ] Display "Data from Robert Wood Johnson Foundation HIX Compare"
  - [ ] Include full citation in About/Credits page
  - [ ] Link to RWJF research library
  - [ ] Include data year in attribution

- [ ] **Redistribution Restrictions:**
  - [ ] Will not redistribute raw CSV files
  - [ ] Will not provide bulk data downloads
  - [ ] API responses will be processed/aggregated data only
  - [ ] No direct access to raw RWJF data via our API

- [ ] **Permitted Uses:**
  - [ ] Research: [ ] Yes [ ] No [ ] N/A
  - [ ] Public Service: [ ] Yes [ ] No [ ] N/A
  - [ ] Educational: [ ] Yes [ ] No [ ] N/A
  - [ ] Journalism: [ ] Yes [ ] No [ ] N/A

**Monitoring:**
- [ ] Quarterly review: Is our use still non-commercial?
- [ ] If business model changes to commercial, immediately stop using RWJF data

**Legal Risk Assessment:**
Risk Level: 🔴 HIGH (if commercial) | 🟢 LOW (if non-commercial)

---

### 5. KFF Marketplace Calculator

**License:** Public Website (Logic Analysis Only)
**Commercial Use:** ⚠️ Logic replication permitted, scraping prohibited
**Status:** 🟡 Medium Risk

#### Requirements Checklist

- [ ] **Permissible Use:**
  - [ ] Will analyze publicly available methodology
  - [ ] Will not scrape or automate tool usage
  - [ ] Will not copy KFF branding or trade dress
  - [ ] Will implement algorithms independently (clean room)

- [ ] **Attribution (Optional but Recommended):**
  - [ ] If methodology influenced by KFF logic, cite in documentation
  - [ ] Link to KFF calculator as reference tool
  - [ ] No implication of KFF endorsement

- [ ] **Data Validation:**
  - [ ] Cross-validate our calculations with KFF results
  - [ ] Document differences in methodology
  - [ ] Prefer CMS official calculations over KFF estimations

**Legal Guidance:**
Analyzing publicly available calculation logic is generally permissible. However:
- [ ] Consult attorney if planning to claim "KFF-based calculations"
- [ ] Do not imply partnership or endorsement

---

### 6. GitHub Health Plan Comparison Tool

**License:** Open Source (Verify Specific License)
**Commercial Use:** Depends on license
**Status:** 🟡 Medium Risk

#### Requirements Checklist

- [ ] **License Review:**
  - [ ] Repository URL: __________
  - [ ] License identified: [ ] MIT [ ] Apache [ ] GPL [ ] Other: ______
  - [ ] License allows commercial use: [ ] Yes [ ] No
  - [ ] License requires attribution: [ ] Yes [ ] No
  - [ ] License requires sharing modifications: [ ] Yes [ ] No (copyleft)

- [ ] **MIT/Apache License (Permissive):**
  - [ ] Include original license text in codebase
  - [ ] Attribute original authors
  - [ ] Maintain copyright notices

- [ ] **GPL/AGPL License (Copyleft):**
  - [ ] Entire codebase must be open-sourced
  - [ ] Must publish modifications
  - [ ] May conflict with commercial model
  - [ ] **Legal review required before use**

- [ ] **Usage Plan:**
  - [ ] Use as reference only: [ ] Yes [ ] No
  - [ ] Copy code directly: [ ] Yes [ ] No
  - [ ] Modify and integrate: [ ] Yes [ ] No
  - [ ] Reverse engineer methodology: [ ] Yes [ ] No

**Decision:**
- [ ] If GPL/AGPL: Do not use code, analyze methodology only
- [ ] If MIT/Apache: Comply with attribution requirements

---

## Implementation Safeguards

### 7. Attribution System

**Status:** 🔧 TO BE IMPLEMENTED

- [ ] **Automatic Attribution Injection:**
  - [ ] Create `attributions` field in API responses
  - [ ] Include source, license, citation, URL
  - [ ] Display attributions on frontend
  - [ ] Test: All API responses include attributions

- [ ] **User-Facing Attribution:**
  - [ ] "About Our Data" page created
  - [ ] Footer includes data source links
  - [ ] Hover tooltips show data sources
  - [ ] Print/export includes attributions

- [ ] **Code Implementation:**
  ```typescript
  interface Attribution {
    source: string
    license: string
    citation: string
    url: string
    termsUrl: string
    commercialUse: boolean
  }
  ```

---

### 8. Commercial Use Checks

**Status:** 🔧 TO BE IMPLEMENTED

- [ ] **Environment Checks:**
  - [ ] Detect production vs development environment
  - [ ] Block RWJF data in production if commercial
  - [ ] Log warnings when non-commercial data used commercially

- [ ] **Code Implementation:**
  ```typescript
  function checkCommercialUsage(dataSource: string): void {
    const attr = attributions[dataSource]
    if (!attr.commercialUse && process.env.NODE_ENV === 'production') {
      throw new Error(`Cannot use ${dataSource} for commercial purposes`)
    }
  }
  ```

- [ ] **Testing:**
  - [ ] Unit test: Commercial check blocks RWJF in production
  - [ ] Integration test: Fallback to CMS when RWJF blocked

---

### 9. Privacy & Data Protection

**Status:** ⚠️ REQUIRES REVIEW

- [ ] **Personal Data Handling:**
  - [ ] Age: [ ] Cache [ ] Do Not Cache
  - [ ] Income: [ ] Cache [ ] Do Not Cache
  - [ ] ZIP Code: [ ] Cache [ ] Do Not Cache
  - [ ] Health Conditions: [ ] Cache [ ] Do Not Cache

- [ ] **Decision:** Do not cache personal data (age, income, health)
  - [ ] Implement: Only cache aggregated plan data
  - [ ] No PII in Redis or PostgreSQL cache tables

- [ ] **GDPR Compliance (if EU users):**
  - [ ] Privacy policy created
  - [ ] Cookie consent implemented
  - [ ] Data deletion capability
  - [ ] Data export capability

- [ ] **HIPAA Compliance (if handling PHI):**
  - [ ] Determine if HIPAA applies: [ ] Yes [ ] No
  - [ ] If yes, consult HIPAA attorney
  - [ ] BAA agreements with hosting providers

---

### 10. Terms of Service Monitoring

**Status:** 🔧 TO BE IMPLEMENTED

- [ ] **Quarterly Review Process:**
  - [ ] Create calendar reminder: Every 3 months
  - [ ] Assign owner: __________
  - [ ] Review checklist:
    - [ ] CMS Healthcare.gov ToS changes
    - [ ] HCCI HealthPrices.org ToS changes
    - [ ] RWJF license updates
    - [ ] New data sources added

- [ ] **Change Detection:**
  - [ ] Subscribe to API provider newsletters
  - [ ] Monitor GitHub repositories for license changes
  - [ ] Check for ToS version updates

- [ ] **Response Plan:**
  - [ ] If ToS changes to prohibit our use:
    - [ ] Immediately stop using data source
    - [ ] Activate fallback data source
    - [ ] Notify users of data source change
    - [ ] Update attribution

---

## Disclaimers & User Communication

### 11. Required Disclaimers

**Status:** 🔧 TO BE IMPLEMENTED

- [ ] **Plan Accuracy Disclaimer:**
  > "Plan information is provided by [DATA SOURCE] and may not reflect the most current details. Always verify plan information directly with the insurance provider before making enrollment decisions."

- [ ] **Cost Estimate Disclaimer:**
  > "Cost estimates are based on average data and your actual costs may vary. These estimates are for informational purposes only and do not guarantee specific costs or savings."

- [ ] **Not Financial/Medical Advice:**
  > "This tool provides educational information only and does not constitute financial, medical, or insurance advice. Consult with a licensed insurance agent or financial advisor before making insurance decisions."

- [ ] **Data Currency:**
  > "Data last updated: [DATE]. Insurance plans and costs change frequently."

- [ ] **Display Locations:**
  - [ ] Footer of every page
  - [ ] Cost comparison results page
  - [ ] About page
  - [ ] Terms of Service
  - [ ] Privacy Policy

---

## Compliance Audit Log

### 12. Quarterly Audit Checklist

**Next Audit Date:** [3 months from today]

- [ ] **Q1 Audit (January-March):**
  - [ ] Review all data source ToS
  - [ ] Verify attributions displayed correctly
  - [ ] Test commercial use checks
  - [ ] Update disclaimer text if needed
  - [ ] Document any changes

- [ ] **Q2 Audit (April-June):**
  - [ ] Same as Q1

- [ ] **Q3 Audit (July-September):**
  - [ ] Same as Q1

- [ ] **Q4 Audit (October-December):**
  - [ ] Same as Q1
  - [ ] Annual legal review

**Audit Owner:** __________
**Legal Counsel:** __________

---

## Risk Assessment Summary

### Current Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|------------|
| RWJF commercial violation | 🔴 High | 🔴 High (if commercial) | Decide now: commercial or not? |
| Missing attributions | 🟡 Medium | 🟡 Medium | Automated attribution injection |
| ToS changes unnoticed | 🟡 Medium | 🟡 Medium | Quarterly monitoring process |
| Data accuracy issues | 🟡 Medium | 🟢 Low | Cross-validation, disclaimers |
| HCCI commercial restriction | 🟡 Medium | 🟡 Medium | Verify current ToS |

---

## Legal Sign-Off

### Pre-Production Approval

**Before deploying to production, obtain sign-off:**

- [ ] **Legal Counsel Review:**
  - Attorney Name: __________
  - Date Reviewed: __________
  - Approval: [ ] Approved [ ] Approved with conditions [ ] Not approved
  - Conditions: __________

- [ ] **Business Model Confirmed:**
  - [ ] Non-commercial (can use RWJF)
  - [ ] Commercial (cannot use RWJF)

- [ ] **All Attributions Implemented:**
  - [ ] CMS attribution verified
  - [ ] HCCI attribution verified
  - [ ] RWJF attribution verified (if applicable)

- [ ] **Disclaimers Displayed:**
  - [ ] Plan accuracy disclaimer
  - [ ] Cost estimate disclaimer
  - [ ] Not advice disclaimer

- [ ] **Monitoring Established:**
  - [ ] Quarterly ToS review scheduled
  - [ ] Owner assigned

**Final Approval:**

Signature: ______________________ Date: __________
Name: __________________________
Title: __________________________

---

## Appendix: Contact Information

### Data Source Support

**CMS Healthcare.gov:**
- Developer Support: https://www.healthcare.gov/developers/
- Email: marketplace-api@cms.hhs.gov (verify current)

**HCCI HealthPrices.org:**
- Website: https://healthprices.org
- Support: [Find current contact]

**RWJF HIX Compare:**
- Website: https://www.rwjf.org
- Research Contact: [Find current contact]

**Legal Resources:**
- American Bar Association: https://www.americanbar.org
- Find an Attorney: [Local bar association]

---

## Document Control

**Document Owner:** Legal/Compliance Team
**Last Updated:** October 30, 2025
**Next Review:** Quarterly
**Version:** 1.0.0
**Approved By:** [PENDING]
