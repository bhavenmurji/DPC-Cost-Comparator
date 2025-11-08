# Implementation Priority Matrix
## DPC Cost Comparator - Data Integration Phases

**Date:** October 30, 2025
**Status:** Planning Phase

---

## Priority Scoring System

**Impact Scores (1-5):**
- 5: Critical for core functionality
- 4: High value to users
- 3: Moderate improvement
- 2: Nice to have
- 1: Low value

**Effort Scores (1-5):**
- 1: 1-3 days
- 2: 4-7 days
- 3: 1-2 weeks
- 4: 2-4 weeks
- 5: 4+ weeks

**Priority Score = Impact × (6 - Effort)**
Higher score = Higher priority

---

## Phase 1: Foundation (Weeks 1-3)

### P0: Critical Tasks

| Task | Impact | Effort | Score | Owner | Status |
|------|--------|--------|-------|-------|--------|
| HCCI API Integration | 5 | 2 | 20 | Backend | Not Started |
| CMS Catastrophic Plans API | 5 | 3 | 15 | Backend | Not Started |
| Redis Caching Layer | 4 | 2 | 16 | DevOps | Not Started |
| ZIP-to-County Resolver | 4 | 1 | 20 | Backend | Not Started |
| Data Normalization Layer | 5 | 2 | 20 | Backend | Not Started |
| Error Handling & Fallbacks | 4 | 2 | 16 | Backend | Not Started |

**Phase 1 Goals:**
- Replace 90% of hardcoded costs with real data
- Achieve < 2 second API response time
- Implement fallback mechanisms for reliability

---

## Phase 2: Core Integration (Weeks 4-7)

### P1: High Priority Tasks

| Task | Impact | Effort | Score | Owner | Status |
|------|--------|--------|-------|-------|--------|
| Full CMS API Integration (All Tiers) | 5 | 4 | 10 | Backend | Not Started |
| RWJF HIX Compare Data Loader | 3 | 3 | 9 | Backend | Not Started |
| Cross-Source Validation | 4 | 3 | 12 | QA | Not Started |
| Data Quality Scoring | 4 | 2 | 16 | Backend | Not Started |
| Subsidy Calculation Logic | 4 | 3 | 12 | Backend | Not Started |
| Database Schema Migration | 3 | 2 | 12 | DevOps | Not Started |
| Cache Warming Job | 3 | 2 | 12 | Backend | Not Started |

**Phase 2 Goals:**
- 100% of premium calculations use real data
- Data quality score > 95%
- Subsidy-aware cost comparisons

---

## Phase 3: Advanced Features (Weeks 8-10)

### P2: Medium Priority Tasks

| Task | Impact | Effort | Score | Owner | Status |
|------|--------|--------|-------|-------|--------|
| KFF Subsidy Estimator Logic | 3 | 3 | 9 | Backend | Not Started |
| Provider Network Matching | 3 | 4 | 6 | Backend | Not Started |
| Historical Trend Analysis | 2 | 3 | 6 | Data | Not Started |
| Geographic Cost Variation UI | 3 | 2 | 12 | Frontend | Not Started |
| "What-If" Scenario Modeling | 3 | 3 | 9 | Backend | Not Started |
| Data Export/Reporting | 2 | 2 | 8 | Backend | Not Started |

**Phase 3 Goals:**
- Enhanced user experience features
- Historical data insights
- Predictive modeling foundations

---

## Future Enhancements (Months 4+)

### P3: Low Priority / Future

| Task | Impact | Effort | Score | Owner | Status |
|------|--------|--------|-------|-------|--------|
| ML-Based Premium Forecasting | 3 | 5 | 3 | Data Science | Backlog |
| Ribbon Health API Integration | 2 | 4 | 4 | Backend | Backlog |
| Turquoise Health API (Paid) | 3 | 3 | 9 | Backend | Backlog |
| GitHub SBC Parser Integration | 2 | 5 | 2 | Backend | Backlog |
| Multi-State Family Comparison | 2 | 3 | 6 | Backend | Backlog |
| Mobile App Data Sync | 2 | 4 | 4 | Mobile | Backlog |

---

## Critical Path Analysis

### Blocking Dependencies

```
Phase 1 Foundation (3 weeks)
│
├─ HCCI Integration (Week 1)
│  └─ No dependencies
│
├─ CMS Catastrophic (Week 2)
│  └─ Requires: ZIP-to-County Resolver
│
└─ Redis Cache (Week 1-2)
   └─ No dependencies

Phase 2 Core (4 weeks)
│
├─ Full CMS Integration (Week 4-5)
│  └─ Requires: Phase 1 complete, Redis operational
│
├─ RWJF Data Loader (Week 6)
│  └─ Requires: CSV parser, legal review
│
└─ Data Validation (Week 7)
   └─ Requires: CMS + RWJF data available

Phase 3 Advanced (3 weeks)
│
├─ KFF Logic (Week 8)
│  └─ Requires: CMS data, FPL tables
│
├─ Network Matching (Week 9)
│  └─ Requires: Ribbon API access (optional)
│
└─ Trends (Week 10)
   └─ Requires: RWJF historical data
```

---

## Resource Allocation

### Team Structure (Recommended)

