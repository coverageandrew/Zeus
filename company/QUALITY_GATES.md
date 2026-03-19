# Quality Gates

> **Authority:** This document is owned exclusively by Company Head. All other agents have READ-ONLY access.

---

## 1. Mandatory Checks Per Phase

### Phase 0: Foundation

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| Lint Config | `npm run lint` | No errors |
| TypeScript Config | `npm run typecheck` | No errors |
| Build | `npm run build` | Exit code 0 |
| Git Init | `git status` | Repo initialized |

### Phase 1: Schema & Data

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| Lint | `npm run lint` | No errors |
| TypeCheck | `npm run typecheck` | No errors |
| Migration Syntax | **[TBD - configured per project]** | Valid SQL |
| Type Generation | **[TBD - configured per project]** | Types generated |
| RLS Test | **[TBD - configured per project]** | Policies enforced |

### Phase 2: API Layer

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| Lint | `npm run lint` | No errors |
| TypeCheck | `npm run typecheck` | No errors |
| Build | `npm run build` | Exit code 0 |
| Unit Tests | `npm run test:unit` | All pass |
| Integration Tests | `npm run test:integration` | All pass |
| API Docs | **[TBD - configured per project]** | Docs generated |

### Phase 3: UI Layer

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| Lint | `npm run lint` | No errors |
| TypeCheck | `npm run typecheck` | No errors |
| Build | `npm run build` | Exit code 0 |
| Unit Tests | `npm run test:unit` | All pass |
| Component Tests | `npm run test:components` | All pass |
| Accessibility | **[TBD - configured per project]** | No critical issues |

### Phase 4: Integration

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| Lint | `npm run lint` | No errors |
| TypeCheck | `npm run typecheck` | No errors |
| Build | `npm run build` | Exit code 0 |
| All Tests | `npm run test` | All pass |
| E2E Tests | `npm run test:e2e` | All pass |

### Phase 5: QA & Hardening

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| All Previous Checks | (all above) | All pass |
| Coverage | `npm run test:coverage` | ≥ 80% |
| Security Scan | **[TBD - configured per project]** | No critical/high |
| Performance | **[TBD - configured per project]** | Meets benchmarks |
| Bundle Size | **[TBD - configured per project]** | Within limits |

### Phase 6: Deployment

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| All Previous Checks | (all above) | All pass |
| Staging Deploy | **[TBD - configured per project]** | Successful |
| Staging Smoke Test | **[TBD - configured per project]** | All pass |
| Production Deploy | **[TBD - configured per project]** | Successful |
| Production Smoke Test | **[TBD - configured per project]** | All pass |

---

## 2. Required Proof Format

### Command Execution Proof

```markdown
## Quality Gate Check: [Check Name]

**Phase:** [phase number]
**Date:** [YYYY-MM-DD HH:MM]
**Agent:** [agent name]

**Command:**
```bash
[exact command run]
```

**Working Directory:** [path]

**Exit Code:** [0/1/etc]

**Output Summary:**
[brief summary of output - success/failure, key metrics]

**Full Output:**
```
[truncated output or link to full log]
```

**Result:** ✅ PASS / ❌ FAIL

**Recorded In:** [log file path]
```

### Test Execution Proof

```markdown
## Test Suite: [Suite Name]

**Phase:** [phase number]
**Date:** [YYYY-MM-DD HH:MM]
**Agent:** [agent name]

**Command:**
```bash
[test command]
```

**Results:**
- Total: [N]
- Passed: [N]
- Failed: [N]
- Skipped: [N]

**Coverage:** [X%] (if applicable)

**Failed Tests:** (if any)
- [test name]: [failure reason]

**Result:** ✅ PASS / ❌ FAIL

**Recorded In:** [log file path]
```

---

## 3. Gate Failure Protocol

### On Failure

1. **Log** the failure immediately
   ```markdown
   ## GATE FAILURE: [Check Name]
   
   **Phase:** [N]
   **Date:** [timestamp]
   **Agent:** [name]
   **Error:** [description]
   **Output:** [relevant output]
   ```

2. **Analyze** root cause
3. **Create** remediation task
4. **Assign** to appropriate agent
5. **Re-run** check after fix
6. **Log** resolution

### Escalation Triggers

Escalate to Department Head if:
- Same check fails 2+ times
- Failure blocks other agents
- Root cause unclear

Escalate to Company Head if:
- Department cannot resolve
- Failure affects multiple departments
- Phase deadline at risk

---

## 4. Continuous Integration Requirements

### CI Pipeline Stages

```
┌─────────────┐
│   Trigger   │ (push/PR/manual)
└──────┬──────┘
       ▼
┌─────────────┐
│    Lint     │
└──────┬──────┘
       ▼
┌─────────────┐
│  TypeCheck  │
└──────┬──────┘
       ▼
┌─────────────┐
│    Build    │
└──────┬──────┘
       ▼
┌─────────────┐
│ Unit Tests  │
└──────┬──────┘
       ▼
┌─────────────┐
│ Integration │
└──────┬──────┘
       ▼
┌─────────────┐
│   Report    │
└─────────────┘
```

### CI Configuration Requirements

- All checks must run on every PR
- Main branch protected: all checks must pass
- Artifacts preserved for debugging
- Notifications on failure

---

## 5. Quality Metrics

### Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Test Coverage | 80% | 90% |
| Lint Errors | 0 | 0 |
| Type Errors | 0 | 0 |
| Build Time | < 5 min | < 2 min |
| Bundle Size | **[TBD - configured per project]** | **[TBD - configured per project]** |
| Lighthouse Score | 80 | 95 |

### Tracking

- Metrics recorded per phase
- Trends tracked over time
- Regressions flagged immediately

---

## 6. Evidence Storage

### Log Locations

| Evidence Type | Location |
|---------------|----------|
| Gate check results | `/logs/agents/<agent>/YYYY-MM-DD.md` |
| Department validations | `/logs/departments/<dept>/YYYY-MM-DD.md` |
| Phase transitions | `/logs/company/YYYY-MM-DD.md` |
| CI artifacts | **[TBD - configured per project]** |

### Retention

- Logs retained for minimum 90 days
- Critical failures retained indefinitely
- Phase transition logs retained indefinitely

---

## 7. Override Authority

### Emergency Override

In exceptional circumstances, Company Head may:
- Override a failing gate with documented rationale
- Defer a check to next phase with documented plan
- Accept reduced thresholds with risk acknowledgment

### Override Documentation

```markdown
## GATE OVERRIDE

**Date:** [YYYY-MM-DD]
**Authorized By:** Company Head
**Gate:** [check name]
**Phase:** [N]

**Reason:**
[why override is necessary]

**Risk Assessment:**
[what risks are accepted]

**Mitigation Plan:**
[how risks will be addressed]

**Expiration:**
[when normal gate requirements resume]
```

---

*Version: 1.0.0*
*Last Updated: 2026-01-31*
*Owner: Company Head*
