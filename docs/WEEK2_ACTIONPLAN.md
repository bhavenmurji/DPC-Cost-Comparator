# Week 2 Action Plan - DPC Cost Comparator

**Status**: Architecture Analysis Complete  
**Generated**: October 30, 2025  
**Prepared For**: Development Team

---

## Executive Summary

The DPC Cost Comparator project has a working MVP with excellent cost comparison logic ($1,675 savings demo confirmed) but needs to consolidate architecture and complete three critical features:

1. **Fix broken build** (1 hour) 🔴 CRITICAL
2. **Remove dual architecture** (5 hours) 🔴 CRITICAL  
3. **Implement provider matching** (10 hours) 🟠 HIGH
4. **Connect frontend to backend** (8 hours) 🟠 HIGH
5. **Add scenario persistence** (8 hours) 🟠 HIGH

**Total Effort**: 32-42 hours across the week  
**Target**: 70-80% production readiness by Friday EOD

---

## Issue Severity Summary

```
CRITICAL (Fix Immediately):
  🔴 Build fails on npm run build
  🔴 Two competing project structures (src/ vs apps/)
  🔴 Database schema mismatch (raw SQL vs Prisma)

HIGH (Complete This Week):
  🟠 Provider matching stubbed (only shows [])
  🟠 Frontend forms don't connect to backend
  🟠 Scenario save/load all return 501
  
MEDIUM (Should Complete):
  🟡 No input validation on API endpoints
  🟡 Session management not implemented
  🟡 Hardcoded cost assumptions
  
LOW (Next Sprint):
  🟢 Email notifications not implemented
  🟢 Healthcare API integration pending
  🟢 Real provider database not populated
```

---

## Daily Breakdown

### Monday - Architecture Fix
**Goal**: Clean build, no dual structures  
**Tasks**:
1. Delete `/apps/` folder completely
2. Update `/package.json` (remove workspaces config)
3. Verify `npm run build` completes without errors
4. Commit changes with message: "refactor: consolidate to src/ structure"
5. Verify all tests still pass

**Deliverables**:
- [ ] Working `npm run build`
- [ ] No TypeScript errors
- [ ] All unit tests passing
- [ ] Git commit with consolidation

**Estimated Time**: 6-8 hours

**Risk**: None if done carefully - just deletion and config update

---

### Tuesday - Provider Matching
**Goal**: Working provider search and matching  
**Tasks**:
1. Create `/src/backend/services/providerMatching.service.ts`
   - Geographic search (postal code proximity)
   - Service matching algorithm
   - Quality scoring (0-100 based on distance/match)
   
2. Update `/src/backend/routes/costComparison.routes.ts`
   - Remove TODO comment
   - Call matching service
   - Return provider results
   
3. Populate sample providers in database
   - At least 10 providers with various ZIP codes
   - Include service details and ratings
   
4. Test endpoint returns 3-5 providers per calculation

**Deliverables**:
- [ ] Provider matching service implemented
- [ ] API endpoint returns providers
- [ ] Test cases for matching algorithm
- [ ] Sample providers in database
- [ ] Performance <500ms for provider search

**Estimated Time**: 8-10 hours

**Code Location**: `/src/backend/services/providerMatching.service.ts` (new file)

---

### Wednesday - Frontend Integration (Part 1)
**Goal**: Forms communicate with backend  
**Tasks**:
1. Create `/src/frontend/lib/api.ts`
   - API client with fetch/axios
   - Type-safe endpoints
   - Error handling
   - Loading state management
   
2. Update `/src/frontend/components/insurance-form.tsx`
   - Add submit handler
   - Call `/api/v1/cost-comparison/calculate`
   - Display results
   - Show errors/loading
   
3. Update `/src/frontend/components/usage-form.tsx`
   - Add submit handler
   - Integrate with flow
   
4. Update `/src/frontend/components/profile-form.tsx`
   - Add submit handler
   - Save user profile

**Deliverables**:
- [ ] API client library working
- [ ] Insurance form submits to backend
- [ ] Usage form submits to backend
- [ ] Profile form submits to backend
- [ ] Error boundaries in place
- [ ] Loading states visible

**Estimated Time**: 6-8 hours

