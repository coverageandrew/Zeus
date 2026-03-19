# Phase Plan

> **Authority:** This document is owned exclusively by Company Head. All other agents have READ-ONLY access.

---

## 1. Global Phases Overview

| Phase | Name | Description |
|-------|------|-------------|
| 0 | Foundation | Repo setup, tooling, base configuration |
| 1 | Schema & Data | Database schema, migrations, seed data |
| 2 | API Layer | Endpoints, integrations, background jobs |
| 3 | UI Layer | Routes, components, forms |
| 4 | Integration | End-to-end flows, cross-department validation |
| 5 | QA & Hardening | Testing, security audit, performance |
| 6 | Deployment | CI/CD, staging, production release |

---

## 2. Phase Details

### Phase 0: Foundation

**Entry Criteria:**
- Company Head has approved PRODUCT_SPEC.md
- All SSoT documents are complete

**Exit Criteria:**
- [ ] Repo structure created per REPO_CONTRACT.md
- [ ] Package manager initialized
- [ ] Linting configured
- [ ] TypeScript configured
- [ ] Git initialized with branch strategy
- [ ] CI pipeline skeleton created

**Participating Departments:**
- Architecture (lead)
- QA & Security (review)

**Required Artifacts:**
- `package.json`
- `tsconfig.json`
- `.eslintrc` or equivalent
- `.gitignore`
- CI configuration file

**Handoff Requirements:**
- Architecture → QA & Security for tooling review
- Architecture → Company Head for phase completion

---

### Phase 1: Schema & Data

**Entry Criteria:**
- Phase 0 complete
- PRODUCT_SPEC.md user stories defined

**Exit Criteria:**
- [ ] All tables defined with migrations
- [ ] RLS policies implemented
- [ ] TypeScript types generated
- [ ] Seed data scripts created
- [ ] Schema documentation complete

**Participating Departments:**
- Data (lead)
- Architecture (support)
- QA & Security (review)

**Required Artifacts:**
- Migration files in `/supabase/migrations/` or equivalent
- Type definitions
- Seed scripts
- Schema documentation

**Handoff Requirements:**
- Data → API for endpoint development
- Data → UI for type consumption
- Data → QA & Security for RLS review

---

### Phase 2: API Layer

**Entry Criteria:**
- Phase 1 complete
- Schema types available

**Exit Criteria:**
- [ ] All endpoints implemented per INTERFACE_CONTRACT.md
- [ ] Authentication/authorization integrated
- [ ] Background jobs configured
- [ ] API documentation complete
- [ ] Integration tests passing

**Participating Departments:**
- API (lead)
- Data (support)
- QA & Security (review)

**Required Artifacts:**
- Endpoint files
- Auth middleware
- Job definitions
- API documentation
- Integration test files

**Handoff Requirements:**
- API → UI for frontend integration
- API → QA & Security for security review

---

### Phase 3: UI Layer

**Entry Criteria:**
- Phase 2 complete (or mock API available)
- Types available from Phase 1

**Exit Criteria:**
- [ ] All routes implemented
- [ ] Components built and documented
- [ ] Forms with validation
- [ ] UI connected to API
- [ ] Responsive design verified

**Participating Departments:**
- UI (lead)
- API (support)
- QA & Security (review)

**Required Artifacts:**
- Route files
- Component files
- Form components
- Style files
- Component documentation

**Handoff Requirements:**
- UI → QA & Security for testing
- UI → Architecture for build verification

---

### Phase 4: Integration

**Entry Criteria:**
- Phases 1-3 complete

**Exit Criteria:**
- [ ] End-to-end flows working
- [ ] Cross-department interfaces validated
- [ ] Data flows verified
- [ ] Error handling complete
- [ ] Integration tests passing

**Participating Departments:**
- All departments participate
- Company Head coordinates

**Required Artifacts:**
- Integration test results
- Flow documentation
- Error handling documentation

**Handoff Requirements:**
- All departments → QA & Security for final testing
- All departments → Company Head for phase review

---

### Phase 5: QA & Hardening

**Entry Criteria:**
- Phase 4 complete

**Exit Criteria:**
- [ ] Unit test coverage meets threshold
- [ ] Integration tests passing
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Accessibility verified
- [ ] All critical/high bugs resolved

**Participating Departments:**
- QA & Security (lead)
- All departments (support for fixes)

**Required Artifacts:**
- Test coverage report
- Security audit report
- Performance report
- Bug fix evidence

**Handoff Requirements:**
- QA & Security → Architecture for deployment prep
- QA & Security → Company Head for release approval

---

### Phase 6: Deployment

**Entry Criteria:**
- Phase 5 complete
- Company Head release approval

**Exit Criteria:**
- [ ] CI/CD pipeline complete
- [ ] Staging deployment successful
- [ ] Staging verification complete
- [ ] Production deployment successful
- [ ] Monitoring configured
- [ ] Rollback plan documented

**Participating Departments:**
- Architecture (lead)
- QA & Security (verification)
- Company Head (approval)

**Required Artifacts:**
- CI/CD configuration
- Deployment scripts
- Monitoring configuration
- Rollback documentation

**Handoff Requirements:**
- Architecture → Company Head for final sign-off

---

## 3. Phase Transition Requirements

### Transition Checklist

Before moving to next phase:

1. [ ] All exit criteria met
2. [ ] All required artifacts created
3. [ ] All handoffs completed
4. [ ] Department Head sign-offs obtained
5. [ ] Company Head approval logged
6. [ ] Phase transition logged in `/logs/company/`

### Transition Log Format

```markdown
## Phase Transition: [N] → [N+1]

**Date:** [YYYY-MM-DD]
**Approved By:** Company Head

**Exit Criteria Status:**
- [x] Criterion 1
- [x] Criterion 2

**Artifacts Verified:**
- [artifact 1]: [location]
- [artifact 2]: [location]

**Department Sign-offs:**
- [Department 1]: [date]
- [Department 2]: [date]

**Notes:**
[any relevant notes]
```

---

## 4. Phase Gating

### Gate Types

| Gate | Description | Enforced By |
|------|-------------|-------------|
| Entry Gate | Prerequisites before starting phase | Company Head |
| Exit Gate | Requirements before completing phase | Company Head |
| Quality Gate | Quality checks during phase | QA & Security |
| Handoff Gate | Requirements for inter-department handoff | Department Heads |

### Gate Failure Handling

If a gate fails:

1. **Log** the failure with details
2. **Identify** blocking issues
3. **Assign** remediation tasks
4. **Re-attempt** gate after fixes
5. **Escalate** to Company Head if repeated failures

---

*Version: 1.0.0*
*Last Updated: 2026-01-31*
*Owner: Company Head*
