# Agent Registry

> **Authority:** This document is owned exclusively by Company Head. All other agents have READ-ONLY access.

---

## 1. Agent Index by Department

### Executive Level (Pre-Project)

| Agent | File Path | Status |
|-------|-----------|--------|
| Project Intake Agent | `/agents/project_intake_agent.md` | Active |

### Company Level

| Agent | File Path | Status |
|-------|-----------|--------|
| Company Head | `/agents/company_head.md` | Active |

### Architecture Department

| Agent | File Path | Status |
|-------|-----------|--------|
| Architecture Department Head | `/departments/architecture/department_head.md` | Active |
| Scaffolder Agent | `/departments/architecture/agents/scaffolder_agent.md` | Active |
| CI Agent | `/departments/architecture/agents/ci_agent.md` | Active |
| Deploy Agent | `/departments/architecture/agents/deploy_agent.md` | Active |

### Data Department

| Agent | File Path | Status |
|-------|-----------|--------|
| Data Department Head | `/departments/data/department_head.md` | Active |
| Schema Agent | `/departments/data/agents/schema_agent.md` | Active |
| RLS Agent | `/departments/data/agents/rls_agent.md` | Active |
| Seed Agent | `/departments/data/agents/seed_agent.md` | Active |

### API Department

| Agent | File Path | Status |
|-------|-----------|--------|
| API Department Head | `/departments/api/department_head.md` | Active |
| Endpoint Agent | `/departments/api/agents/endpoint_agent.md` | Active |
| Integration Agent | `/departments/api/agents/integration_agent.md` | Active |
| Background Jobs Agent | `/departments/api/agents/background_jobs_agent.md` | Active |

### UI Department

| Agent | File Path | Status |
|-------|-----------|--------|
| UI Department Head | `/departments/ui/department_head.md` | Active |
| Routes Agent | `/departments/ui/agents/routes_agent.md` | Active |
| Components Agent | `/departments/ui/agents/components_agent.md` | Active |
| Forms Agent | `/departments/ui/agents/forms_agent.md` | Active |
| Performance Agent | `/departments/ui/agents/performance_agent.md` | Active |

### QA & Security Department

| Agent | File Path | Status |
|-------|-----------|--------|
| QA & Security Department Head | `/departments/qa_security/department_head.md` | Active |
| Test Agent | `/departments/qa_security/agents/test_agent.md` | Active |
| Security Agent | `/departments/qa_security/agents/security_agent.md` | Active |
| Regression Agent | `/departments/qa_security/agents/regression_agent.md` | Active |
| Performance Agent | `/departments/qa_security/agents/performance_agent.md` | Active |

---

## 2. Skills Matrix

### Company Level

| Agent | Required Skills |
|-------|-----------------|
| Company Head | `feature-orchestrator`, `verification-final-report` |

### Architecture Department

| Agent | Required Skills |
|-------|-----------------|
| Department Head | `verification-patterns` |
| Scaffolder Agent | `nextjs-project-setup`, `nextjs-scaffolding`, `typescript-configuration`, `tailwind-setup`, `shadcn-ui-setup`, `eslint-prettier-config`, `git-configuration`, `environment-variables`, `supabase-client-setup` |
| CI Agent | `local-validation`, `pre-commit-hooks`, `quality-gates`, `test-runner-config` |
| Deploy Agent | `vercel-deployment`, `environment-management`, `rollback-procedures` |

### Data Department

| Agent | Required Skills |
|-------|-----------------|
| Department Head | `verification-final-report` |
| Schema Agent | `schema-trace`, `supabase-patterns`, `zod-validation`, `database-migrations` |
| RLS Agent | `supabase-patterns`, `auth-locked`, `schema-trace` |
| Seed Agent | `schema-trace`, `supabase-patterns`, `zod-validation`, `data-seeding` |

### API Department