**Files to Modify**:
- `/src/frontend/lib/api.ts` (create new)
- `/src/frontend/components/insurance-form.tsx`
- `/src/frontend/components/usage-form.tsx`
- `/src/frontend/components/profile-form.tsx`

---

### Thursday - Scenario Persistence
**Goal**: Users can save/load comparisons  
**Tasks**:
1. Implement POST `/api/v1/cost-comparison/scenarios`
   - Save comparison calculation
   - Link to authenticated user
   - Store all inputs and results
   
2. Implement GET `/api/v1/cost-comparison/scenarios/:id`
   - Retrieve saved scenario
   - Verify user ownership
   
3. Implement PATCH `/api/v1/cost-comparison/scenarios/:id`
   - Update scenario
   - Recalculate if needed
   
4. Implement DELETE `/api/v1/cost-comparison/scenarios/:id`
   - Soft delete (HIPAA compliance)
   
5. Add list view UI in frontend
   - Show saved scenarios
   - Allow load/delete/edit

**Deliverables**:
- [ ] All 4 CRUD endpoints working
- [ ] Authentication checked on all routes
- [ ] Frontend shows scenario list
- [ ] Can load/edit/delete scenarios
- [ ] Soft delete audit trail
- [ ] Database queries optimize

**Estimated Time**: 6-8 hours

**Files to Modify**:
- `/src/backend/routes/costComparison.routes.ts` (update)
- `/src/backend/models/` (add scenario methods if needed)
- `/src/frontend/` (add scenario management UI)

---

### Friday - Polish & Testing
**Goal**: Production readiness, thorough testing  
**Tasks**:
1. Add input validation (Zod schemas)
   - All API endpoints have validation
   - Return 400 on invalid input
   - Document request formats
   
2. Testing sweep
   - Unit tests all passing
   - Integration tests working
   - E2E test coverage
   - HIPAA tests still passing
   
3. Performance verification
   - Cost calculation <100ms
   - API response <500ms
   - Provider search <500ms
   - Page load <3s
   
4. Security verification
   - No secrets in logs
   - CORS properly configured
   - Rate limiting working
   - Authentication required
   
5. Documentation
   - API endpoints documented
   - Deployment guide updated
   - README with setup instructions

**Deliverables**:
- [ ] Input validation complete
- [ ] All tests passing (>80% coverage)
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation current
- [ ] Ready for deployment

**Estimated Time**: 6-8 hours

---

## Success Criteria Checklist

### Code Quality
- [ ] `npm run build` completes without warnings
- [ ] `npm run test` - all tests passing
- [ ] `npm run lint` - no errors
- [ ] `npm run test:coverage` - >80% coverage
- [ ] No TypeScript errors

### Functionality
- [ ] Cost comparison endpoint working (existing)
- [ ] Provider matching returns 3-5 providers
- [ ] Frontend forms submit successfully
- [ ] Results display in comparison dashboard
- [ ] Users can save comparison scenarios
- [ ] Users can load saved scenarios
- [ ] Users can update scenarios
- [ ] Users can delete scenarios

### Performance
- [ ] Cost calculation <100ms
- [ ] Provider search <500ms (10 providers)
- [ ] API response time <500ms average
- [ ] Database queries <200ms average
- [ ] Page load time <3s

### Security
- [ ] HIPAA compliance tests passing
- [ ] No sensitive data in logs
- [ ] Input validation on all endpoints
- [ ] Rate limiting working (100 req/15min)
- [ ] Authentication required for protected routes
- [ ] CORS origin validation
- [ ] JWT tokens properly validated

### User Experience
- [ ] Forms visually polished
- [ ] Error messages clear and helpful
- [ ] Loading states visible during API calls
- [ ] Mobile responsive (tested on mobile)
- [ ] Accessibility (WCAG 2.1 AA level)
- [ ] Smooth navigation between screens

### Deployment Readiness
- [ ] render.yaml verified and correct
- [ ] .env.example complete and accurate
- [ ] All required environment variables documented
- [ ] Database schema migrations working
- [ ] Build and start scripts verified
- [ ] Health check endpoint working

---

## Resource Requirements

### Development
- 1 Senior developer: 32-40 hours
- OR 2 Developers: 16-20 hours each
- Pair programming on complex parts recommended