**Phase 1 (Weeks 1-3):**
- 1 Backend Developer (Full-time)
- 0.5 DevOps Engineer (Cache setup)
- 0.25 Legal Advisor (ToS review)

**Phase 2 (Weeks 4-7):**
- 1 Backend Developer (Full-time)
- 0.5 QA Engineer (Validation testing)
- 0.25 Data Engineer (RWJF processing)

**Phase 3 (Weeks 8-10):**
- 1 Backend Developer (0.75 time)
- 0.5 Frontend Developer (UI enhancements)
- 0.25 Data Analyst (Trends, forecasting)

**Total Effort:** ~10 person-weeks

---

## Risk-Adjusted Timeline

### Best Case (All Goes Well)
- Phase 1: 3 weeks
- Phase 2: 4 weeks
- Phase 3: 3 weeks
- **Total: 10 weeks**

### Expected Case (Minor Issues)
- Phase 1: 3.5 weeks
- Phase 2: 5 weeks
- Phase 3: 3.5 weeks
- **Total: 12 weeks**

### Worst Case (Significant Blockers)
- Phase 1: 4 weeks
- Phase 2: 6 weeks
- Phase 3: 4 weeks
- **Total: 14 weeks**

**Contingency Buffer:** Add 20% = ~14 weeks total

---

## Success Criteria by Phase

### Phase 1 Success Metrics
- [ ] 90% of cost calculations use real data
- [ ] API response time < 2 seconds (p95)
- [ ] Cache hit rate > 70%
- [ ] Zero hardcoded premium values
- [ ] Fallback mechanisms tested

### Phase 2 Success Metrics
- [ ] 100% of premium calculations use real data
- [ ] Data quality score > 95%
- [ ] Cross-validation within 5% margin
- [ ] Subsidy calculations accurate within $50/month
- [ ] All error scenarios handled

### Phase 3 Success Metrics
- [ ] Historical data available (5+ years)
- [ ] Network matching 80% accuracy
- [ ] User-facing "About Our Data" page
- [ ] Trend predictions within 10% of actual
- [ ] Complete API documentation

---

## Quick Reference: Task Breakdown

### Week 1: HCCI + Cache Setup
**Days 1-2:** HCCI API connector
**Days 3-4:** Redis cache implementation
**Day 5:** Integration testing

### Week 2: CMS Catastrophic Plans
**Days 1-2:** ZIP-to-county resolver
**Days 3-4:** CMS API connector (catastrophic only)
**Day 5:** Replace hardcoded premiums

### Week 3: Error Handling & Polish
**Days 1-2:** Fallback mechanisms
**Days 3-4:** Monitoring and logging
**Day 5:** Phase 1 testing and validation

### Week 4-5: Full CMS Integration
**Week 4:** Expand CMS connector to all tiers
**Week 5:** Subsidy calculation logic

### Week 6: RWJF Fallback
**Days 1-2:** CSV parser and data loader
**Days 3-4:** Fallback logic implementation
**Day 5:** Data freshness validation

### Week 7: Data Quality
**Days 1-3:** Cross-validation CMS vs RWJF
**Days 4-5:** Data quality scoring and reports

### Week 8: KFF Subsidy Logic
**Days 1-2:** FPL calculation algorithms
**Days 3-4:** Premium tax credit logic
**Day 5:** Cost-sharing reduction eligibility

### Week 9: Provider Networks (Optional)
**Days 1-2:** Ribbon API setup
**Days 3-4:** Network matching algorithms
**Day 5:** Testing and validation

### Week 10: Historical Trends
**Days 1-3:** RWJF historical data processing
**Days 4-5:** Trend analysis API endpoints

---

## Decision Points

### Week 2 Decision: RWJF Licensing
**Question:** Is DPC Cost Comparator commercial or public service?
**Impact:** Determines if RWJF data can be used
**Options:**
1. Non-commercial: Use RWJF freely
2. Commercial: Skip RWJF, use only CMS + HCCI
3. Hybrid: Use RWJF for MVP, license commercial data later

**Recommendation:** Decide before Week 6 implementation

### Week 4 Decision: Paid API Tiers
**Question:** Should we integrate paid APIs (Ribbon, Turquoise)?
**Impact:** Better data, higher costs
**Trigger:** If CMS + HCCI data insufficient
**Budget:** $500-2,000/month

**Recommendation:** Evaluate after Phase 2 completion

### Week 8 Decision: ML Forecasting
**Question:** Invest in machine learning for predictions?
**Impact:** Differentiation feature, high complexity
**Effort:** 4+ weeks additional
**ROI:** Uncertain until user validation

**Recommendation:** Defer to Phase 4 (post-MVP)

---

## Next Steps

1. **This Week:**
   - [ ] Legal review: RWJF licensing decision
   - [ ] API access: Register for CMS API key
   - [ ] Infrastructure: Set up Redis instance

2. **Sprint Planning:**
   - [ ] Create detailed user stories for Phase 1 tasks
   - [ ] Assign team members
   - [ ] Set up project tracking (Jira, GitHub Projects)

3. **Technical Setup:**
   - [ ] Create `/src/services/integration/` directory structure
   - [ ] Initialize database migrations
   - [ ] Set up monitoring and logging

---

**Document Owner:** Project Manager
**Last Updated:** October 30, 2025
**Next Review:** Weekly during implementation