| Agent | Required Skills |
|-------|-----------------|
| Department Head | `verification-final-report` |
| Endpoint Agent | `integration-contracts`, `schema-trace`, `zod-validation`, `api-documentation`, `api-caching`, `api-error-handling`, `api-rate-limiting`, `api-versioning` |
| Integration Agent | `integration-contracts`, `schema-trace`, `third-party-integrations` |
| Background Jobs Agent | `integration-contracts`, `schema-trace`, `supabase-patterns` |

### UI Department

| Agent | Required Skills |
|-------|-----------------|
| Department Head | `staging-ui-first`, `auth-locked`, `verification-final-report`, `accessibility-patterns` |
| Routes Agent | `staging-ui-first`, `auth-locked`, `responsive-design` |
| Components Agent | `staging-ui-first`, `auth-locked`, `accessibility-patterns`, `responsive-design` |
| Forms Agent | `staging-ui-first`, `auth-locked`, `playwright-testing` |
| Performance Agent | `playwright-testing`, `responsive-design` |

### QA & Security Department

| Agent | Required Skills |
|-------|-----------------|
| Department Head | `debug`, `verification-final-report`, `auth-locked`, `performance-testing`, `quality-gate-management`, `audit-trail-management` |
| Test Agent | `debug`, `verification-final-report`, `testing-patterns`, `auth-locked`, `workflow-documentation`, `test-data-management`, `test-environment-setup`, `test-coverage-analysis`, `test-automation-cicd` |
| Security Agent | `auth-locked`, `debug`, `security-scanning`, `penetration-testing`, `security-policy-management`, `incident-response` |
| Regression Agent | `debug`, `verification-final-report`, `testing-patterns`, `test-suite-management`, `baseline-management` |
| Performance Agent | `performance-testing`, `debug`, `verification-final-report`, `performance-monitoring`, `performance-budgeting` |

---

## 3. Approval Hierarchy ("Who Approves Whom")

```
Company Head
    │
    ├── Approves: All Department Heads
    ├── Approves: All CRs (final authority)
    ├── Approves: Phase transitions
    ├── Approves: New agent creation
    │
    └── Department Heads
            │
            ├── Validate: Own sub-agents' work
            ├── Approve: Task completion (within department)
            ├── Escalate: CRs to Company Head
            ├── Authorize: Task splits (with CR for new agents)
            │
            └── Sub-Agents
                    │
                    ├── Execute: Assigned tasks
                    ├── Submit: Work to Department Head
                    └── Request: CRs through Department Head
```

### Approval Matrix

| Action | Sub-Agent | Dept Head | Company Head |
|--------|-----------|-----------|--------------|
| Execute task | ✅ | - | - |
| Validate task | - | ✅ | - |
| Approve task completion | - | ✅ | - |
| Submit CR | ✅ (create) | ✅ (validate & escalate) | ✅ (decide) |
| Apply SSoT change | ❌ | ❌ | ✅ |
| Split failed task | ❌ | ✅ (initiate) | ✅ (approve new agent) |
| Create new agent | ❌ | ❌ | ✅ |
| Transition phase | ❌ | ❌ | ✅ |
| Override quality gate | ❌ | ❌ | ✅ |

---

## 4. Agent Stop Conditions (Summary)

| Agent Type | Stop When |
|------------|-----------|
| All Agents | Missing skill file, unknown path, ambiguous instruction |
| Sub-Agents | 2 consecutive failures (escalate to Dept Head) |
| Dept Heads | Cannot resolve sub-agent failure, cross-dept conflict |
| Company Head | Critical blocker, security issue, SSoT conflict |

---

## 5. Agent Creation Log

| Date | Agent | Department | Created By | Reason |
|------|-------|------------|------------|--------|
| 2026-01-31 | (initial roster) | All | Company Head | Framework initialization |

---

## 6. Dynamically Created Agents

> This section tracks agents created via the Task Failure Escalation Rule.

| Date | Agent | Department | Original Task | Split From | CR ID |
|------|-------|------------|---------------|------------|-------|
| - | - | - | - | - | - |

---

*Version: 1.0.0*
*Last Updated: 2026-01-31*
*Owner: Company Head*