### Testing
- QA person recommended for security/HIPAA verification
- Automated testing covers most scenarios

### Deployment
- 1 DevOps/full-stack person for final deployment
- Render free tier sufficient for MVP

---

## Risk Mitigation

### High Risk Items

**1. Architecture Consolidation (Monday)**
- **Risk**: Breaking changes when deleting apps/
- **Mitigation**: Create backup branch first, careful review
- **Fallback**: Revert to previous commit if needed

**2. Provider Matching Algorithm**
- **Risk**: Complex geographic/service matching
- **Mitigation**: Start simple (distance only), iterate
- **Fallback**: Use fixed test providers for demo

**3. Frontend-Backend Integration**
- **Risk**: Type mismatches, API contract changes
- **Mitigation**: Use TypeScript, test both sides
- **Fallback**: Mock API for frontend development

**4. Database Changes**
- **Risk**: Breaking existing data in production
- **Mitigation**: Use migration scripts, test locally first
- **Fallback**: Keep previous schema version as fallback

---

## Daily Standup Template

```
What did we accomplish today?
- [ ] Completed task X
- [ ] Completed task Y

What's blocking us?
- [ ] Issue Z (resolution time: X hours)

What's next?
- [ ] Task A (estimated: X hours)
- [ ] Task B (estimated: X hours)

Confidence level for week completion: X/10
```

---

## Code Review Checklist

### Before Merging Each PR:
- [ ] All tests passing locally
- [ ] No TypeScript errors
- [ ] No console.logs or debugging code
- [ ] Security: no hardcoded secrets
- [ ] Performance: no unnecessary API calls
- [ ] Documentation: comments on complex logic
- [ ] Git: clean commit history, clear messages

### Before Merge to Main:
- [ ] All tests passing in CI/CD
- [ ] Code review approval from 1+ team member
- [ ] Security review if changing auth/data handling
- [ ] Performance impact assessed
- [ ] HIPAA compliance reviewed if handling PHI

---

## Deployment Timeline

**Post-Week 2**:
```
Friday EOD:
- Code freeze for Week 2 features
- Final testing and QA
- Deploy to staging environment
- Run smoke tests

Saturday:
- Monitor staging
- Performance verification
- Final security audit

Sunday:
- Prepare production deployment guide
- Create rollback plan

Monday (Week 3):
- Production deployment
- Monitor for issues
- Support end-users
```

---

## Communication Plan

### Daily Updates
- Morning standup: 10:00 AM (15 min)
- End-of-day status: Slack update
- Blockers: Escalate immediately

### Mid-Week Check-in
- Wednesday EOD: Progress review
- Adjust priorities if needed
- Update timeline if risks realized

### End-of-Week Demo
- Friday EOD: Working features demo
- Show all 5 critical features
- Discuss next steps for Week 3

---

## Success Outcome

By end of Week 2, the project will have:

✅ **Consolidated architecture** - Single codebase, no duplication  
✅ **Building cleanly** - `npm run build` passes  
✅ **Cost comparison working** - Including provider matching  
✅ **Full UI integration** - Forms submit to backend  
✅ **Scenario management** - Users can save/load comparisons  
✅ **Production-ready** - 70-80% deployment readiness  

**Key Achievement**: End-to-end feature complete from form submission through results display with provider recommendations and scenario saving.

---

## Post-Week 2 (Week 3 Priority)

1. **Healthcare API Integration** (12-16 hours)
   - Integrate Ribbon Health or Turquoise Health API
   - Real insurance plan data
   - Real provider directory

2. **Session Management** (4-6 hours)
   - Redis session store
   - Persistent user sessions
   - Auto-logout functionality

3. **Email Notifications** (4-6 hours)
   - SendGrid integration
   - Password reset
   - Email verification

4. **Advanced Features** (8-10 hours)
   - Provider ratings/reviews
   - Comparison sharing
   - Export to PDF

---

**Prepared by**: Architecture Analysis Bot  
**Date**: October 30, 2025  
**Version**: 1.0

For detailed architecture analysis, see: `/docs/ARCHITECTURE_ANALYSIS_WEEK2.md`  
For quick reference, see: `/docs/ARCHITECTURE_SUMMARY.md`
